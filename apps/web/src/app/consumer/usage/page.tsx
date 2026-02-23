"use client";

import { useState } from "react";
import { Download, Search, ChevronLeft, ChevronRight } from "lucide-react";

type StatusType = "Success" | "Failed" | "Pending";

const STATUS_STYLES: Record<StatusType, { text: string; bg: string }> = {
  Success: { text: "text-lime", bg: "bg-[#BFFF0015]" },
  Failed: { text: "text-red-error", bg: "bg-[#FF444415]" },
  Pending: { text: "text-amber-warning", bg: "bg-[#F59E0B15]" },
};

const USAGE_ROWS: {
  timestamp: string;
  agent: string;
  tool: string;
  status: StatusType;
  latency: string;
  cost: string;
  txHash: string;
}[] = [
  { timestamp: "Feb 23, 14:32:08", agent: "SEO Optimizer Pro", tool: "analyze_page", status: "Success", latency: "142ms", cost: "$0.10", txHash: "0xf3a8...c92d" },
  { timestamp: "Feb 23, 14:28:41", agent: "Content Writer AI", tool: "generate_blog", status: "Success", latency: "891ms", cost: "$0.05", txHash: "0x91b2...4f1a" },
  { timestamp: "Feb 23, 13:15:22", agent: "Trade Analyzer", tool: "scan_market", status: "Failed", latency: "—", cost: "$0.00", txHash: "—" },
  { timestamp: "Feb 23, 11:04:55", agent: "Code Review Bot", tool: "review_pr", status: "Success", latency: "324ms", cost: "$0.15", txHash: "0xd4e1...8b3c" },
  { timestamp: "Feb 23, 09:42:17", agent: "Social Media Agent", tool: "schedule_post", status: "Pending", latency: "—", cost: "$0.03", txHash: "0xa7c3...e51b" },
  { timestamp: "Feb 22, 22:10:33", agent: "SEO Optimizer Pro", tool: "check_ranking", status: "Success", latency: "203ms", cost: "$0.10", txHash: "0x52fd...1a9e" },
  { timestamp: "Feb 22, 18:55:09", agent: "Data Scraper Pro", tool: "extract_data", status: "Success", latency: "567ms", cost: "$0.08", txHash: "0xb8e2...7d4f" },
];

type Filter = "All" | StatusType;
const FILTERS: Filter[] = ["All", "Success", "Failed", "Pending"];

export default function UsageHistoryPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  const filtered = activeFilter === "All"
    ? USAGE_ROWS
    : USAGE_ROWS.filter((r) => r.status === activeFilter);

  return (
    <>
      <div className="flex items-center justify-between h-14 px-8 border-b border-bg-border shrink-0">
        <h1 className="font-ui text-base font-semibold text-text-primary">
          Usage History
        </h1>
        <button className="flex items-center gap-2 border border-bg-border px-3 py-1.5 font-mono text-xs text-text-secondary hover:text-text-primary transition-colors">
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`font-mono text-xs px-3 py-1.5 border transition-colors ${
                  activeFilter === f
                    ? "border-lime text-lime bg-[#BFFF0010]"
                    : "border-bg-border text-text-tertiary hover:text-text-secondary"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search by agent or tool..."
              className="bg-bg-surface border border-bg-border pl-9 pr-4 py-1.5 font-mono text-xs text-text-secondary placeholder:text-text-muted w-[260px] focus:outline-none focus:border-text-tertiary"
            />
          </div>
        </div>

        {/* Table */}
        <div className="border border-bg-border">
          <div className="flex bg-bg-surface border-b border-bg-border px-5 py-2.5">
            {[
              { label: "TIMESTAMP", w: "w-[140px]" },
              { label: "AGENT", w: "w-[170px]" },
              { label: "TOOL", w: "w-[140px]" },
              { label: "STATUS", w: "w-[90px]" },
              { label: "LATENCY", w: "w-[80px]" },
              { label: "COST", w: "w-[80px]" },
              { label: "TX HASH", w: "flex-1" },
            ].map((col) => (
              <p key={col.label} className={`font-mono text-[10px] font-bold text-text-muted tracking-wider ${col.w}`}>
                {col.label}
              </p>
            ))}
          </div>

          {filtered.map((row, i) => {
            const s = STATUS_STYLES[row.status];
            return (
              <div
                key={i}
                className="flex items-center px-5 py-3 border-b border-bg-border last:border-b-0 hover:bg-bg-surface transition-colors"
              >
                <p className="font-mono text-[11px] text-text-tertiary w-[140px]">{row.timestamp}</p>
                <p className="font-mono text-[11px] text-text-primary w-[170px]">{row.agent}</p>
                <p className="font-mono text-[11px] text-text-secondary w-[140px]">{row.tool}</p>
                <div className="w-[90px]">
                  <span className={`inline-flex items-center rounded px-2 py-0.5 text-[9px] font-bold ${s.text} ${s.bg}`}>
                    {row.status}
                  </span>
                </div>
                <p className="font-mono text-[11px] text-text-secondary w-[80px]">{row.latency}</p>
                <p className="font-mono text-[11px] text-text-secondary w-[80px]">{row.cost}</p>
                <p className="font-mono text-[11px] text-text-muted flex-1">{row.txHash}</p>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] text-text-tertiary">
            Showing 1–7 of 1,247 transactions
          </p>
          <div className="flex items-center gap-1">
            <button className="flex items-center gap-1 font-mono text-xs text-text-tertiary border border-bg-border px-2.5 py-1.5 hover:text-text-secondary transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" />
              Prev
            </button>
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className={`font-mono text-xs px-3 py-1.5 border transition-colors ${
                  p === 1
                    ? "border-lime text-lime bg-[#BFFF0010]"
                    : "border-bg-border text-text-tertiary hover:text-text-secondary"
                }`}
              >
                {p}
              </button>
            ))}
            <button className="flex items-center gap-1 font-mono text-xs text-text-tertiary border border-bg-border px-2.5 py-1.5 hover:text-text-secondary transition-colors">
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
