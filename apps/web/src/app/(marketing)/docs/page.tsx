import type { Metadata } from "next";
import Link from "next/link";
import { GettingStartedContent } from "@/components/marketing/getting-started-content";

export const metadata: Metadata = {
  title: "Getting Started",
  description: "How to install and publish Claude Code agents on InternMarket",
};

export default function DocsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Link href="/" className="font-mono text-xs text-text-muted hover:text-text-primary transition-colors">
          &larr; Home
        </Link>
      </div>
      <GettingStartedContent />
    </div>
  );
}
