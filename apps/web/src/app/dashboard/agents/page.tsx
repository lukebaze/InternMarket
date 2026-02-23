import Link from "next/link";
import { getMyAgents } from "@/lib/actions/dashboard-actions";
import { AgentRating } from "@/components/agents/agent-rating";
import { TrustBadge } from "@/components/trust/trust-badge";
import { VerifiedBadge } from "@/components/agents/verified-badge";
import { formatUSDC } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { TrustTier } from "@repo/types";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-lime/10 text-lime",
  paused: "bg-yellow-900/30 text-yellow-400",
  under_review: "bg-orange-900/30 text-orange-400",
};

export default async function MyAgentsPage() {
  const agents = await getMyAgents();

  return (
    <>
      <div className="flex items-center justify-between h-14 px-8 border-b border-bg-border shrink-0">
        <h1 className="font-ui text-base font-semibold text-text-primary">My Agents</h1>
        <Link
          href="/dashboard/agents/new"
          className="bg-lime text-black font-mono text-xs font-semibold px-4 py-2 hover:brightness-110 transition-all"
        >
          + New Agent
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {agents.length === 0 ? (
          <div className="border border-dashed border-bg-border p-12 text-center">
            <p className="font-mono text-sm text-text-muted mb-3">No agents published yet.</p>
            <Link
              href="/dashboard/agents/new"
              className="font-mono text-sm font-medium text-lime underline underline-offset-2"
            >
              Publish your first agent
            </Link>
          </div>
        ) : (
          <div className="border border-bg-border">
            {/* Table header */}
            <div className="flex items-center px-4 py-2.5 border-b border-bg-border bg-bg-surface">
              <span className="flex-1 font-mono text-[10px] text-text-muted uppercase tracking-wide">Agent</span>
              <span className="w-24 font-mono text-[10px] text-text-muted uppercase tracking-wide text-center">Status</span>
              <span className="w-20 font-mono text-[10px] text-text-muted uppercase tracking-wide text-center">Tier</span>
              <span className="w-20 font-mono text-[10px] text-text-muted uppercase tracking-wide text-right">Calls</span>
              <span className="w-20 font-mono text-[10px] text-text-muted uppercase tracking-wide text-right">Price</span>
              <span className="w-20 font-mono text-[10px] text-text-muted uppercase tracking-wide text-right">Rating</span>
              <span className="w-28 font-mono text-[10px] text-text-muted uppercase tracking-wide text-right">Actions</span>
            </div>
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center px-4 py-3 border-b border-bg-border last:border-b-0 hover:bg-bg-surface/50 transition-colors"
              >
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <p className="font-mono text-xs font-medium text-text-primary truncate">{agent.name}</p>
                  <VerifiedBadge totalCalls={agent.totalCalls} status={agent.status} trustTier={agent.trustTier} />
                </div>
                <div className="w-24 flex justify-center">
                  <span
                    className={cn(
                      "inline-flex px-2 py-0.5 font-mono text-[9px] font-medium capitalize",
                      STATUS_STYLES[agent.status] ?? "bg-bg-border text-text-secondary",
                    )}
                  >
                    {agent.status.replace("_", " ")}
                  </span>
                </div>
                <div className="w-20 flex justify-center">
                  <TrustBadge tier={agent.trustTier as TrustTier} />
                </div>
                <span className="w-20 font-mono text-xs text-text-tertiary text-right">
                  {agent.totalCalls.toLocaleString()}
                </span>
                <span className="w-20 font-mono text-xs text-text-primary text-right">
                  {formatUSDC(agent.pricePerCall)}
                </span>
                <div className="w-20 flex justify-end">
                  <AgentRating rating={agent.ratingAvg} />
                </div>
                <div className="w-28 flex justify-end gap-2">
                  <Link
                    href={`/agents/${agent.slug}`}
                    className="font-mono text-[10px] text-text-muted hover:text-text-secondary border border-bg-border px-2 py-1 transition-colors"
                  >
                    View
                  </Link>
                  <Link
                    href={`/dashboard/agents/${agent.id}/edit`}
                    className="font-mono text-[10px] text-black bg-lime px-2 py-1 hover:brightness-110 transition-all"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
