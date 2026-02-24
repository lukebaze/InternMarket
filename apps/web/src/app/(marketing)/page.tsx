import type { Metadata } from "next";
import { AnimatedLanding } from "@/components/marketing/animated-landing";

export const metadata: Metadata = {
  title: "InternMarket - The App Store for Claude Code Agents",
  description:
    "Discover & install Claude Code agents in one command. Publish & monetize yours in minutes.",
  openGraph: {
    title: "InternMarket",
    description: "The App Store for Claude Code Agents",
    url: "https://interns.market",
    siteName: "InternMarket",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "InternMarket",
    description:
      "Discover & install Claude Code agents in one command. Publish & monetize yours in minutes.",
  },
};

export default function LandingPage() {
  return <AnimatedLanding />;
}
