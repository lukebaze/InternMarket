"use client";

import { Copy } from "lucide-react";
import { useState } from "react";

interface PlaygroundResponsePanelProps {
  response: Record<string, unknown> | null;
}

export function PlaygroundResponsePanel({ response }: PlaygroundResponsePanelProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!response) return;
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Panel header */}
      <div className="border-b border-[#1A1A1A] px-8 py-4 flex justify-between items-center shrink-0">
        <span className="font-mono text-[10px] font-bold text-[#404040] tracking-wider">RESPONSE</span>
        {response && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              <span className="font-mono text-[10px] text-green-400">200 OK</span>
            </div>
            <span className="font-mono text-[10px] text-[#404040]">142ms</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 font-mono text-[10px] text-[#404040] border border-[#1A1A1A] px-2.5 py-1 hover:border-[#333] hover:text-[#999] transition-colors"
            >
              <Copy className="w-3 h-3" />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        )}
      </div>

      {/* Panel content */}
      <div className="p-8 overflow-y-auto flex-1">
        {response ? (
          <pre className="font-mono text-xs text-[#FFF] leading-relaxed whitespace-pre-wrap">
            {JSON.stringify(response, null, 2)}
          </pre>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="font-mono text-xs text-[#404040]">Execute a tool to see the response.</p>
          </div>
        )}
      </div>
    </div>
  );
}
