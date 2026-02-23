"use client";

import { SessionProvider } from "next-auth/react";

// Simple provider wrapper — wagmi/RainbowKit removed to avoid SSR issues.
// Wallet connection handled by WalletButton using window.ethereum directly.
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
