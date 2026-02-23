"use client";

import { useState } from "react";

interface ToggleRowProps {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  showDivider?: boolean;
}

function ToggleRow({ label, description, enabled, onToggle, showDivider }: ToggleRowProps) {
  return (
    <>
      <div className="flex items-center justify-between py-3.5">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-xs font-medium text-text-primary">{label}</span>
          <span className="font-mono text-[10px] text-text-tertiary">{description}</span>
        </div>
        <button
          onClick={onToggle}
          role="switch"
          aria-checked={enabled}
          className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${enabled ? "bg-lime" : "bg-bg-border"}`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`}
          />
        </button>
      </div>
      {showDivider && <div className="h-px bg-bg-border" />}
    </>
  );
}

export function SettingsNotificationsSection() {
  const [txAlerts, setTxAlerts] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);
  const [downtime, setDowntime] = useState(true);

  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-[10px] font-bold text-text-muted tracking-wider">NOTIFICATIONS</span>
      <div className="bg-bg-surface border border-bg-border px-6">
        <ToggleRow
          label="Transaction alerts"
          description="Get notified for every payment"
          enabled={txAlerts}
          onToggle={() => setTxAlerts((v) => !v)}
          showDivider
        />
        <ToggleRow
          label="Weekly summary"
          description="Revenue and performance report every Monday"
          enabled={weeklySummary}
          onToggle={() => setWeeklySummary((v) => !v)}
          showDivider
        />
        <ToggleRow
          label="Agent downtime alerts"
          description="Immediate notification when health checks fail"
          enabled={downtime}
          onToggle={() => setDowntime((v) => !v)}
        />
      </div>
    </div>
  );
}
