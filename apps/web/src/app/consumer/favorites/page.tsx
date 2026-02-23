"use client";

import { Search } from "lucide-react";

const CATEGORY_STYLES: Record<string, { text: string; border: string }> = {
  marketing: { text: "text-lime", border: "border-[#BFFF0040]" },
  writing: { text: "text-amber-warning", border: "border-[#F59E0B40]" },
  development: { text: "text-blue-info", border: "border-[#3B82F640]" },
  finance: { text: "text-green-400", border: "border-[#4ADE8040]" },
  social: { text: "text-purple-400", border: "border-[#A855F740]" },
  data: { text: "text-text-secondary", border: "border-bg-border" },
};

const AGENTS = [
  {
    name: "SEO Optimizer Pro",
    category: "marketing",
    description: "Analyzes pages and suggests SEO improvements for better search rankings.",
    stars: 5,
    calls: "2,847",
    price: "$0.10",
  },
  {
    name: "Content Writer AI",
    category: "writing",
    description: "Generates blog posts, articles, and marketing copy with AI assistance.",
    stars: 4,
    calls: "1,523",
    price: "$0.05",
  },
  {
    name: "Code Review Bot",
    category: "development",
    description: "Reviews pull requests for bugs, security issues, and code quality.",
    stars: 5,
    calls: "4,102",
    price: "$0.15",
  },
  {
    name: "Trade Analyzer",
    category: "finance",
    description: "Scans crypto markets for arbitrage opportunities and price alerts.",
    stars: 3,
    calls: "891",
    price: "$0.08",
  },
  {
    name: "Social Media Agent",
    category: "social",
    description: "Schedules posts across platforms with optimized timing and hashtags.",
    stars: 4,
    calls: "2,156",
    price: "$0.03",
  },
  {
    name: "Data Scraper Pro",
    category: "data",
    description: "Extracts structured data from websites with intelligent parsing.",
    stars: 4,
    calls: "1,340",
    price: "$0.08",
  },
];

function StarRating({ stars }: { stars: number }) {
  return (
    <span className="font-mono text-xs text-amber-warning">
      {"★".repeat(stars)}{"☆".repeat(5 - stars)}
    </span>
  );
}

export default function FavoritesPage() {
  return (
    <>
      <div className="flex items-center justify-between h-14 px-8 border-b border-bg-border shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="font-ui text-base font-semibold text-text-primary">Favorites</h1>
          <span className="font-mono text-xs font-bold text-lime bg-[#BFFF0015] px-2 py-0.5 rounded">
            6 agents
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search favorites..."
            className="bg-bg-surface border border-bg-border pl-9 pr-4 py-1.5 font-mono text-xs text-text-secondary placeholder:text-text-muted w-[220px] focus:outline-none focus:border-text-tertiary"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-3 gap-4">
          {AGENTS.map((agent) => {
            const style = CATEGORY_STYLES[agent.category] ?? {
              text: "text-text-tertiary",
              border: "border-bg-border",
            };
            return (
              <div
                key={agent.name}
                className="bg-bg-surface border border-bg-border flex flex-col"
              >
                {/* Card top */}
                <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-bg-border">
                  <p className="font-ui text-sm font-semibold text-text-primary leading-snug">
                    {agent.name}
                  </p>
                  <span
                    className={`font-mono text-[9px] font-bold px-2 py-0.5 border rounded shrink-0 ml-2 ${style.text} ${style.border}`}
                  >
                    {agent.category}
                  </span>
                </div>

                {/* Description */}
                <div className="px-5 py-4 flex-1">
                  <p className="font-mono text-[11px] text-text-tertiary leading-relaxed">
                    {agent.description}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-5 pb-5">
                  <div className="flex items-center gap-2">
                    <StarRating stars={agent.stars} />
                    <span className="font-mono text-[10px] text-text-muted">{agent.calls} calls</span>
                  </div>
                  <span className="font-mono text-xs font-semibold text-lime">{agent.price}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
