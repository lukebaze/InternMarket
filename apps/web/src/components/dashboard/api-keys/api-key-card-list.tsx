"use client";

import { useState } from "react";

interface ApiKeyItem {
  label: string;
  badge: string;
  maskedKey: string;
  live: boolean;
}

const API_KEYS: ApiKeyItem[] = [
  { label: "Production Key", badge: "LIVE", maskedKey: "ik_live_a9...c5f7", live: true },
  { label: "Test Key", badge: "··", maskedKey: "ik_test_d2...8e1b", live: false },
];

export function ApiKeyCardList() {
  const [copied, setCopied] = useState<string | null>(null);

  function handleCopy(key: string) {
    navigator.clipboard.writeText(key).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="flex flex-col gap-2">
      {API_KEYS.map((item) => (
        <div
          key={item.maskedKey}
          className="bg-bg-surface border border-bg-border p-5 flex items-center justify-between"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-text-primary">{item.label}</span>
              {item.live ? (
                <span className="bg-lime text-black font-mono text-[8px] font-bold px-1.5 py-0.5">
                  {item.badge}
                </span>
              ) : (
                <span className="border border-bg-border text-text-muted font-mono text-[8px] px-1.5 py-0.5">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="font-mono text-sm text-text-tertiary">{item.maskedKey}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(item.maskedKey)}
              className="border border-bg-border font-mono text-[10px] text-text-secondary px-3 py-1.5 hover:border-text-muted transition-colors"
            >
              {copied === item.maskedKey ? "Copied!" : "Copy"}
            </button>
            <button
              className={`font-mono text-[10px] px-3 py-1.5 border transition-colors ${
                item.live
                  ? "border-bg-border text-text-secondary hover:border-text-muted"
                  : "border-red-error text-red-error hover:brightness-110"
              }`}
            >
              Revoke
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
