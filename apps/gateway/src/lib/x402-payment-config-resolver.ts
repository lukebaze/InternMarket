/**
 * Dynamic per-agent payment config resolver for x402 verification.
 * Maps agent DB record to payment requirements shape.
 * Option C: platform collects all payments, off-chain accounting, batched payouts.
 */

import { getUsdcAddress } from "./x402-config";

export interface PaymentRequirements {
  scheme: "x402";
  network: string;
  currency: "USDC";
  amount: string;
  payTo: string;
  asset: string;
  facilitator: string;
  agentId: string;
  agentName: string;
  agentSlug: string;
}

interface AgentPaymentInfo {
  id: string;
  name: string;
  slug: string;
  pricePerCall: string;
}

interface PaymentEnv {
  platformWallet: string;
  facilitatorUrl: string;
  network: string;
}

/** Resolve payment requirements for a specific agent */
export function resolvePaymentConfig(
  agent: AgentPaymentInfo,
  env: PaymentEnv,
): PaymentRequirements {
  return {
    scheme: "x402",
    network: env.network,
    currency: "USDC",
    amount: agent.pricePerCall,
    payTo: env.platformWallet,
    asset: getUsdcAddress(env.network),
    facilitator: env.facilitatorUrl,
    agentId: agent.id,
    agentName: agent.name,
    agentSlug: agent.slug,
  };
}
