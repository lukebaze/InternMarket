"use client";

import { Search } from "lucide-react";

const METRICS = [
  { label: "TOTAL SPENT", value: "$12.40", change: "↑8.2%" },
  { label: "API CALLS", value: "1,247", change: "↑23.1%" },
  { label: "AGENTS USED", value: "8", change: "↑2 new" },
  { label: "AVG COST/CALL", value: "$0.009", change: "↓5.3%" },
];

const CATEGORY_STYLES: Record<string, { text: string; bg: string }> = {
  marketing: { text: "text-lime", bg: "bg-[#BFFF0015]" },
  writing: { text: "text-amber-warning", bg: "bg-[#F59E0B15]" },
  finance: { text: "text-blue-info", bg: "bg-[#3B82F615]" },
  coding: { text: "text-green-400", bg: "bg-[#4ADE8015]" },
  social: { text: "text-purple-400", bg: "bg-[#A855F715]" },
};

const RECENT_USAGE = [
  { agent: "SEO Optimizer Pro", category: "marketing", cost: "$0.10", calls: 142 },
  { agent: "Content Writer AI", category: "writing", cost: "$0.05", calls: 89 },
  { agent: "Trade Analyzer", category: "finance", cost: "$0.08", calls: 45 },
  { agent: "Code Review Bot", category: "coding", cost: "$0.15", calls: 31 },
  { agent: "Social Media Agent", category: "social", cost: "$0.03", calls: 28 },
];

export default function ConsumerDashboardPage() {
  return (
    <>
      {/* Top bar */}
      <div className="flex items-center justify-between h-14 px-8 border-b border-bg-border shrink-0">
        <h1 className="font-ui text-base font-semibold text-text-primary">
          Consumer Dashboard
        </h1>
        <button className="flex items-center gap-2 border border-bg-border px-3 py-1.5 font-mono text-xs text-text-secondary hover:text-text-primary transition-colors">
          <Search className="w-3.5 h-3.5" />
          Browse Agents
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Metric cards */}
        <div className="flex gap-4">
          {METRICS.map((m) => (
            <div
              key={m.label}
              className="flex-1 bg-bg-surface p-6 border border-bg-border flex flex-col gap-2"
            >
              <p className="font-mono text-xs text-text-tertiary">{m.label}</p>
              <p className="font-ui text-2xl font-semibold text-text-primary">
                {m.value}
              </p>
              <p className="font-mono text-[10px] text-lime">{m.change}</p>
            </div>
          ))}
        </div>

        {/* Recent Usage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-ui text-sm font-semibold text-text-primary">
              Recent Usage
            </h2>
            <a
              href="/consumer/usage"
              className="font-mono text-[11px] text-text-tertiary hover:text-text-secondary transition-colors"
            >
              View All →
            </a>
          </div>

          <div className="border border-bg-border">
            {/* Table header */}
            <div className="grid grid-cols-4 bg-bg-surface px-5 py-2.5 border-b border-bg-border">
              {["AGENT", "CATEGORY", "COST", "CALLS"].map((col) => (
                <p key={col} className="font-mono text-[10px] font-bold text-text-muted tracking-wider">
                  {col}
                </p>
              ))}
            </div>

            {/* Rows */}
            {RECENT_USAGE.map((row, i) => {
              const style = CATEGORY_STYLES[row.category] ?? {
                text: "text-text-tertiary",
                bg: "bg-[#ffffff10]",
              };
              return (
                <div
                  key={i}
                  className="grid grid-cols-4 px-5 py-3 border-b border-bg-border last:border-b-0 hover:bg-bg-surface transition-colors"
                >
                  <p className="font-mono text-xs text-text-primary">{row.agent}</p>
                  <span
                    className={`inline-flex items-center self-center rounded px-2 py-0.5 text-[9px] font-bold ${style.text} ${style.bg} w-fit`}
                  >
                    {row.category}
                  </span>
                  <p className="font-mono text-xs text-text-secondary">{row.cost}</p>
                  <p className="font-mono text-xs text-text-secondary">{row.calls}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
