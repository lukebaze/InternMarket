import type { DashboardStats } from "@/lib/actions/dashboard-actions";
import { formatDownloads, formatNumber } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-bg-surface border border-bg-border p-6">
      <p className="font-mono text-xs text-text-tertiary mb-4">{label}</p>
      <p className="font-ui text-[32px] font-semibold text-text-primary">{value}</p>
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
      <StatCard label="Total Downloads" value={formatDownloads(stats.totalDownloads)} />
      <StatCard label="Total Interns" value={formatNumber(stats.totalAgents)} />
      <StatCard label="Avg Rating" value={isNaN(avgRating) ? "—" : avgRating.toFixed(1)} />
      <StatCard label="Total Ratings" value={formatNumber(stats.totalRatings ?? 0)} />
    </div>
  );
}
