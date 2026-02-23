import Link from "next/link";
import { getDashboardStats, getMyTransactions } from "@/lib/actions/dashboard-actions";
import { getMyAgents } from "@/lib/actions/dashboard-actions";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { TransactionTable } from "@/components/dashboard/transaction-table";
import { AgentRating } from "@/components/agents/agent-rating";
import { formatUSDC } from "@/lib/utils";

export default async function DashboardPage() {
  const [stats, myAgents, { transactions }] = await Promise.all([
    getDashboardStats(),
    getMyAgents(),
    getMyTransactions({ limit: 5 }),
  ]);

  const recentAgents = myAgents.slice(0, 3);
  const recentTxs = transactions.slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Overview</h1>
        <Link
          href="/dashboard/agents/new"
          className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          + New Agent
        </Link>
      </div>

      <StatsOverview stats={stats} />

      {/* Recent agents */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Recent Agents</h2>
          <Link href="/dashboard/agents" className="text-xs text-gray-500 hover:text-gray-900">
            View all →
          </Link>
        </div>
        {recentAgents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-500 mb-3">No agents yet.</p>
            <Link
              href="/dashboard/agents/new"
              className="text-sm font-medium text-gray-900 underline underline-offset-2"
            >
              Publish your first agent
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentAgents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                  <AgentRating rating={agent.ratingAvg} totalCalls={agent.totalCalls} />
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatUSDC(agent.pricePerCall)}
                    <span className="text-xs text-gray-400 font-normal">/call</span>
                  </span>
                  <Link
                    href={`/dashboard/agents/${agent.id}/edit`}
                    className="text-xs text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent transactions */}
      {recentTxs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Recent Transactions</h2>
            <Link href="/dashboard/transactions" className="text-xs text-gray-500 hover:text-gray-900">
              View all →
            </Link>
          </div>
          <TransactionTable transactions={recentTxs} />
        </section>
      )}
    </div>
  );
}
