import { Hono } from "hono";
import { cors } from "hono/cors";
import { createDb } from "./lib/db";
import type { GatewayDb } from "./lib/db";
import { rateLimiter } from "./middleware/rate-limiter";
import { createPaymentMiddleware } from "./middleware/x402-gateway";
import { createInvokeRoute } from "./routes/agent-invoke";
import { createInfoRoute } from "./routes/agent-info";
import { createHealthRoute } from "./routes/health";
import type { Agent } from "@repo/db";

type Bindings = {
  DATABASE_URL: string;
  PLATFORM_WALLET: string;
  ENVIRONMENT: string;
};

type Variables = {
  db: GatewayDb;
  agent: Agent;
  paymentHeader: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// CORS — allow marketplace frontend and local dev
app.use(
  "*",
  cors({
    origin: ["https://interns.market", "http://localhost:3000"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-PAYMENT"],
  })
);

// Global rate limiter (per IP)
app.use("*", rateLimiter);

// Attach DB instance to context for all downstream handlers
app.use("*", async (c, next) => {
  const db = createDb(c.env.DATABASE_URL);
  c.set("db", db);
  await next();
});

// Health check — wired with DB instance from context
app.get("/health", async (c) => {
  const db = c.get("db");
  const healthRoute = createHealthRoute(db);
  return healthRoute.fetch(new Request(c.req.url), c.env, c.executionCtx);
});

// GET /agents/:agentId — public agent info (no payment required)
app.get("/agents/:agentId", async (c) => {
  const db = c.get("db");
  const infoRoute = createInfoRoute(db);
  // Delegate to info route handler directly
  return infoRoute.fetch(
    new Request(c.req.url.replace(/\/agents\/[^/]+$/, "/")),
    c.env,
    c.executionCtx
  );
});

// POST /agents/:agentId/invoke — payment gated proxy to creator's MCP endpoint
app.all("/agents/:agentId/invoke", async (c, next) => {
  const db = c.get("db");
  // Apply payment middleware inline — checks X-PAYMENT header, sets agent on context
  const paymentMiddleware = createPaymentMiddleware(db, c.env.PLATFORM_WALLET);
  return paymentMiddleware(c, async () => {
    const invokeRoute = createInvokeRoute(db);
    // Route is mounted at "/" so strip the path prefix before delegating
    const url = new URL(c.req.url);
    url.pathname = "/";
    return invokeRoute.fetch(new Request(url.toString(), c.req.raw), c.env, c.executionCtx);
  });
});

export default app;
