"use client";

import { useState } from "react";
import { PlaygroundHeader } from "./playground-header";
import { PlaygroundRequestPanel } from "./playground-request-panel";
import { PlaygroundResponsePanel } from "./playground-response-panel";

const MOCK_RESPONSE = {
  score: 72,
  grade: "B",
  issues: [
    {
      severity: "high",
      type: "missing_meta_description",
      message: "No meta description found on 12 pages",
    },
    {
      severity: "medium",
      type: "slow_page_load",
      message: "LCP > 2.5s on /products page",
    },
    {
      severity: "low",
      type: "broken_links",
      message: "3 broken internal links found",
    },
  ],
  recommendations: 8,
  pages_analyzed: 24,
};

export default function AgentPlaygroundPage() {
  const [hasResponse, setHasResponse] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-[#000]">
      <PlaygroundHeader agentName="SEO Optimizer Pro" />
      <div className="flex flex-1 overflow-hidden">
        <PlaygroundRequestPanel onExecute={() => setHasResponse(true)} />
        <PlaygroundResponsePanel response={hasResponse ? MOCK_RESPONSE : null} />
      </div>
    </div>
  );
}
