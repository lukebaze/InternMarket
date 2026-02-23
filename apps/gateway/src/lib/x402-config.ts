/**
 * x402 facilitator configuration for payment verification.
 * Supports Base Sepolia (testnet) and Base Mainnet (production).
 */

// USDC contract addresses by network
const USDC_ADDRESSES: Record<string, string> = {
  "base-mainnet": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "base-sepolia": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
};

// CDP facilitator (production)
export const CDP_FACILITATOR_URL = "https://api.cdp.coinbase.com/platform/x402/v1";

export interface X402Config {
  facilitatorUrl: string;
  network: string;
  platformWallet: string;
}

export function getX402Config(env: {
  FACILITATOR_URL: string;
  NETWORK: string;
  PLATFORM_WALLET: string;
}): X402Config {
  return {
    facilitatorUrl: env.FACILITATOR_URL,
    network: env.NETWORK,
    platformWallet: env.PLATFORM_WALLET,
  };
}

/** Get USDC contract address for the given network */
export function getUsdcAddress(network: string): string {
  return USDC_ADDRESSES[network] ?? USDC_ADDRESSES["base-sepolia"]!;
}
