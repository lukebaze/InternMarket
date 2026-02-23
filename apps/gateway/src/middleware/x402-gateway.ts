import type { Context, Next } from "hono";
import { getActiveAgent } from "../services/agent-lookup";
import type { GatewayDb } from "../lib/db";

// Custom 402 payment middleware implementing the x402 payment flow.
// When @x402/hono matures for CF Workers, replace internals with their SDK.
export function createPaymentMiddleware(db: GatewayDb, platformWallet: string) {
  return async (c: Context, next: Next) => {
    const agentId = c.req.param("agentId");
    if (!agentId) {
      return c.json({ error: "Agent ID required" }, 400);
    }

    // Reject non-UUID agent IDs early to avoid unnecessary DB lookups
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(agentId)) {
      return c.json({ error: "Invalid agent ID format" }, 400);
    }

    let agent;
    try {
      agent = await getActiveAgent(db, agentId);
    } catch {
      return c.json({ error: "Failed to resolve agent" }, 503);
    }

    if (!agent) {
      return c.json({ error: "Agent not found or inactive" }, 404);
    }

    const paymentHeader = c.req.header("X-PAYMENT");
    if (!paymentHeader) {
      // RFC-compliant 402: return payment requirements so clients know what to pay
      return c.json(
        {
          error: "Payment Required",
          paymentRequirements: {
            scheme: "x402",
            network: "base-sepolia",
            currency: "USDC",
            amount: agent.pricePerCall,
            payTo: platformWallet,
            agentId: agent.id,
            agentName: agent.name,
          },
        },
        402
      );
    }

    // TODO: verify payment with Coinbase facilitator once @x402 SDK is stable on Workers.
    // For MVP, accept any non-empty X-PAYMENT header and pass agent info downstream.
    c.set("agent", agent);
    c.set("paymentHeader", paymentHeader);

    await next();
  };
}
