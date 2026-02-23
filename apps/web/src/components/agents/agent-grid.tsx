import type { Agent } from "@repo/types";
import { AgentCard } from "./agent-card";
import { LoadMoreButton } from "./load-more-button";

interface AgentGridProps {
  agents: Agent[];
  nextCursor?: string;
}

function SkeletonCard() {
  return (
    <div className="bg-bg-surface border border-bg-border p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="h-4 bg-bg-border rounded w-2/3" />
        <div className="h-5 bg-bg-border rounded w-16" />
      </div>
      <div className="space-y-1.5 mb-4">
        <div className="h-3 bg-bg-border rounded w-full" />
        <div className="h-3 bg-bg-border rounded w-4/5" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-3 bg-bg-border rounded w-24" />
        <div className="h-4 bg-bg-border rounded w-14" />
      </div>
    </div>
  );
}

export function AgentGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function AgentGrid({ agents, nextCursor }: AgentGridProps) {
  if (!agents.length) {
    return (
      <div className="text-center py-16">
        <p className="font-ui text-lg font-medium text-text-secondary">No agents found</p>
        <p className="font-mono text-sm mt-1 text-text-tertiary">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
      {nextCursor && (
        <div className="mt-6 flex justify-center">
          <LoadMoreButton cursor={nextCursor} />
        </div>
      )}
    </div>
  );
}
