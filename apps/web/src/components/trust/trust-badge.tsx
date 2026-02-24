import type { TrustTier } from "@repo/types";
import { cn } from "@/lib/utils";

const TIER_CONFIG: Record<TrustTier, { label: string; className: string }> = {
  new: { label: "New", className: "bg-bg-border text-text-secondary" },
  bronze: { label: "Bronze", className: "bg-amber-900/30 text-amber-400" },
  silver: { label: "Silver", className: "bg-gray-700/30 text-gray-300" },
  gold: { label: "Gold", className: "bg-yellow-900/30 text-yellow-400" },
};

interface TrustBadgeProps {
  tier: TrustTier;
  className?: string;
}

export function TrustBadge({ tier, className }: TrustBadgeProps) {
  const config = TIER_CONFIG[tier] ?? TIER_CONFIG.new;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
