import { formatUSDC, formatNumber } from "@/lib/utils";

interface EarningsCardProps {
  totalRevenue: string;
  totalCalls: number;
  label?: string;
}

export function EarningsCard({ totalRevenue, totalCalls, label = "All time" }: EarningsCardProps) {
  return (
    <div className="bg-bg-surface border border-bg-border p-5">
      <p className="font-mono text-xs text-text-muted mb-1">{label} Revenue</p>
      <p className="font-ui text-2xl font-bold text-lime">{formatUSDC(totalRevenue)}</p>
      <p className="font-mono text-[10px] text-text-muted mt-1">{formatNumber(totalCalls)} total calls</p>
    </div>
  );
}
