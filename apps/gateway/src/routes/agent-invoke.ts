import type { Context } from "hono";
import type { GatewayDb } from "../lib/db";
import { logTransaction, logRefundTransaction } from "../services/transaction-logger";
import { recordMetric } from "../services/metrics-collector";
import { calculateSplit } from "../lib/payment-splitter";
import { parseJsonRpc } from "../lib/json-rpc-parser";
import { jsonRpcError } from "../lib/error-envelope";

const PROXY_TIMEOUT_MS = 30_000;

/**
 * Handles payment-verified MCP proxy requests.
 * Reads buffered body from context (set by body-buffer middleware in index.ts).
 * Supports both JSON and SSE (text/event-stream) responses from upstream.
 */
export async function handleInvoke(c: Context, db: GatewayDb) {
  const agent = c.get("agent");
  const paymentHeader = c.get("paymentHeader");
  const consumerWallet = c.get("consumerWallet") ?? paymentHeader;
  const settlementHash = c.get("settlementHash") ?? null;
  const startTime = Date.now();

  // Use buffered body from context (avoids double-read in Workers)
  const rawBody = c.get("rawBody") as string | undefined;

  // Parse JSON-RPC for method/tool tracking
  const parsed = rawBody ? parseJsonRpc(rawBody) : null;
  const toolName = parsed?.toolName ?? null;

  try {
    const { platformFee, creatorPayout } = calculateSplit(agent.pricePerCall);

    // Forward to creator's MCP endpoint — strip sensitive headers
    const proxyHeaders = new Headers(c.req.raw.headers);
    proxyHeaders.delete("cookie");
    proxyHeaders.delete("authorization");
    proxyHeaders.delete("x-payment");
    proxyHeaders.set("X-Interns-Agent-Id", agent.id);
    proxyHeaders.set("Content-Type", "application/json");

    const proxyResponse = await fetch(agent.mcpEndpoint, {
      method: c.req.method,
      headers: proxyHeaders,
      body: c.req.method !== "GET" ? rawBody : undefined,
      signal: AbortSignal.timeout(PROXY_TIMEOUT_MS),
    });

    const latencyMs = Date.now() - startTime;
    const contentType = proxyResponse.headers.get("content-type") ?? "";

    // Fire-and-forget: log transaction + metrics
    // Upstream 5xx = refund (payment taken but agent failed); otherwise completed
    const txnParams = {
      agentId: agent.id,
      consumerWallet,
      amount: agent.pricePerCall,
      platformFee,
      creatorPayout,
      paymentHash: settlementHash ?? paymentHeader,
    };
    const logFn = proxyResponse.status >= 500
      ? logRefundTransaction(db, txnParams)
      : logTransaction(db, { ...txnParams, status: proxyResponse.ok ? "completed" : "failed" });
    c.executionCtx.waitUntil(logFn);

    c.executionCtx.waitUntil(
      recordMetric(db, {
        agentId: agent.id,
        latencyMs,
        success: proxyResponse.ok,
        consumerWallet,
        toolName,
      }),
    );

    // SSE passthrough — pipe ReadableStream directly without buffering
    if (contentType.includes("text/event-stream")) {
      return new Response(proxyResponse.body, {
        status: proxyResponse.status,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Standard JSON response — passthrough
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
        toolName,
      }),
    );

    const rpcId = parsed?.id ?? null;

    if (error instanceof DOMException && error.name === "TimeoutError") {
      return c.json(jsonRpcError(rpcId, "GATEWAY_TIMEOUT", "Creator endpoint timeout"), 504);
    }
    return c.json(jsonRpcError(rpcId, "BAD_GATEWAY", "Creator endpoint unreachable"), 502);
  }
}
