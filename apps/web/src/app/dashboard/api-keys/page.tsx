"use client";

import { ApiKeyInfoBanner } from "@/components/dashboard/api-keys/api-key-info-banner";
import { ApiKeyCardList } from "@/components/dashboard/api-keys/api-key-card-list";
import { ApiKeyUsageStats } from "@/components/dashboard/api-keys/api-key-usage-stats";

export default function ApiKeysPage() {
  return (
    <>
      <div className="flex items-center justify-between h-14 px-8 border-b border-bg-border shrink-0">
        <h1 className="font-ui text-lg font-semibold text-text-primary">API Keys</h1>
        <button className="flex items-center gap-2 bg-lime text-black font-mono text-xs font-semibold px-4 py-2 hover:brightness-110 transition-all">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Generate Key
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <ApiKeyInfoBanner />

        <div className="flex flex-col gap-3">
          <span className="font-mono text-[10px] font-bold text-text-muted tracking-wider">ACTIVE KEYS</span>
          <ApiKeyCardList />
        </div>

        <div className="flex flex-col gap-3">
          <span className="font-mono text-[10px] font-bold text-text-muted tracking-wider">USAGE &amp; RATE LIMITS</span>
          <ApiKeyUsageStats />
        </div>
      </div>
    </>
  );
}
