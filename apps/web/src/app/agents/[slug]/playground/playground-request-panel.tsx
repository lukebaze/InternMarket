"use client";

import { useState } from "react";
import { ChevronDown, Play } from "lucide-react";
import { PaymentConfirmationModal } from "@/components/payment/payment-confirmation-modal";

const TOOLS = [
  { value: "analyze_page", label: "analyze_page", description: "Analyze a URL and provide SEO improvement suggestions" },
  { value: "audit_keywords", label: "audit_keywords", description: "Audit keyword density and relevance across pages" },
  { value: "check_backlinks", label: "check_backlinks", description: "Check backlink profile and domain authority" },
];

interface PlaygroundRequestPanelProps {
  onExecute: () => void;
}

export function PlaygroundRequestPanel({ onExecute }: PlaygroundRequestPanelProps) {
  const [selectedTool, setSelectedTool] = useState("analyze_page");
  const [url, setUrl] = useState("https://example.com");
  const [depth, setDepth] = useState("3");
  const [modalOpen, setModalOpen] = useState(false);

  const tool = TOOLS.find((t) => t.value === selectedTool) ?? TOOLS[0];

  function handleExecuteClick() {
    setModalOpen(true);
  }

  function handleConfirm() {
    setModalOpen(false);
    onExecute();
  }

  return (
    <>
      <div className="w-[480px] shrink-0 bg-[#111] border-r border-[#1A1A1A] flex flex-col overflow-hidden">
        {/* Panel header */}
        <div className="border-b border-[#1A1A1A] px-6 py-4 flex justify-between items-center shrink-0">
          <span className="font-mono text-[10px] font-bold text-[#404040] tracking-wider">REQUEST</span>
          <span className="font-mono text-[10px] text-[#BFFF00]">Cost per call: $0.10 USDC</span>
        </div>

        {/* Panel content */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto flex-1">
          {/* Tool select */}
          <div className="flex flex-col gap-2">
            <label className="font-mono text-[11px] font-medium text-[#999]">Select Tool</label>
            <div className="relative">
              <select
                value={selectedTool}
                onChange={(e) => setSelectedTool(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#1A1A1A] p-2.5 font-mono text-xs text-[#FFF] appearance-none pr-8 focus:outline-none focus:border-[#333]"
              >
                {TOOLS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#404040] pointer-events-none" />
            </div>
            <p className="font-mono text-[10px] text-[#6e6e6e]">{tool.description}</p>
          </div>

          {/* Parameters */}
          <div className="flex flex-col gap-3">
            <label className="font-mono text-[11px] font-medium text-[#999]">Parameters</label>
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] text-[#404040]">url</span>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-[#0A0A0A] border border-[#1A1A1A] p-2.5 font-mono text-xs text-[#FFF] focus:outline-none focus:border-[#333]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] text-[#404040]">depth</span>
              <input
                type="text"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                className="bg-[#0A0A0A] border border-[#1A1A1A] p-2.5 font-mono text-xs text-[#FFF] focus:outline-none focus:border-[#333]"
              />
            </div>
          </div>

          {/* Execute button */}
          <button
            onClick={handleExecuteClick}
            className="bg-[#BFFF00] text-black w-full py-3.5 flex items-center justify-center gap-2 hover:brightness-110 transition-all"
          >
            <Play className="w-3.5 h-3.5" fill="currentColor" />
            <span className="font-mono text-xs font-semibold">Execute — $0.10 USDC</span>
          </button>

          {/* Agent info */}
          <div className="border-t border-[#1A1A1A] pt-4 flex items-center gap-4 flex-wrap">
            <span className="font-mono text-[10px] text-[#404040]">MCP</span>
            <span className="font-mono text-[10px] text-[#404040]">142ms latency</span>
            <span className="font-mono text-[10px] text-[#404040]">
              <span className="text-[#BFFF00]">4.8 ★</span> rating
            </span>
            <span className="font-mono text-[10px] text-[#404040]">23,411 calls</span>
          </div>
        </div>
      </div>

      <PaymentConfirmationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        agentName="SEO Optimizer Pro"
        toolName={selectedTool}
        pricePerCall="$0.10 USDC"
      />
    </>
  );
}
