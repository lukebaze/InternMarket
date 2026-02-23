import { Hono } from "hono";
import type { GatewayDb } from "../lib/db";
import { logTransaction } from "../services/transaction-logger";
import { recordMetric } from "../services/metrics-collector";
import type { Agent } from "@repo/db";

type Variables = {
  agent: Agent;
  paymentHeader: string;
};

// Proxies authenticated requests to the creator's MCP endpoint.
// Payment middleware must run before this route sets agent + paymentHeader.
export function createInvokeRoute(db: GatewayDb) {
  const route = new Hono<{ Variables: Variables }>();

  route.all("/", async (c) => {
    const agent = c.get("agent");
    const paymentHeader = c.get("paymentHeader");
    const startTime = Date.now();

    try {
      // Split amount: 10% platform fee, 90% creator payout
      const amount = parseFloat(agent.pricePerCall);
      const platformFee = (amount * 0.1).toFixed(6);
      const creatorPayout = (amount * 0.9).toFixed(6);

      // Forward request to creator's MCP endpoint
      const proxyHeaders = new Headers(c.req.raw.headers);
      proxyHeaders.delete("cookie");
      proxyHeaders.delete("authorization");
      proxyHeaders.set("X-Interns-Agent-Id", agent.id);
      proxyHeaders.set("X-Interns-Consumer", paymentHeader);

      const proxyResponse = await fetch(agent.mcpEndpoint, {
        method: c.req.method,
        headers: proxyHeaders,
        body: c.req.method !== "GET" ? await c.req.text() : undefined,
        signal: AbortSignal.timeout(10_000),
      });

      const latencyMs = Date.now() - startTime;

      // Fire-and-forget: log transaction and metrics without blocking response
      c.executionCtx.waitUntil(
        logTransaction(db, {
          agentId: agent.id,
          consumerWallet: paymentHeader,
          amount: agent.pricePerCall,
          platformFee,
          creatorPayout,
          paymentHash: paymentHeader,
        })
      );

      c.executionCtx.waitUntil(
        recordMetric(db, {
          agentId: agent.id,
          latencyMs,
          success: proxyResponse.ok,
          consumerWallet: paymentHeader,
        })
      );

      return new Response(proxyResponse.body, {
        status: proxyResponse.status,
        headers: proxyResponse.headers,
      });
    } catch (error) {
      const latencyMs = Date.now() - startTime;

      c.executionCtx.waitUntil(
        recordMetric(db, {
          agentId: agent.id,
          latencyMs,
          success: false,
          consumerWallet: paymentHeader || "unknown",
        })
      );

      if (error instanceof DOMException && error.name === "TimeoutError") {
        return c.json({ error: "Creator endpoint timeout" }, 504);
      }
      return c.json({ error: "Creator endpoint unreachable" }, 502);
    }
  });

  return route;
}
