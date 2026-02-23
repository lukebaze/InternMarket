import Link from "next/link";
import type { Agent, TrustTier } from "@repo/types";
import { AgentRating } from "./agent-rating";
import { VerifiedBadge } from "./verified-badge";
import { TrustBadge } from "@/components/trust/trust-badge";
import { cn, formatUSDC } from "@/lib/utils";

interface AgentCardProps {
  agent: Agent;
  className?: string;
}

export function AgentCard({ agent, className }: AgentCardProps) {
  return (
    <Link
      href={`/agents/${agent.slug}`}
      className={cn(
        "block bg-bg-surface border border-bg-border p-5",
        "hover:border-text-muted transition-all duration-150",
        className,
      )}
    >
      {/* Top: name + badges */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-ui text-[15px] font-semibold text-text-primary leading-tight line-clamp-1">
          {agent.name}
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          <VerifiedBadge totalCalls={agent.totalCalls} status={agent.status} trustTier={agent.trustTier} />
          <TrustBadge tier={agent.trustTier as TrustTier} />
          <span className="inline-flex px-2 py-1 bg-bg-border font-mono text-[9px] font-medium text-text-secondary capitalize">
            {agent.category}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="font-mono text-xs text-text-tertiary line-clamp-2 mb-4 leading-[1.6]">
        {agent.description}
      </p>

      {/* Footer: rating + price */}
      <div className="flex items-center justify-between">
        <AgentRating rating={agent.ratingAvg} totalCalls={agent.totalCalls} />
        <span className="font-mono text-sm font-semibold text-lime">
          {formatUSDC(agent.pricePerCall)}
          <span className="text-text-muted font-normal ml-0.5">/call</span>
        </span>
      </div>
    </Link>
  );
}
