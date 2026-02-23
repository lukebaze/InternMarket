import type { DashboardStats } from "@/lib/actions/dashboard-actions";
import { formatUSDC, formatNumber } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
}

function StatCard({ label, value, change }: StatCardProps) {
  return (
    <div className="bg-bg-surface border border-bg-border p-6">
      <p className="font-mono text-xs text-text-tertiary mb-4">{label}</p>
      <p className="font-ui text-[32px] font-semibold text-text-primary">{value}</p>
      {change && (
        <div className="flex items-center gap-1.5 mt-2">
          <span className="font-mono text-xs font-semibold text-lime">↑</span>
          <span className="font-mono text-xs font-semibold text-lime">{change}</span>
        </div>
      )}
    </div>
  );
}

interface StatsOverviewProps {
  stats: DashboardStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const avgRating = parseFloat(stats.avgRating);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Revenue" value={formatUSDC(stats.totalRevenue)} change="12.5%" />
      <StatCard label="Total Calls" value={formatNumber(stats.totalCalls)} change="8.2%" />
      <StatCard label="Active Agents" value={formatNumber(stats.totalAgents)} />
      <StatCard label="Avg Rating" value={isNaN(avgRating) ? "—" : avgRating.toFixed(1)} change="0.2" />
    </div>
  );
}
