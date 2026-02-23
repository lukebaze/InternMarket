"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/agents", label: "Browse Agents" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/docs", label: "Docs" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-bg-border bg-bg-page">
      <div className="flex h-14 items-center justify-between px-12">
        {/* Logo */}
        <Link href="/" className="font-ui text-[15px] font-semibold text-text-primary tracking-[3px]">
          I N T E R N S
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "font-mono text-[13px] transition-colors",
                pathname.startsWith(href)
                  ? "text-text-primary font-medium"
                  : "text-text-tertiary hover:text-text-secondary"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Wallet connect via RainbowKit */}
          <div className="hidden sm:block">
            <ConnectButton
              chainStatus="icon"
              accountStatus="address"
              showBalance={false}
            />
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1.5 rounded-md text-text-muted hover:text-text-primary"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {open && (
        <div className="md:hidden border-t border-bg-border bg-bg-page px-4 py-3 space-y-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "block px-3 py-2 rounded-md font-mono text-sm",
                pathname.startsWith(href)
                  ? "bg-bg-surface text-text-primary font-medium"
                  : "text-text-tertiary hover:bg-bg-surface hover:text-text-primary"
              )}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
