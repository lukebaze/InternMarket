"use client";

import { useState } from "react";

const TABS = ["Use Agents", "Sell Agents"] as const;
type Tab = (typeof TABS)[number];

interface StepProps {
  num: number;
  title: string;
  desc: string;
  code?: string;
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="rounded-lg bg-gray-950 p-4 overflow-x-auto text-sm">
      <code className="text-lime-400 leading-relaxed">{children}</code>
    </pre>
  );
}

function Step({ num, title, desc, code }: StepProps) {
  return (
    <div className="flex gap-4">
      <span className="w-7 h-7 rounded-full bg-lime text-black text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
        {num}
      </span>
      <div className="flex-1 space-y-2">
        <h3 className="font-ui text-sm font-semibold text-text-primary">{title}</h3>
        <p className="font-mono text-xs text-text-tertiary leading-relaxed">{desc}</p>
        {code && <CodeBlock>{code}</CodeBlock>}
      </div>
    </div>
  );
}

const BUYER_STEPS: StepProps[] = [
  {
    num: 1,
    title: "Install the CLI",
    desc: "Get the InternMarket CLI from npm.",
    code: "npm install -g internmarket",
  },
  {
    num: 2,
    title: "Browse agents",
    desc: "Search the marketplace from your terminal or visit /agents in the browser.",
    code: "internmarket search <keyword>",
  },
  {
    num: 3,
    title: "Install an agent",
    desc: "Install any agent with a single command. It downloads to your local environment.",
    code: "internmarket install <slug>",
  },
  {
    num: 4,
    title: "Use with Claude Code",
    desc: "The agent is automatically available in your Claude Code session. No extra config needed.",
  },
];

const SELLER_STEPS: StepProps[] = [
  {
    num: 1,
    title: "Connect your wallet",
    desc: "Authenticate with your Ethereum wallet to claim your creator profile.",
    code: "internmarket login",
  },
  {
    num: 2,
    title: "Initialize your project",
    desc: "Scaffold a new agent project with the required manifest file.",
    code: "internmarket init",
  },
  {
    num: 3,
    title: "Build your agent",
    desc: "Create your CLAUDE.md, tools, and prompts. Any Claude Code skill works.",
  },
  {
    num: 4,
    title: "Package it",
    desc: "Bundle your agent into a distributable .clawagent package.",
    code: "internmarket package",
  },
  {
    num: 5,
    title: "Publish",
    desc: "Push your package to the InternMarket registry. It will be live in seconds.",
    code: "internmarket publish",
  },
];

export function GettingStartedContent() {
  const [activeTab, setActiveTab] = useState<Tab>("Use Agents");
  const steps = activeTab === "Use Agents" ? BUYER_STEPS : SELLER_STEPS;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="font-ui text-3xl font-semibold text-text-primary mb-2">Getting Started</h1>
        <p className="font-mono text-sm text-text-tertiary">
          Everything you need to install or publish Claude Code agents.
        </p>
      </div>

      {/* Tab buttons */}
      <div className="flex gap-3">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-md font-mono text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-lime text-black font-semibold"
                : "bg-bg-surface border border-bg-border text-text-secondary hover:border-lime/50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-8">
        {steps.map((step) => (
          <Step key={step.num} {...step} />
        ))}
      </div>
    </div>
  );
}
