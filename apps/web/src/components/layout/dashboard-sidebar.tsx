"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, truncateAddress } from "@/lib/utils";
import {
  LayoutDashboard,
  Bot,
  Receipt,
  TrendingUp,
  Key,
  Settings,
} from "lucide-react";

const SIDEBAR_LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/agents", label: "My Agents", icon: Bot },
  { href: "/dashboard/transactions", label: "Transactions", icon: Receipt },
  { href: "/dashboard/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface DashboardSidebarProps {
  walletAddress?: string;
}

export function DashboardSidebar({ walletAddress }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-bg-surface border-r border-bg-border flex flex-col pt-6">
      {/* Logo */}
      <div className="px-5 pb-5 border-b border-bg-border">
        <Link href="/" className="font-mono text-sm font-bold text-lime">
          interns.market
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3 py-4">
        {SIDEBAR_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 font-mono text-[13px] transition-colors",
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

      {/* Wallet display at bottom */}
      {walletAddress && (
        <div className="border-t border-bg-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-bg-border flex items-center justify-center">
              <span className="text-text-muted text-xs font-mono">
                {walletAddress.slice(2, 4).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-mono text-xs text-text-primary">
                {truncateAddress(walletAddress)}
              </p>
              <p className="font-mono text-[10px] text-text-muted">Creator</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
