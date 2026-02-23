import type { TrustTier } from "@repo/types";
import { TrustBadge } from "./trust-badge";
import { cn } from "@/lib/utils";

interface TrustScoreDisplayProps {
  score: string;
  tier: TrustTier;
  className?: string;
}

export function TrustScoreDisplay({ score, tier, className }: TrustScoreDisplayProps) {
  const numScore = parseFloat(score);
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="font-mono text-sm font-semibold text-text-primary">
        {isNaN(numScore) ? "0.0" : numScore.toFixed(1)}
      </span>
      <TrustBadge tier={tier} />
    </div>
  );
}
