"use client";

interface BarChartProps {
  title: string;
  bars: number[];
  labels: string[];
}

export function AnalyticsBarChart({ title, bars, labels }: BarChartProps) {
  const max = Math.max(...bars);

  return (
    <div className="flex-1 bg-bg-surface border border-bg-border p-6 flex flex-col gap-4">
      <span className="font-mono text-[10px] font-bold text-text-muted tracking-wider">{title}</span>
      <div className="flex items-end gap-2 h-28">
        {bars.map((val, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
            <div
              className="w-full bg-lime"
              style={{ height: `${(val / max) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {labels.map((label, i) => (
          <span key={i} className="flex-1 text-center font-mono text-[9px] text-text-muted">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
