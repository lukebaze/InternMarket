import Link from "next/link";
import { getMyAgents } from "@/lib/actions/dashboard-actions";
import { AgentRating } from "@/components/agents/agent-rating";
import { formatUSDC } from "@/lib/utils";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  paused: "bg-yellow-50 text-yellow-700",
  under_review: "bg-orange-50 text-orange-700",
};

export default async function MyAgentsPage() {
  const agents = await getMyAgents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">My Agents</h1>
        <Link
          href="/dashboard/agents/new"
          className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          + New Agent
        </Link>
      </div>

      {agents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-12 text-center">
          <p className="text-sm text-gray-500 mb-3">You haven&apos;t published any agents yet.</p>
          <Link
            href="/dashboard/agents/new"
            className="text-sm font-medium text-gray-900 underline underline-offset-2"
          >
            Publish your first agent →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-gray-200 bg-white"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{agent.name}</p>
                  <span
                    className={cn(
                      "inline-flex px-2 py-0.5 rounded-full text-xs font-medium",
                      STATUS_STYLES[agent.status] ?? "bg-gray-100 text-gray-600"
                    )}
                  >
                    {agent.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-1">{agent.description}</p>
                <AgentRating rating={agent.ratingAvg} totalCalls={agent.totalCalls} />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                  {formatUSDC(agent.pricePerCall)}
                  <span className="text-xs text-gray-400 font-normal">/call</span>
                </span>
                <Link
                  href={`/agents/${agent.slug}`}
                  className="text-xs text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 whitespace-nowrap"
                >
                  View
                </Link>
                <Link
                  href={`/dashboard/agents/${agent.id}/edit`}
                  className="text-xs text-white bg-gray-900 hover:bg-gray-700 rounded-lg px-3 py-1.5 whitespace-nowrap transition-colors"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
