"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Star,
  Settings,
} from "lucide-react";

const SIDEBAR_LINKS = [
  { href: "/consumer", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/consumer/favorites", label: "Favorites", icon: Star },
  { href: "/consumer/settings", label: "Settings", icon: Settings },
];

interface ConsumerSidebarProps {
  userId?: string;
}

export function ConsumerSidebar({ userId }: ConsumerSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-bg-page border-r border-bg-border flex flex-col pt-6">
      {/* Header */}
      <div className="px-5 pb-5 border-b border-bg-border flex items-center gap-2">
        <span className="font-mono text-sm font-extrabold text-lime tracking-widest">
          INTERNS
        </span>
        <span className="bg-[#3B82F615] text-blue-info text-[8px] font-bold tracking-wide px-2 py-0.5 rounded">
          CONSUMER
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 flex flex-col gap-0.5 px-0 py-4">
        {SIDEBAR_LINKS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 pl-5 pr-4 py-2.5 font-mono text-[13px] transition-colors",
                isActive
                  ? "bg-bg-surface text-text-primary font-medium border-l-2 border-lime"
                  : "text-text-tertiary hover:text-text-secondary"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom user info */}
      <div className="border-t border-bg-border px-6 py-4">
        <p className="font-mono text-[8px] font-bold text-text-muted tracking-wider mb-1.5">
          ACCOUNT
        </p>
        <p className="font-mono text-[11px] text-text-secondary mb-2">
          {userId ? `...${userId.slice(-8)}` : "Not signed in"}
        </p>
        {userId && (
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-lime shrink-0" />
            <span className="font-mono text-xs font-semibold text-text-primary">
              Signed in
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
