"use client";

import { useState } from "react";
import { Save, Trash2 } from "lucide-react";

interface SpendingLimit {
  label: string;
  description: string;
  value: string;
}

interface NotificationSetting {
  label: string;
  description: string;
  enabled: boolean;
}

const INITIAL_LIMITS: SpendingLimit[] = [
  { label: "Daily Spending Limit", description: "Max spend allowed per day", value: "$5.00" },
  { label: "Per-Call Limit", description: "Max cost allowed per API call", value: "$1.00" },
  { label: "Require Confirmation Above", description: "Ask before spending more than this amount", value: "$0.50" },
];

const INITIAL_NOTIFICATIONS: NotificationSetting[] = [
  { label: "Payment Confirmations", description: "Receive confirmations for every payment", enabled: true },
  { label: "Spending Alerts", description: "Alert when approaching daily spending limit", enabled: true },
  { label: "Weekly Spending Summary", description: "Receive weekly email with usage and spending breakdown", enabled: false },
];

function SectionLabel({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <p className={`font-mono text-[10px] font-bold tracking-wider mb-2 ${danger ? "text-red-error" : "text-text-muted"}`}>
      {children}
    </p>
  );
}

export default function ConsumerSettingsPage() {
  const [limits, setLimits] = useState(INITIAL_LIMITS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const toggleNotification = (index: number) => {
    setNotifications((prev) =>
      prev.map((n, i) => (i === index ? { ...n, enabled: !n.enabled } : n))
    );
  };

  const updateLimit = (index: number, value: string) => {
    setLimits((prev) =>
      prev.map((l, i) => (i === index ? { ...l, value } : l))
    );
  };

  return (
    <>
      <div className="flex items-center justify-between h-14 px-8 border-b border-bg-border shrink-0">
        <h1 className="font-ui text-base font-semibold text-text-primary">Settings</h1>
        <button className="flex items-center gap-2 bg-lime text-black px-3 py-1.5 font-mono text-xs font-semibold hover:bg-lime/90 transition-colors">
          <Save className="w-3.5 h-3.5" />
          Save Changes
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6 max-w-2xl">
        {/* Connected Wallet */}
        <div>
          <SectionLabel>CONNECTED WALLET</SectionLabel>
          <div className="border border-bg-border bg-bg-surface px-5 py-4 flex items-center justify-between">
            <p className="font-mono text-xs text-text-secondary">0x1a2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B</p>
            <button className="font-mono text-xs text-text-tertiary border border-bg-border px-3 py-1.5 hover:text-text-secondary transition-colors">
              Disconnect
            </button>
          </div>
        </div>

        {/* Spending Limits */}
        <div>
          <SectionLabel>SPENDING LIMITS</SectionLabel>
          <div className="border border-bg-border bg-bg-surface">
            {limits.map((limit, i) => (
              <div
                key={limit.label}
                className={`flex items-center justify-between px-5 py-4 ${i < limits.length - 1 ? "border-b border-bg-border" : ""}`}
              >
                <div>
                  <p className="font-mono text-xs text-text-primary">{limit.label}</p>
                  <p className="font-mono text-[10px] text-text-muted mt-0.5">{limit.description}</p>
                </div>
                <input
                  type="text"
                  value={limit.value}
                  onChange={(e) => updateLimit(i, e.target.value)}
                  className="bg-bg-border border border-bg-border px-3 py-1.5 font-mono text-xs text-text-primary w-24 text-right focus:outline-none focus:border-text-tertiary"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div>
          <SectionLabel>NOTIFICATIONS</SectionLabel>
          <div className="border border-bg-border bg-bg-surface">
            {notifications.map((notif, i) => (
              <div
                key={notif.label}
                className={`flex items-center justify-between px-5 py-4 ${i < notifications.length - 1 ? "border-b border-bg-border" : ""}`}
              >
                <div>
                  <p className="font-mono text-xs text-text-primary">{notif.label}</p>
                  <p className="font-mono text-[10px] text-text-muted mt-0.5">{notif.description}</p>
                </div>
                <button
                  onClick={() => toggleNotification(i)}
                  className={`relative w-9 h-5 rounded-full transition-colors ${notif.enabled ? "bg-lime" : "bg-bg-border"}`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-black transition-transform ${notif.enabled ? "translate-x-4" : "translate-x-0.5"}`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div>
          <SectionLabel danger>DANGER ZONE</SectionLabel>
          <div className="border border-red-error/30 bg-[#FF444408] px-5 py-5 flex items-start justify-between gap-6">
            <div>
              <p className="font-mono text-xs font-semibold text-text-primary">Delete Account</p>
              <p className="font-mono text-[10px] text-text-muted mt-1 leading-relaxed max-w-sm">
                Permanently delete your account and all associated data. This action is irreversible.
              </p>
            </div>
            <button className="flex items-center gap-2 border border-red-error text-red-error px-3 py-1.5 font-mono text-xs hover:bg-[#FF444415] transition-colors shrink-0">
              <Trash2 className="w-3.5 h-3.5" />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
