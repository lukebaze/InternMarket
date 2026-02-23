"use client";

interface MetricCardProps {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}

function MetricCard({ label, value, change, positive }: MetricCardProps) {
  return (
    <div className="flex-1 bg-bg-surface border border-bg-border p-6 flex flex-col gap-2">
      <span className="font-mono text-xs text-text-tertiary">{label}</span>
      <span className="font-ui text-3xl font-semibold text-text-primary">{value}</span>
      <span className="flex items-center gap-1.5 font-mono text-[10px] text-lime">
        <span>{positive ? "↑" : "↓"}</span>
        <span>{change}</span>
      </span>
    </div>
  );
}

export function AnalyticsMetricCards() {
  return (
    <div className="flex gap-4">
      <MetricCard label="TOTAL CALLS" value="47,832" change="8.3%" positive={true} />
      <MetricCard label="SUCCESS RATE" value="99.2%" change="0.4%" positive={true} />
      <MetricCard label="AVG LATENCY" value="142ms" change="12ms" positive={false} />
      <MetricCard label="UNIQUE USERS" value="1,284" change="15.7%" positive={true} />
    </div>
  );
}
