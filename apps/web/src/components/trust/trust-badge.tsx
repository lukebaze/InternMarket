import type { TrustTier } from "@repo/types";
import { cn } from "@/lib/utils";

const TIER_CONFIG: Record<TrustTier, { label: string; className: string }> = {
  new: { label: "New", className: "bg-gray-100 text-gray-600 border-gray-200" },
  bronze: { label: "Bronze", className: "bg-amber-50 text-amber-700 border-amber-200" },
  silver: { label: "Silver", className: "bg-slate-100 text-slate-600 border-slate-300" },
  gold: { label: "Gold", className: "bg-yellow-50 text-yellow-700 border-yellow-300" },
  platinum: { label: "Platinum", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
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
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
