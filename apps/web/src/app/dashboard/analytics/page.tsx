"use client";

import { useState } from "react";
import { AnalyticsMetricCards } from "@/components/dashboard/analytics/analytics-metric-cards";
import { AnalyticsBarChart } from "@/components/dashboard/analytics/analytics-bar-chart";
import { AnalyticsAgentPerformanceTable } from "@/components/dashboard/analytics/analytics-agent-performance-table";

const PERIODS = ["7D", "30D", "90D"] as const;
type Period = typeof PERIODS[number];

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DOWNLOADS_DATA = [620, 780, 540, 890, 720, 610, 623];
const RATINGS_DATA = [42, 68, 31, 92, 57, 48, 16];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("7D");

  return (
    <>
      <div className="flex items-center justify-between h-14 px-8 border-b border-bg-border shrink-0">
        <h1 className="font-ui text-lg font-semibold text-text-primary">Analytics</h1>
        <div className="flex items-center gap-2">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={
                p === period
                  ? "bg-lime text-black font-mono text-[10px] font-semibold px-3 py-1"
                  : "border border-bg-border text-text-secondary font-mono text-[10px] px-3 py-1 hover:border-text-muted transition-colors"
              }
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <AnalyticsMetricCards />

        <div className="flex gap-4">
          <AnalyticsBarChart title="DOWNLOADS OVER TIME" bars={DOWNLOADS_DATA} labels={DAY_LABELS} />
          <AnalyticsBarChart title="RATINGS OVER TIME" bars={RATINGS_DATA} labels={DAY_LABELS} />
        </div>

        <AnalyticsAgentPerformanceTable />
      </div>
    </>
  );
}
