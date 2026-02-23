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
        "block bg-bg-surface border border-bg-border rounded-2xl overflow-hidden",
        "hover:border-lime/50 hover:shadow-[0_0_30px_rgba(204,255,0,0.1)] transition-all duration-300",
        className,
      )}
    >
      {/* Avatar Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-bg-page/50 border-b border-bg-border flex items-center justify-center p-8">
        {/* We use a seeded bottts api for sci-fi cyberpunk robot avatars */}
        <img
          src={`https://api.dicebear.com/9.x/bottts/svg?seed=${agent.id + agent.slug}&backgroundColor=000000,1A1A1A&primaryColor=ccff00,blue`}
          alt={`${agent.name} avatar`}
          className="absolute inset-0 w-full h-full object-cover p-2 transition-transform duration-500 hover:scale-110"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg-surface to-transparent" />
      </div>

      <div className="p-5">
        {/* Top: name + badges */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-ui text-lg font-bold text-text-primary leading-tight line-clamp-1">
            {agent.name}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            <VerifiedBadge totalCalls={agent.totalCalls} status={agent.status} trustTier={agent.trustTier} />
            <TrustBadge tier={agent.trustTier as TrustTier} />
            <span className="inline-flex px-2 py-1 bg-bg-page border border-bg-border rounded-md font-mono text-[10px] uppercase font-bold text-text-secondary tracking-widest">
              {agent.category}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="font-mono text-xs text-text-tertiary line-clamp-2 mb-5 leading-relaxed">
          {agent.description}
        </p>

        {/* Footer: rating + price */}
        <div className="flex items-center justify-between pt-4 border-t border-bg-border/50">
          <AgentRating rating={agent.ratingAvg} totalCalls={agent.totalCalls} />
          <div className="flex flex-col items-end">
            <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider mb-0.5">Price</span>
            <span className="font-mono text-base font-bold text-lime">
              {formatUSDC(agent.pricePerCall)}
              <span className="text-text-muted font-normal text-xs ml-1">/call</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
