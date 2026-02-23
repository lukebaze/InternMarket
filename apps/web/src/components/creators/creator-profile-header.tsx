"use client";

import { truncateAddress, formatUSDC, formatNumber } from "@/lib/utils";

interface CreatorProfileHeaderProps {
  displayName: string | null;
  walletAddress: string;
  bio: string | null;
  totalAgents: number;
  totalCalls: number;
  totalRevenue: string;
  avgTrustScore: number;
}

export function CreatorProfileHeader({
  displayName,
  walletAddress,
  bio,
  totalAgents,
  totalCalls,
  totalRevenue,
  avgTrustScore,
}: CreatorProfileHeaderProps) {
  const name = displayName ?? truncateAddress(walletAddress);

  function copyUrl() {
    navigator.clipboard.writeText(window.location.href);
  }

  return (
    <div className="border-b border-bg-border pb-6 mb-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-ui text-2xl font-bold text-text-primary mb-1">{name}</h1>
          <p className="font-mono text-xs text-text-muted">{truncateAddress(walletAddress)}</p>
          {bio && <p className="font-mono text-sm text-text-tertiary mt-3 leading-relaxed max-w-2xl">{bio}</p>}
        </div>
        <button
          onClick={copyUrl}
          className="shrink-0 font-mono text-[11px] font-medium text-text-secondary border border-bg-border px-3 py-1.5 hover:bg-bg-surface hover:border-text-muted transition-colors"
        >
          Share Profile
        </button>
      </div>

      {/* Stats row */}
      <div className="flex gap-6 mt-5">
        <Stat label="Agents" value={formatNumber(totalAgents)} />
        <Stat label="Total Calls" value={formatNumber(totalCalls)} />
        <Stat label="Revenue" value={formatUSDC(totalRevenue)} />
        <Stat label="Avg Trust" value={avgTrustScore.toFixed(1)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] text-text-muted uppercase tracking-wide">{label}</p>
      <p className="font-ui text-lg font-semibold text-text-primary">{value}</p>
    </div>
  );
}
