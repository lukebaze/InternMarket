import type { Agent } from "@repo/types";
import { AgentCard } from "@/components/agents/agent-card";

interface CreatorAgentListProps {
  agents: Agent[];
}

export function CreatorAgentList({ agents }: CreatorAgentListProps) {
  if (!agents.length) {
    return (
      <p className="font-mono text-sm text-text-muted py-8 text-center">
        This creator has no published agents yet.
      </p>
    );
  }

  return (
    <div>
      <h2 className="font-ui text-sm font-semibold text-text-secondary mb-4">
        Published Agents ({agents.length})
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
