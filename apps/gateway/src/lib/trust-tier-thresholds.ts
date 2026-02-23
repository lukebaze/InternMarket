/**
 * Centralized trust tier thresholds with minimum call requirements.
 * Tiers are checked top-down — first match wins.
 */

export type TrustTier = "platinum" | "gold" | "silver" | "bronze" | "new";

interface TierConfig {
  minScore: number;
  minCalls: number;
}

const TIER_THRESHOLDS: Record<TrustTier, TierConfig> = {
  platinum: { minScore: 90, minCalls: 500 },
  gold: { minScore: 75, minCalls: 100 },
  silver: { minScore: 60, minCalls: 50 },
  bronze: { minScore: 40, minCalls: 10 },
  new: { minScore: 0, minCalls: 0 },
};

const TIER_ORDER: TrustTier[] = ["platinum", "gold", "silver", "bronze", "new"];

export function computeTrustTier(score: number, totalCalls: number): TrustTier {
  for (const tier of TIER_ORDER) {
    const config = TIER_THRESHOLDS[tier];
    if (score >= config.minScore && totalCalls >= config.minCalls) {
      return tier;
    }
  }
  return "new";
}
