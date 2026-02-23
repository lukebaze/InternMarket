import Link from "next/link";
import type { Agent } from "@repo/types";
import { AgentRating } from "./agent-rating";
import { cn, formatUSDC } from "@/lib/utils";

const CATEGORY_COLORS: Record<string, string> = {
  marketing: "bg-pink-50 text-pink-700",
  assistant: "bg-blue-50 text-blue-700",
  copywriting: "bg-purple-50 text-purple-700",
  coding: "bg-green-50 text-green-700",
  pm: "bg-orange-50 text-orange-700",
  trading: "bg-cyan-50 text-cyan-700",
  social: "bg-rose-50 text-rose-700",
};

interface AgentCardProps {
  agent: Agent;
  className?: string;
}

export function AgentCard({ agent, className }: AgentCardProps) {
  return (
    <Link
      href={`/agents/${agent.slug}`}
      className={cn(
        "block rounded-xl border border-gray-200 bg-white p-5 shadow-sm",
        "hover:shadow-md hover:border-gray-300 transition-all duration-150",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1">
          {agent.name}
        </h3>
        <span
          className={cn(
            "shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-medium",
            CATEGORY_COLORS[agent.category] ?? "bg-gray-100 text-gray-600"
          )}
        >
          {agent.category}
        </span>
      </div>

      <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
        {agent.description}
      </p>

      <div className="flex items-center justify-between">
        <AgentRating rating={agent.ratingAvg} totalCalls={agent.totalCalls} />
        <span className="text-sm font-semibold text-gray-900">
          {formatUSDC(agent.pricePerCall)}
          <span className="text-xs text-gray-400 font-normal ml-0.5">/call</span>
        </span>
      </div>
    </Link>
  );
}
