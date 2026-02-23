import type { Context, Next } from "hono";
import { getActiveAgent } from "../services/agent-lookup";
import type { GatewayDb } from "../lib/db";

interface PaymentConfig {
  platformWallet: string;
  facilitatorUrl: string;
  network: string;
}

/**
 * x402 payment middleware: verifies X-PAYMENT header via facilitator.
 * Returns 402 with payment requirements if no valid payment proof.
 * Sets agent + consumerWallet on context when payment verified.
 */
export function createPaymentMiddleware(db: GatewayDb, config: PaymentConfig) {
  return async (c: Context, next: Next) => {
    const agentId = c.req.param("agentId");
    if (!agentId) return c.json({ error: "Agent ID required" }, 400);

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(agentId)) return c.json({ error: "Invalid agent ID format" }, 400);

    let agent;
    try {
      agent = await getActiveAgent(db, agentId);
    } catch {
      return c.json({ error: "Failed to resolve agent" }, 503);
    }

    if (!agent) return c.json({ error: "Agent not found or inactive" }, 404);

    const paymentHeader = c.req.header("X-PAYMENT");
    if (!paymentHeader) {
      return c.json({
        error: "Payment Required",
        paymentRequirements: {
          scheme: "x402",
          network: config.network,
          currency: "USDC",
          amount: agent.pricePerCall,
          payTo: config.platformWallet,
          facilitator: config.facilitatorUrl,
          agentId: agent.id,
          agentName: agent.name,
        },
      }, 402);
    }

    // Verify payment with facilitator
    try {
      const verified = await verifyPayment(paymentHeader, agent.pricePerCall, config);
      if (!verified.valid) {
        return c.json({
          error: "Payment verification failed",
          details: verified.error,
          paymentRequirements: {
            scheme: "x402",
            network: config.network,
            currency: "USDC",
            amount: agent.pricePerCall,
            payTo: config.platformWallet,
            facilitator: config.facilitatorUrl,
          },
        }, 402);
      }

      c.set("agent", agent);
      c.set("paymentHeader", paymentHeader);
      c.set("consumerWallet", verified.consumerWallet ?? paymentHeader);
    } catch {
      return c.json({ error: "Payment verification service unavailable" }, 503);
    }

    await next();
  };
}

interface VerifyResult {
  valid: boolean;
  consumerWallet?: string;
  error?: string;
}

/**
 * Verify X-PAYMENT via facilitator /verify endpoint.
 * On testnet: falls back to accepting header if facilitator unreachable.
 */
async function verifyPayment(
  paymentProof: string,
  expectedAmount: string,
  config: PaymentConfig,
): Promise<VerifyResult> {
  try {
    const res = await fetch(`${config.facilitatorUrl}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payment: paymentProof,
        expectedAmount,
        network: config.network,
        currency: "USDC",
        payTo: config.platformWallet,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (res.ok) {
      const data = await res.json() as { valid?: boolean; from?: string; error?: string };
      return { valid: !!data.valid, consumerWallet: data.from, error: data.error };
    }

    const errBody = await res.text().catch(() => "Unknown error");
    return { valid: false, error: `Facilitator error: ${res.status} ${errBody}` };
  } catch (err) {
    // On testnet, accept payment if facilitator is unreachable
    if (config.network.includes("sepolia")) {
      console.warn("[x402] Facilitator unreachable on testnet, accepting payment as-is");
      return { valid: true, consumerWallet: paymentProof };
    }
    throw err;
  }
}
