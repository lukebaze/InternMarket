import { Hono } from "hono";
import { cors } from "hono/cors";
import { createDb } from "./lib/db";
import type { GatewayDb } from "./lib/db";
import { rateLimiter } from "./middleware/rate-limiter";
import { createPaymentMiddleware } from "./middleware/x402-gateway";
import { handleInvoke } from "./routes/agent-invoke";
import { handleAgentInfo } from "./routes/agent-info";
import { handleAgentDiscovery } from "./routes/agent-discovery";
import { createHealthRoute } from "./routes/health";
import { getActiveAgentBySlug } from "./services/agent-lookup";
import { handleHealthCheck } from "./cron/health-check";
import { handleMetricsAggregation } from "./cron/metrics-aggregation";
import { handleTrustRecalc } from "./cron/trust-recalc";
import type { Agent } from "@repo/db";

type Bindings = {
  DATABASE_URL: string;
  PLATFORM_WALLET: string;
  ENVIRONMENT: string;
  FACILITATOR_URL: string;
  NETWORK: string;
  ENABLE_TESTNET_FALLBACK?: string;
};

type Variables = {
  db: GatewayDb;
  agent: Agent;
  paymentHeader: string;
  consumerWallet: string;
  settlementHash: string | null;
  rawBody: string | undefined;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// CORS — allow marketplace frontend and local dev
app.use(
  "*",
  cors({
    origin: ["https://interns.market", "http://localhost:3000"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-PAYMENT"],
  }),
);

// Global rate limiter (per IP)
app.use("*", rateLimiter);

// Attach DB instance to context for all downstream handlers
app.use("*", async (c, next) => {
  const db = createDb(c.env.DATABASE_URL);
  c.set("db", db);
  await next();
});

// Body buffer middleware for invoke routes — read body once, reuse everywhere
app.use("/agents/:slug/invoke", async (c, next) => {
  if (c.req.method === "POST") {
    c.set("rawBody", await c.req.text());
  }
  await next();
});

// Health check
app.get("/health", async (c) => {
  const db = c.get("db");
  const healthRoute = createHealthRoute(db);
  return healthRoute.fetch(new Request(c.req.url), c.env, c.executionCtx);
});

// GET /agents — marketplace discovery (programmatic consumers)
app.get("/agents", async (c) => {
  const db = c.get("db");
  return handleAgentDiscovery(c, db);
});

// GET /agents/:slug — public agent info (no payment required)
app.get("/agents/:slug", async (c) => {
  const db = c.get("db");
  return handleAgentInfo(c, db);
});

// POST /agents/:slug/invoke — payment-gated MCP proxy
app.post("/agents/:slug/invoke", async (c) => {
  const db = c.get("db");
  const paymentMiddleware = createPaymentMiddleware(db, {
    platformWallet: c.env.PLATFORM_WALLET,
    facilitatorUrl: c.env.FACILITATOR_URL,
    network: c.env.NETWORK,
    enableTestnetFallback: c.env.ENABLE_TESTNET_FALLBACK === "true",
  });

  // Run payment middleware, then invoke handler
  let invokeResponse: Response | undefined;
  await paymentMiddleware(c, async () => {
    invokeResponse = await handleInvoke(c, db);
  });

  return invokeResponse ?? c.json({ error: "Payment required" }, 402);
});

// GET /agents/:slug/invoke — MCP SSE notification channel (no payment per spec)
// This is the server-initiated notification stream per MCP Streamable HTTP transport.
// No tool execution happens over GET — payment only required for POST (tools/call).
app.get("/agents/:slug/invoke", async (c) => {
  const db = c.get("db");
  const slug = c.req.param("slug");
  const agent = await getActiveAgentBySlug(db, slug);
  if (!agent) return c.json({ error: "Agent not found or inactive" }, 404);

  try {
    const proxyResponse = await fetch(agent.mcpEndpoint, {
      method: "GET",
      headers: { Accept: "text/event-stream" },
      signal: AbortSignal.timeout(30_000),
    });

    return new Response(proxyResponse.body, {
      status: proxyResponse.status,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return c.json({ error: "Agent SSE endpoint unreachable" }, 502);
  }
});

export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Bindings, ctx: ExecutionContext) {
    switch (event.cron) {
      case "*/5 * * * *":
        ctx.waitUntil(handleHealthCheck(env));
        break;
      case "0 * * * *":
        ctx.waitUntil(
          handleMetricsAggregation(env).then(() => handleTrustRecalc(env)),
        );
        break;
    }
  },
};
