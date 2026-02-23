"use client";

import { useState } from "react";

const BALANCE_CARDS = [
  { label: "CURRENT BALANCE", value: "24.50", sub: "USDC" },
  { label: "SPENT 30D", value: "$8.42", change: "↑18.3%" },
  { label: "AVG DAILY", value: "$0.28", change: "↓4.1%" },
  { label: "TOP AGENT", value: "$3.20", sub: "SEO Optimizer" },
];

// Bar heights in px for agent + platform portions (Mon-Sun)
const DAILY_BARS = [
  { agent: 32, platform: 6 },
  { agent: 48, platform: 8 },
  { agent: 24, platform: 4 },
  { agent: 56, platform: 10 },
  { agent: 40, platform: 7 },
  { agent: 18, platform: 3 },
  { agent: 36, platform: 6 },
];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const AGENT_ROWS = [
  { name: "SEO Optimizer Pro", calls: 423, spent: "$3.30", pct: 54.5, barColor: "bg-lime" },
  { name: "Content Writer AI", calls: 276, spent: "$2.14", pct: 25.4, barColor: "bg-blue-info" },
  { name: "Data Scraper Bot", calls: 145, spent: "$1.42", pct: 16.9, barColor: "bg-amber-warning" },
  { name: "Other (3 agents)", calls: 203, spent: "$1.56", pct: 3.2, barColor: "bg-text-muted" },
];

type Period = "7D" | "30D" | "90D" | "ALL";
const PERIODS: Period[] = ["7D", "30D", "90D", "ALL"];

export default function SpendingPage() {
  const [activePeriod, setActivePeriod] = useState<Period>("30D");

  return (
    <>
      <div className="flex items-center justify-between h-14 px-8 border-b border-bg-border shrink-0">
        <h1 className="font-ui text-base font-semibold text-text-primary">Spending</h1>
        <div className="flex items-center gap-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setActivePeriod(p)}
              className={`font-mono text-xs px-3 py-1.5 border transition-colors ${
                activePeriod === p
                  ? "border-lime text-lime bg-[#BFFF0010]"
                  : "border-bg-border text-text-tertiary hover:text-text-secondary"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Balance cards */}
        <div className="flex gap-4">
          {BALANCE_CARDS.map((c) => (
            <div key={c.label} className="flex-1 bg-bg-surface border border-bg-border p-6 flex flex-col gap-1.5">
              <p className="font-mono text-xs text-text-tertiary">{c.label}</p>
              <p className="font-ui text-2xl font-semibold text-text-primary">{c.value}</p>
              {c.sub && <p className="font-mono text-[10px] text-text-muted">{c.sub}</p>}
              {c.change && <p className="font-mono text-[10px] text-lime">{c.change}</p>}
            </div>
          ))}
        </div>

        {/* Daily spending chart */}
        <div className="bg-bg-surface border border-bg-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-ui text-sm font-semibold text-text-primary">Daily Spending</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-lime" />
                <span className="font-mono text-[10px] text-text-tertiary">Agent Fees</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-text-muted" />
                <span className="font-mono text-[10px] text-text-tertiary">Platform Fees</span>
              </div>
            </div>
          </div>

          <div className="flex items-end gap-3 h-20">
            {DAILY_BARS.map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full flex flex-col justify-end" style={{ height: `${bar.agent + bar.platform}px` }}>
                  <div className="w-full bg-[#BFFF0030]" style={{ height: `${bar.platform}px` }} />
                  <div className="w-full bg-lime" style={{ height: `${bar.agent}px` }} />
                </div>
                <p className="font-mono text-[9px] text-text-muted mt-1">{DAYS[i]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Spending by agent */}
        <div className="space-y-3">
          <div>
            <h2 className="font-ui text-sm font-semibold text-text-primary">Spending by Agent</h2>
            <p className="font-mono text-[10px] text-text-muted mt-0.5">Last 30 days</p>
          </div>

          <div className="border border-bg-border">
            <div className="grid grid-cols-5 bg-bg-surface px-5 py-2.5 border-b border-bg-border">
              {["AGENT", "CALLS", "SPENT", "% OF TOTAL", "BREAKDOWN"].map((col) => (
                <p key={col} className="font-mono text-[10px] font-bold text-text-muted tracking-wider">{col}</p>
              ))}
            </div>
            {AGENT_ROWS.map((row, i) => (
              <div key={i} className="grid grid-cols-5 items-center px-5 py-3.5 border-b border-bg-border last:border-b-0 hover:bg-bg-surface transition-colors">
                <p className="font-mono text-xs text-text-primary">{row.name}</p>
                <p className="font-mono text-xs text-text-secondary">{row.calls}</p>
                <p className="font-mono text-xs text-text-secondary">{row.spent}</p>
                <p className="font-mono text-xs text-text-secondary">{row.pct}%</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${row.barColor}`}
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
