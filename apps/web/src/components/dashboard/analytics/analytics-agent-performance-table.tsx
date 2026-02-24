"use client";

const AGENT_DATA = [
  { name: "SEO Optimizer Pro", downloads: "15,437", rating: "4.8", version: "1.2.0" },
  { name: "Code Review Bot", downloads: "12,847", rating: "4.5", version: "2.0.1" },
  { name: "Content Writer AI", downloads: "7,812", rating: "4.1", version: "1.0.0" },
];

const COLS = ["INTERN", "DOWNLOADS", "RATING", "VERSION"];

export function AnalyticsAgentPerformanceTable() {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-[10px] font-bold text-text-muted tracking-wider">INTERN PERFORMANCE</span>
      <div className="border border-bg-border">
        <div className="flex items-center px-4 py-2.5 bg-bg-surface border-b border-bg-border">
          {COLS.map((col) => (
            <span
              key={col}
              className={`font-mono text-[10px] text-text-muted ${col === "INTERN" ? "flex-1" : "w-28 text-right"}`}
            >
              {col}
            </span>
          ))}
        </div>
        {AGENT_DATA.map((row, i) => (
          <div key={i} className="flex items-center px-4 py-3.5 border-b border-bg-border last:border-b-0">
            <span className="flex-1 font-mono text-xs text-text-primary">{row.name}</span>
            <span className="w-28 font-mono text-xs text-text-tertiary text-right">{row.downloads}</span>
            <span className="w-28 font-mono text-xs text-lime text-right">{row.rating}</span>
            <span className="w-28 font-mono text-xs text-text-muted text-right">v{row.version}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
