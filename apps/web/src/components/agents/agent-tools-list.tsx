import type { AgentTool } from "@repo/types";

interface AgentToolsListProps {
  tools: AgentTool[];
}

export function AgentToolsList({ tools }: AgentToolsListProps) {
  if (!tools.length) {
    return <p className="text-sm text-gray-400">No tools listed.</p>;
  }

  return (
    <ul className="space-y-3">
      {tools.map((tool, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded bg-gray-100 flex items-center justify-center">
            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-medium text-gray-900">{tool.name}</p>
            {tool.description && (
              <p className="text-xs text-gray-500 mt-0.5">{tool.description}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
