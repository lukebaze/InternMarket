"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useRef } from "react";
import { Search } from "lucide-react";
import type { AgentCategory } from "@repo/types";
import { cn } from "@/lib/utils";

const CATEGORIES: { value: AgentCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "marketing", label: "Marketing" },
  { value: "assistant", label: "Assistant" },
  { value: "copywriting", label: "Copywriting" },
  { value: "coding", label: "Coding" },
  { value: "pm", label: "PM" },
  { value: "trading", label: "Trading" },
  { value: "social", label: "Social" },
];

const TIERS = ["new", "bronze", "silver", "gold", "platinum"] as const;

const SORT_OPTIONS = [
  { value: "popular", label: "Most Downloaded" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
];

export function AgentSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const currentSearch = searchParams.get("search") ?? "";
  const currentCategory = searchParams.get("category") ?? "all";
  const currentSort = searchParams.get("sort") ?? "popular";
  const currentTiers = searchParams.get("tier")?.split(",") ?? [];
  const currentTags = searchParams.get("tags") ?? "";

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("cursor"); // Reset pagination on filter change
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => updateParams("search", value), 300);
    },
    [updateParams],
  );

  const toggleTier = useCallback(
    (tier: string) => {
      const current = new Set(currentTiers);
      if (current.has(tier)) current.delete(tier);
      else current.add(tier);
      updateParams("tier", [...current].join(","));
    },
    [currentTiers, updateParams],
  );

  return (
    <div className="space-y-4">
      {/* Search + Sort row */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search interns by name or description..."
            defaultValue={currentSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-bg-surface border border-bg-border font-mono text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-muted transition-colors"
          />
        </div>
        <select
          value={currentSort}
          onChange={(e) => updateParams("sort", e.target.value)}
          className="bg-bg-surface border border-bg-border px-3 py-2.5 font-mono text-xs text-text-secondary focus:outline-none focus:border-text-muted"
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Tags input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Filter by tags (comma-separated, e.g. automation, python)"
          defaultValue={currentTags}
          onChange={(e) => {
            clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => updateParams("tags", e.target.value), 300);
          }}
          className="w-full px-4 py-2.5 bg-bg-surface border border-bg-border font-mono text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-muted transition-colors"
        />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => updateParams("category", value)}
            className={cn(
              "px-3 py-1.5 font-mono text-[11px] font-medium transition-colors",
              currentCategory === value
                ? "bg-lime text-black"
                : "bg-transparent border border-bg-border text-text-tertiary hover:text-text-secondary hover:border-text-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Trust tier chips */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-text-muted uppercase">Trust:</span>
        {TIERS.map((tier) => (
          <button
            key={tier}
            onClick={() => toggleTier(tier)}
            className={cn(
              "px-2.5 py-1 font-mono text-[10px] font-medium capitalize transition-colors",
              currentTiers.includes(tier)
                ? "bg-lime/20 text-lime border border-lime/40"
                : "bg-transparent border border-bg-border text-text-muted hover:text-text-secondary hover:border-text-muted",
            )}
          >
            {tier}
          </button>
        ))}
      </div>
    </div>
  );
}
