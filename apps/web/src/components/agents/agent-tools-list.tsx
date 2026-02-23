import { Settings } from "lucide-react";
import type { AgentTool } from "@repo/types";

interface AgentToolsListProps {
  tools: AgentTool[];
}

export function AgentToolsList({ tools }: AgentToolsListProps) {
  if (!tools.length) {
    return <p className="font-mono text-sm text-text-muted">No tools listed.</p>;
  }

  return (
    <ul className="space-y-3">
      {tools.map((tool, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-0.5 flex-shrink-0 w-5 h-5 bg-bg-border flex items-center justify-center">
            <Settings className="w-3 h-3 text-text-muted" />
          </span>
          <div>
            <p className="font-mono text-sm font-medium text-text-primary">{tool.name}</p>
            {tool.description && (
              <p className="font-mono text-xs text-text-tertiary mt-0.5">{tool.description}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
