import { Hono } from "hono";
import type { GatewayDb } from "../lib/db";
import { logTransaction } from "../services/transaction-logger";
import { recordMetric } from "../services/metrics-collector";
import { calculateSplit } from "../lib/payment-splitter";
import type { Agent } from "@repo/db";

type Variables = {
  agent: Agent;
  paymentHeader: string;
  consumerWallet: string;
};

const PROXY_TIMEOUT_MS = 30_000;

/**
 * Proxies payment-verified requests to the creator's MCP endpoint.
 * Payment middleware must run before this route — sets agent, paymentHeader, consumerWallet.
 */
export function createInvokeRoute(db: GatewayDb) {
  const route = new Hono<{ Variables: Variables }>();

  route.all("/", async (c) => {
    const agent = c.get("agent");
    const paymentHeader = c.get("paymentHeader");
    const consumerWallet = c.get("consumerWallet") ?? paymentHeader;
    const startTime = Date.now();

    try {
      const { platformFee, creatorPayout } = calculateSplit(agent.pricePerCall);

      // Forward request to creator's MCP endpoint — strip sensitive headers
      const proxyHeaders = new Headers(c.req.raw.headers);
      proxyHeaders.delete("cookie");
      proxyHeaders.delete("authorization");
      proxyHeaders.delete("x-payment");
      proxyHeaders.set("X-Interns-Agent-Id", agent.id);

      const proxyResponse = await fetch(agent.mcpEndpoint, {
        method: c.req.method,
        headers: proxyHeaders,
        body: c.req.method !== "GET" ? await c.req.text() : undefined,
        signal: AbortSignal.timeout(PROXY_TIMEOUT_MS),
      });

      const latencyMs = Date.now() - startTime;

      // Fire-and-forget: log transaction and metrics without blocking response
      c.executionCtx.waitUntil(
        logTransaction(db, {
          agentId: agent.id,
          consumerWallet,
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
          consumerWallet,
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
          consumerWallet,
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
