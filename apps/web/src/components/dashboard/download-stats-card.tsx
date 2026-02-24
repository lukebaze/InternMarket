"use client";

import { formatDownloads } from "@/lib/utils";

interface DownloadStatsCardProps {
  totalDownloads: number;
  recentDownloads?: number;
}

export function DownloadStatsCard({ totalDownloads, recentDownloads }: DownloadStatsCardProps) {
  return (
    <div className="bg-bg-surface border border-bg-border p-6 flex flex-col gap-4">
      <span className="font-mono text-[10px] font-bold text-text-muted uppercase tracking-wider">
        Downloads
      </span>

      <div className="flex items-end gap-6">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] text-text-tertiary">Total</span>
          <span className="font-ui text-3xl font-semibold text-text-primary">
            {formatDownloads(totalDownloads)}
          </span>
        </div>

        {recentDownloads !== undefined && (
          <>
            <div className="w-px h-8 bg-bg-border" />
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] text-text-tertiary">Last 30 days</span>
              <span className="font-ui text-xl font-semibold text-lime">
                {formatDownloads(recentDownloads)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
