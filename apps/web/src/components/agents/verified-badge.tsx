import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VerificationStatus } from "@repo/types";

interface VerifiedBadgeProps {
  verificationStatus?: string;
  className?: string;
}

const STATUS_CONFIG: Record<VerificationStatus, {
  label: string;
  icon: typeof CheckCircle2;
  classes: string;
  title: string;
}> = {
  verified: {
    label: "Verified",
    icon: CheckCircle2,
    classes: "text-lime bg-lime/10 border-lime/30",
    title: "Platform verified: passed security scan",
  },
  scanning: {
    label: "Scanning",
    icon: Loader2,
    classes: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    title: "Security scan in progress",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    classes: "text-zinc-400 bg-zinc-400/10 border-zinc-400/30",
    title: "Awaiting security verification",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    classes: "text-red-400 bg-red-400/10 border-red-400/30",
    title: "Failed security scan",
  },
};

/** Shows verification status badge based on the agent's verificationStatus field. */
export function VerifiedBadge({ verificationStatus = "pending", className }: VerifiedBadgeProps) {
  const key = (verificationStatus as VerificationStatus) in STATUS_CONFIG
    ? (verificationStatus as VerificationStatus)
    : "pending";

  const config = STATUS_CONFIG[key];
  const Icon = config.icon;
  const isSpinning = key === "scanning";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider border",
        config.classes,
        className,
      )}
      title={config.title}
    >
      <Icon className={cn("w-3 h-3", isSpinning && "animate-spin")} />
      {config.label}
    </span>
  );
}
