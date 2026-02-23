import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: {
    default: "Interns.market - AI Agent Marketplace",
    template: "%s | Interns.market",
  },
  description: "Monetize your AI agents. Publish MCP servers, set prices, earn USDC.",
  openGraph: {
    title: "Interns.market",
    description: "Stripe for AI Agents",
    url: "https://interns.market",
    siteName: "Interns.market",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Interns.market",
    description: "Monetize your AI agents with x402 payments",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-bg-page font-mono text-text-primary">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
