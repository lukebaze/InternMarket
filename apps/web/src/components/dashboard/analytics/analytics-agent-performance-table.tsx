"use client";

const AGENT_DATA = [
  { name: "SEO Optimizer Pro", calls: "15,437", success: "99.7%", latency: "128ms", revenue: "$1,543", rating: "4.8" },
  { name: "Code Review Bot", calls: "12,847", success: "98.1%", latency: "342ms", revenue: "$3,427", rating: "4.5" },
  { name: "Content Writer AI", calls: "7,812", success: "97.8%", latency: "567ms", revenue: "$390", rating: "4.1" },
];

const COLS = ["AGENT", "CALLS", "SUCCESS", "LATENCY", "REVENUE", "RATING"];

export function AnalyticsAgentPerformanceTable() {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-[10px] font-bold text-text-muted tracking-wider">AGENT PERFORMANCE</span>
      <div className="border border-bg-border">
        <div className="flex items-center px-4 py-2.5 bg-bg-surface border-b border-bg-border">
          {COLS.map((col) => (
            <span
              key={col}
              className={`font-mono text-[10px] text-text-muted ${col === "AGENT" ? "flex-1" : "w-24 text-right"}`}
            >
              {col}
            </span>
          ))}
        </div>
        {AGENT_DATA.map((row, i) => (
          <div key={i} className="flex items-center px-4 py-3.5 border-b border-bg-border last:border-b-0">
            <span className="flex-1 font-mono text-xs text-text-primary">{row.name}</span>
            <span className="w-24 font-mono text-xs text-text-tertiary text-right">{row.calls}</span>
            <span className="w-24 font-mono text-xs text-text-tertiary text-right">{row.success}</span>
            <span className="w-24 font-mono text-xs text-text-tertiary text-right">{row.latency}</span>
            <span className="w-24 font-mono text-xs text-text-tertiary text-right">{row.revenue}</span>
            <span className="w-24 font-mono text-xs text-text-tertiary text-right">{row.rating}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
