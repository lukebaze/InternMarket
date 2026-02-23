import { formatUSDC, formatNumber } from "@/lib/utils";

interface EarningsCardProps {
  totalRevenue: string;
  totalCalls: number;
  label?: string;
}

export function EarningsCard({ totalRevenue, totalCalls, label = "All time" }: EarningsCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-xs text-gray-500 mb-1">{label} Revenue</p>
      <p className="text-2xl font-bold text-gray-900">{formatUSDC(totalRevenue)}</p>
      <p className="text-xs text-gray-400 mt-1">{formatNumber(totalCalls)} total calls</p>
    </div>
  );
}
