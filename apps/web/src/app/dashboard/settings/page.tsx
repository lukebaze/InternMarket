"use client";

import { SettingsProfileSection } from "@/components/dashboard/settings/settings-profile-section";
import { SettingsNotificationsSection } from "@/components/dashboard/settings/settings-notifications-section";
import { SettingsDangerZoneSection } from "@/components/dashboard/settings/settings-danger-zone-section";

export default function SettingsPage() {
  return (
    <>
      <div className="flex items-center justify-between h-14 px-8 border-b border-bg-border shrink-0">
        <h1 className="font-ui text-lg font-semibold text-text-primary">Settings</h1>
        <button className="flex items-center gap-2 bg-lime text-black font-mono text-xs font-semibold px-4 py-2 hover:brightness-110 transition-all">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Save Changes
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <SettingsProfileSection />
        <SettingsNotificationsSection />
        <SettingsDangerZoneSection />
      </div>
    </>
  );
}
