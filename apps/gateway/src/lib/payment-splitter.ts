/**
 * Calculate 85/15 payment split between creator and platform.
 * Uses string-based math to avoid floating point precision issues with USDC amounts.
 */

const PLATFORM_FEE_BPS = 1500; // 15% = 1500 basis points
const BPS_DIVISOR = 10000;
const USDC_DECIMALS = 6;

export interface PaymentSplit {
  platformFee: string;
  creatorPayout: string;
}

export function calculateSplit(amount: string): PaymentSplit {
  // Convert decimal string to integer micro-units (6 decimals for USDC)
  const parts = amount.split(".");
  const whole = parts[0] ?? "0";
  const frac = (parts[1] ?? "").padEnd(USDC_DECIMALS, "0").slice(0, USDC_DECIMALS);
  const microUnits = BigInt(whole) * BigInt(10 ** USDC_DECIMALS) + BigInt(frac);

  const platformMicro = (microUnits * BigInt(PLATFORM_FEE_BPS)) / BigInt(BPS_DIVISOR);
  const creatorMicro = microUnits - platformMicro;

  return {
    platformFee: formatMicroUnits(platformMicro),
    creatorPayout: formatMicroUnits(creatorMicro),
  };
}

function formatMicroUnits(micro: bigint): string {
  const str = micro.toString().padStart(USDC_DECIMALS + 1, "0");
  const whole = str.slice(0, -USDC_DECIMALS);
  const frac = str.slice(-USDC_DECIMALS);
  return `${whole}.${frac}`;
}
