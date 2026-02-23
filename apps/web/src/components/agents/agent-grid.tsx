import type { Agent } from "@repo/types";
import { AgentCard } from "./agent-card";

interface AgentGridProps {
  agents: Agent[];
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-5 bg-gray-200 rounded-full w-16" />
      </div>
      <div className="space-y-1.5 mb-4">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-4/5" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-3 bg-gray-200 rounded w-24" />
        <div className="h-4 bg-gray-200 rounded w-14" />
      </div>
    </div>
  );
}

interface AgentGridSkeletonProps {
  count?: number;
}

export function AgentGridSkeleton({ count = 6 }: AgentGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function AgentGrid({ agents }: AgentGridProps) {
  if (!agents.length) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg font-medium">No agents found</p>
        <p className="text-sm mt-1">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}
