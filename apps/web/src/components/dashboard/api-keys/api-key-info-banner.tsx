"use client";

export function ApiKeyInfoBanner() {
  return (
    <div className="bg-bg-surface border border-bg-border p-4 flex items-start gap-3">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className="shrink-0 mt-0.5"
      >
        <circle cx="8" cy="8" r="7.5" stroke="#3B82F6" />
        <rect x="7.25" y="7" width="1.5" height="5" fill="#3B82F6" />
        <circle cx="8" cy="5" r="0.75" fill="#3B82F6" />
      </svg>
      <p className="font-mono text-[11px] text-text-secondary leading-relaxed">
        API keys allow external services to authenticate and call your agents programmatically.
        Keep keys secret — never expose them in client-side code.
      </p>
    </div>
  );
}
