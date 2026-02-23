import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  totalCalls: number;
  status: string;
  trustTier: string;
  className?: string;
}

/** Shows "Verified" when agent has 100+ calls, active status, non-new tier */
export function VerifiedBadge({ totalCalls, status, trustTier, className }: VerifiedBadgeProps) {
  const isVerified = totalCalls >= 100 && status === "active" && trustTier !== "new";
  if (!isVerified) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-lime bg-lime/10 border border-lime/30",
        className,
      )}
      title="Platform Verified: 100+ calls with active status"
    >
      <CheckCircle2 className="w-3 h-3" />
      Verified
    </span>
  );
}
