"use client";

export function SettingsProfileSection() {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-[10px] font-bold text-text-muted tracking-wider">PROFILE</span>
      <div className="bg-bg-surface border border-bg-border p-6 flex flex-col gap-5">
        {/* Avatar row */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-lime flex items-center justify-center shrink-0">
            <span className="font-ui text-xs font-bold text-black">S</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-xs font-semibold text-text-primary">SEO Labs</span>
            <span className="font-mono text-[10px] text-text-tertiary">0x7b2c...e4f8</span>
          </div>
        </div>

        {/* Name + Website */}
        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="font-mono text-[10px] text-text-muted">Display Name</label>
            <input
              defaultValue="SEO Labs"
              className="bg-[#0A0A0A] border border-bg-border p-2.5 font-mono text-xs text-text-primary outline-none focus:border-text-muted transition-colors w-full"
            />
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="font-mono text-[10px] text-text-muted">Website</label>
            <input
              defaultValue="https://seolabs.io"
              className="bg-[#0A0A0A] border border-bg-border p-2.5 font-mono text-xs text-text-primary outline-none focus:border-text-muted transition-colors w-full"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] text-text-muted">Bio</label>
          <textarea
            defaultValue="Building AI-powered SEO tools for the modern web."
            rows={3}
            className="bg-[#0A0A0A] border border-bg-border p-2.5 font-mono text-xs text-text-primary outline-none focus:border-text-muted transition-colors resize-none w-full"
          />
        </div>
      </div>
    </div>
  );
}
