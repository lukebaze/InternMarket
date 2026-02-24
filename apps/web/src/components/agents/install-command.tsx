"use client";
import { useState } from "react";

interface InstallCommandProps {
  slug: string;
  version?: string;
}

export function InstallCommand({ slug, version }: InstallCommandProps) {
  const [copied, setCopied] = useState(false);
  const command = version ? `internmarket install ${slug}@${version}` : `internmarket install ${slug}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 rounded-lg border border-lime-500/30 bg-black/50 px-4 py-3 font-mono text-sm">
      <span className="text-zinc-400">$</span>
      <code className="flex-1 text-lime-400">{command}</code>
      <button
        onClick={handleCopy}
        className="shrink-0 rounded px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
