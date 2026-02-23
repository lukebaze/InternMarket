"use client";

export function ApiKeyUsageStats() {
  return (
    <div className="flex gap-4">
      {/* Requests Today */}
      <div className="flex-1 bg-bg-surface border border-bg-border p-6 flex flex-col gap-3">
        <span className="font-mono text-[10px] text-text-tertiary">REQUESTS TODAY</span>
        <span className="font-ui text-2xl font-semibold text-text-primary">2,847</span>
        <div className="flex flex-col gap-1.5">
          <div className="h-1 bg-bg-border w-full">
            <div className="h-full bg-lime" style={{ width: "28.47%" }} />
          </div>
          <span className="font-mono text-[9px] text-text-muted">2,847 / 10,000</span>
        </div>
      </div>

      {/* Rate Limit */}
      <div className="flex-1 bg-bg-surface border border-bg-border p-6 flex flex-col gap-3">
        <span className="font-mono text-[10px] text-text-tertiary">RATE LIMIT</span>
        <span className="font-ui text-2xl font-semibold text-text-primary">100 req/min</span>
        <span className="font-mono text-[11px] text-text-muted">Per API key</span>
      </div>

      {/* Total Keys */}
      <div className="flex-1 bg-bg-surface border border-bg-border p-6 flex flex-col gap-3">
        <span className="font-mono text-[10px] text-text-tertiary">TOTAL KEYS</span>
        <span className="font-ui text-2xl font-semibold text-text-primary">2 / 5</span>
        <span className="font-mono text-[11px] text-text-muted">Max 5 active keys</span>
      </div>
    </div>
  );
}
