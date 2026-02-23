"use client";

import { useState, useEffect, useCallback } from "react";

// Simple wallet connect button using window.ethereum directly.
// No wagmi/RainbowKit dependency — avoids SSR provider issues.
export function WalletButton() {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  // Check if already connected on mount
  useEffect(() => {
    const eth = (window as { ethereum?: { request: (args: { method: string }) => Promise<string[]> } }).ethereum;
    if (!eth) return;
    eth.request({ method: "eth_accounts" }).then((accounts) => {
      if (accounts[0]) setAddress(accounts[0]);
    }).catch(() => {});
  }, []);

  const connect = useCallback(async () => {
    const eth = (window as { ethereum?: { request: (args: { method: string }) => Promise<string[]> } }).ethereum;
    if (!eth) {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }
    setConnecting(true);
    try {
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      if (accounts[0]) setAddress(accounts[0]);
    } catch {
      // User rejected or error
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
  }, []);

  if (address) {
    return (
      <button
        onClick={disconnect}
        className="font-mono text-[13px] px-3 py-1.5 rounded-lg border border-bg-border bg-bg-surface text-text-primary hover:bg-bg-page transition-colors"
      >
        {address.slice(0, 6)}...{address.slice(-4)}
      </button>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={connecting}
      className="font-mono text-[13px] px-4 py-1.5 rounded-lg bg-text-primary text-bg-page hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {connecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
