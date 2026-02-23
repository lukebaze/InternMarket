import type { Context, Next } from "hono";
import { getActiveAgentBySlug } from "../services/agent-lookup";
import { resolvePaymentConfig } from "../lib/x402-payment-config-resolver";
import type { GatewayDb } from "../lib/db";

interface PaymentConfig {
  platformWallet: string;
  facilitatorUrl: string;
  network: string;
  enableTestnetFallback?: boolean;
}

/**
 * x402 payment middleware: verifies X-PAYMENT header via facilitator.
 * Returns 402 with payment requirements if no valid payment proof.
 * Sets agent + consumerWallet + settlementHash on context when payment verified.
 * Expects slug-based routing: /agents/:slug/invoke
 */
export function createPaymentMiddleware(db: GatewayDb, config: PaymentConfig) {
  return async (c: Context, next: Next) => {
    const slug = c.req.param("slug");
    if (!slug) return c.json({ error: "Agent slug required" }, 400);

    let agent;
    try {
      agent = await getActiveAgentBySlug(db, slug);
    } catch {
      return c.json({ error: "Failed to resolve agent" }, 503);
    }

    if (!agent) return c.json({ error: "Agent not found or inactive" }, 404);

    const paymentHeader = c.req.header("X-PAYMENT");
    if (!paymentHeader) {
      return c.json({
        error: "Payment Required",
        paymentRequirements: resolvePaymentConfig(agent, config),
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
      c.set("settlementHash", verified.settlementHash ?? null);
    } catch {
      return c.json({ error: "Payment verification service unavailable" }, 503);
    }

    await next();
  };
}

interface VerifyResult {
  valid: boolean;
  consumerWallet?: string;
  settlementHash?: string;
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
      const data = await res.json() as {
        valid?: boolean;
        from?: string;
        settlementHash?: string;
        error?: string;
      };
      return {
        valid: !!data.valid,
        consumerWallet: data.from,
        settlementHash: data.settlementHash,
        error: data.error,
      };
    }

    const errBody = await res.text().catch(() => "Unknown error");
    return { valid: false, error: `Facilitator error: ${res.status} ${errBody}` };
  } catch (err) {
    // Only accept without facilitator if explicitly enabled AND on testnet
    if (config.enableTestnetFallback && config.network.includes("sepolia")) {
      console.warn("[x402] Facilitator unreachable on testnet, accepting payment (fallback enabled)");
      return { valid: true, consumerWallet: paymentProof };
    }
    throw err;
  }
}
