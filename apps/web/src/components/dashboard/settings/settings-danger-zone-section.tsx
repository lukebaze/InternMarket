"use client";

export function SettingsDangerZoneSection() {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-[10px] font-bold text-red-error tracking-wider">DANGER ZONE</span>
      <div className="bg-bg-surface border border-red-error p-5 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-ui text-sm font-semibold text-text-primary">Delete Account</span>
          <span className="font-mono text-[11px] text-text-tertiary">
            Permanently delete your account and all associated agents, data, and files.
          </span>
        </div>
        <button className="shrink-0 bg-red-error text-white font-mono text-xs font-semibold px-4 py-2.5 hover:brightness-110 transition-all">
          Delete Account
        </button>
      </div>
    </div>
  );
}
