import type { DashboardStats } from "@/lib/actions/dashboard-actions";
import { formatUSDC, formatNumber } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
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
      <StatCard label="Total Agents" value={formatNumber(stats.totalAgents)} />
      <StatCard label="Total Calls" value={formatNumber(stats.totalCalls)} />
      <StatCard label="Avg Rating" value={isNaN(avgRating) ? "—" : avgRating.toFixed(1)} />
      <StatCard label="Total Revenue" value={formatUSDC(stats.totalRevenue)} />
    </div>
  );
}
