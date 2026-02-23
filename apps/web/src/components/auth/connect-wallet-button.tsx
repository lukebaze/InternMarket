"use client";

import { useAccount, useSignMessage } from "wagmi";
import { useSession, signIn, signOut } from "next-auth/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SiweMessage } from "siwe";

export function ConnectWalletButton() {
  const { address, chainId, isConnected } = useAccount();
  const { data: session, status } = useSession();
  const { signMessageAsync } = useSignMessage();

  async function handleSignIn() {
    if (!address || !chainId) return;
    try {
      const nonceRes = await fetch("/api/nonce");
      const nonce = await nonceRes.text();

      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to Interns Market",
        uri: window.location.origin,
        version: "1",
        chainId,
        nonce,
      });

      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      });

      await signIn("credentials", {
        message: JSON.stringify(message),
        signature,
        redirect: false,
      });
    } catch (err) {
      console.error("SIWE sign-in failed:", err);
    }
  }

  async function handleSignOut() {
    await signOut({ redirect: false });
  }

  // Not connected — show RainbowKit connect button
  if (!isConnected) {
    return <ConnectButton />;
  }

  // Connected but no session — show Sign In button
  if (!session && status !== "loading") {
    return (
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <span style={{ fontFamily: "monospace", fontSize: "14px" }}>
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <button
          onClick={handleSignIn}
          style={{
            padding: "6px 14px",
            borderRadius: "8px",
            background: "#0070f3",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Sign In
        </button>
      </div>
    );
  }

  // Connected + authenticated session — show address + Sign Out
  if (session) {
    return (
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <span style={{ fontFamily: "monospace", fontSize: "14px" }}>
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <button
          onClick={handleSignOut}
          style={{
            padding: "6px 14px",
            borderRadius: "8px",
            background: "#e5e7eb",
            color: "#111",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  return null;
}
