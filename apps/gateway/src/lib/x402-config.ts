/**
 * x402 facilitator configuration for payment verification.
 * MVP: Base Sepolia testnet with Coinbase/x402.org facilitator.
 */

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
