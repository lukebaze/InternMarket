import Link from "next/link";
import { getDashboardStats, getMyAgents, getMyDownloads } from "@/lib/actions/dashboard-actions";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { TransactionTable } from "@/components/dashboard/transaction-table";
import { AgentRating } from "@/components/agents/agent-rating";

export default async function DashboardPage() {
  const [stats, myAgents, { downloads }] = await Promise.all([
    getDashboardStats(),
    getMyAgents(),
    getMyDownloads({ limit: 5 }),
  ]);

  const recentAgents = myAgents.slice(0, 3);
  const recentDownloads = downloads.slice(0, 5);

  return (
    <>
      <div className="flex items-center justify-between h-14 px-8 border-b border-bg-border shrink-0">
        <h1 className="font-ui text-base font-semibold text-text-primary">Overview</h1>
        <Link
          href="/dashboard/agents/new"
          className="bg-lime text-black font-mono text-xs font-semibold px-4 py-2 hover:brightness-110 transition-all"
        >
          + New Agent
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <StatsOverview stats={stats} />

        {/* Recent agents */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-ui text-sm font-semibold text-text-primary">Recent Agents</h2>
            <Link href="/dashboard/agents" className="font-mono text-[11px] text-lime hover:brightness-110">
              View All →
            </Link>
          </div>
          {recentAgents.length === 0 ? (
            <div className="border border-dashed border-bg-border p-8 text-center">
              <p className="font-mono text-sm text-text-muted mb-3">No agents yet.</p>
              <Link
                href="/dashboard/agents/new"
                className="font-mono text-sm font-medium text-lime underline underline-offset-2"
              >
                Publish your first agent
              </Link>
            </div>
          ) : (
            <div className="border border-bg-border">
              <div className="flex items-center px-4 py-2 border-b border-bg-border bg-bg-surface">
                <span className="flex-1 font-mono text-[10px] text-text-muted uppercase tracking-wide">Name</span>
                <span className="w-24 font-mono text-[10px] text-text-muted uppercase tracking-wide text-right">Downloads</span>
                <span className="w-20 font-mono text-[10px] text-text-muted uppercase tracking-wide text-right">Version</span>
                <span className="w-20 font-mono text-[10px] text-text-muted uppercase tracking-wide text-right">Rating</span>
              </div>
              {recentAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center px-4 py-3 border-b border-bg-border last:border-b-0 hover:bg-bg-surface/50 transition-colors"
                >
                  <div className="flex-1 flex items-center gap-2">
                    <p className="font-mono text-xs font-medium text-text-primary">{agent.name}</p>
                    <span className="inline-flex px-1.5 py-0.5 bg-bg-border font-mono text-[8px] text-text-secondary capitalize">
                      {agent.status}
                    </span>
                  </div>
                  <span className="w-24 font-mono text-xs text-text-tertiary text-right">
                    {(agent.downloads ?? 0).toLocaleString()}
                  </span>
                  <span className="w-20 font-mono text-xs text-text-primary text-right">
                    v{agent.currentVersion}
                  </span>
                  <div className="w-20 flex justify-end">
                    <AgentRating rating={agent.ratingAvg} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent downloads */}
        {recentDownloads.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-ui text-sm font-semibold text-text-primary">Recent Downloads</h2>
            </div>
            <TransactionTable downloads={recentDownloads} />
          </section>
        )}
      </div>
    </>
  );
}
