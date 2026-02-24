"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { formatDownloads } from "@/lib/utils";

const CATEGORY_STYLES: Record<string, { text: string; bg: string }> = {
  marketing: { text: "text-lime", bg: "bg-[#BFFF0015]" },
  writing: { text: "text-amber-warning", bg: "bg-[#F59E0B15]" },
  finance: { text: "text-blue-info", bg: "bg-[#3B82F615]" },
  coding: { text: "text-green-400", bg: "bg-[#4ADE8015]" },
  social: { text: "text-purple-400", bg: "bg-[#A855F715]" },
};

// Placeholder data — replace with real API call when consumer download history endpoint is ready
const DOWNLOADED_AGENTS = [
  { slug: "seo-optimizer-pro", name: "SEO Optimizer Pro", category: "marketing", version: "1.2.0", downloads: 12500 },
  { slug: "content-writer-ai", name: "Content Writer AI", category: "writing", version: "2.0.1", downloads: 8900 },
  { slug: "trade-analyzer", name: "Trade Analyzer", category: "finance", version: "1.0.5", downloads: 4500 },
  { slug: "code-review-bot", name: "Code Review Bot", category: "coding", version: "3.1.2", downloads: 31200 },
  { slug: "social-media-agent", name: "Social Media Agent", category: "social", version: "1.5.0", downloads: 2800 },
];

const METRICS = [
  { label: "AGENTS INSTALLED", value: String(DOWNLOADED_AGENTS.length) },
  { label: "LATEST INSTALL", value: DOWNLOADED_AGENTS[0]?.name ?? "—" },
  { label: "MOST POPULAR", value: "Code Review Bot" },
  { label: "CATEGORIES USED", value: "5" },
];

export default function ConsumerDownloadsPage() {
  return (
    <>
      {/* Top bar */}
      <div className="flex items-center justify-between h-14 px-8 border-b border-bg-border shrink-0">
        <h1 className="font-ui text-base font-semibold text-text-primary">
          My Downloads
        </h1>
        <Link href="/agents">
          <button className="flex items-center gap-2 border border-bg-border px-3 py-1.5 font-mono text-xs text-text-secondary hover:text-text-primary transition-colors">
            <Search className="w-3.5 h-3.5" />
            Browse Agents
          </button>
        </Link>
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
              <p className="font-ui text-xl font-semibold text-text-primary truncate">
                {m.value}
              </p>
            </div>
          ))}
        </div>

        {/* Downloaded agents list */}
        <div className="space-y-3">
          <h2 className="font-ui text-sm font-semibold text-text-primary">
            Installed Agents
          </h2>

          <div className="border border-bg-border">
            {/* Table header */}
            <div className="grid grid-cols-4 bg-bg-surface px-5 py-2.5 border-b border-bg-border">
              {["AGENT", "CATEGORY", "VERSION", "TOTAL DOWNLOADS"].map((col) => (
                <p key={col} className="font-mono text-[10px] font-bold text-text-muted tracking-wider">
                  {col}
                </p>
              ))}
            </div>

            {/* Rows */}
            {DOWNLOADED_AGENTS.map((row, i) => {
              const style = CATEGORY_STYLES[row.category] ?? {
                text: "text-text-tertiary",
                bg: "bg-[#ffffff10]",
              };
              return (
                <Link
                  key={i}
                  href={`/agents/${row.slug}`}
                  className="grid grid-cols-4 px-5 py-3 border-b border-bg-border last:border-b-0 hover:bg-bg-surface transition-colors"
                >
                  <p className="font-mono text-xs text-text-primary">{row.name}</p>
                  <span
                    className={`inline-flex items-center self-center rounded px-2 py-0.5 text-[9px] font-bold ${style.text} ${style.bg} w-fit`}
                  >
                    {row.category}
                  </span>
                  <p className="font-mono text-xs text-text-secondary">{row.version}</p>
                  <p className="font-mono text-xs text-text-secondary">{formatDownloads(row.downloads)}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
