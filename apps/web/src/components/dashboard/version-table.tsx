"use client";

import { formatDownloads } from "@/lib/utils";

interface VersionRow {
  id: string;
  version: string;
  downloads: number;
  changelog: string | null;
  createdAt: Date | string;
}

interface VersionTableProps {
  versions: VersionRow[];
}

function truncate(text: string | null, max: number): string {
  if (!text) return "—";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const COL_HEADERS = ["Version", "Downloads", "Changelog", "Published"];

export function VersionTable({ versions }: VersionTableProps) {
  if (versions.length === 0) {
    return (
      <div className="border border-dashed border-bg-border p-8 text-center">
        <p className="font-mono text-xs text-text-muted">No versions published yet.</p>
      </div>
    );
  }

  return (
    <div className="border border-bg-border">
      <div className="flex items-center px-4 py-2.5 bg-bg-surface border-b border-bg-border">
        {COL_HEADERS.map((col) => (
          <span
            key={col}
            className={`font-mono text-[10px] text-text-muted uppercase tracking-wide ${
              col === "Changelog" ? "flex-1" : "w-28 text-right first:text-left"
            }`}
          >
            {col}
          </span>
        ))}
      </div>
      {versions.map((v) => (
        <div
          key={v.id}
          className="flex items-center px-4 py-3 border-b border-bg-border last:border-b-0"
        >
          <span className="w-28 font-mono text-xs font-semibold text-lime">v{v.version}</span>
          <span className="w-28 font-mono text-xs text-text-tertiary text-right">
            {formatDownloads(v.downloads)}
          </span>
          <span className="flex-1 font-mono text-xs text-text-secondary px-4">
            {truncate(v.changelog, 80)}
          </span>
          <span className="w-28 font-mono text-xs text-text-muted text-right">
            {formatDate(v.createdAt)}
          </span>
        </div>
      ))}
    </div>
  );
}
