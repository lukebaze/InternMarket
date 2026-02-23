import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PlaygroundHeaderProps {
  agentName: string;
}

export function PlaygroundHeader({ agentName }: PlaygroundHeaderProps) {
  return (
    <header className="h-14 border-b border-[#1A1A1A] px-8 flex justify-between items-center shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <Link href="/agents" className="text-[#404040] hover:text-[#999] transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="font-mono font-bold tracking-widest text-sm text-[#BFFF00]">
          I N T E R N S
        </span>
        <span className="text-[#404040] text-sm">/</span>
        <span className="font-ui text-sm font-semibold text-[#FFF]">{agentName}</span>
        <span className="bg-[#BFFF00] text-black font-mono text-[9px] font-bold px-2.5 py-1 tracking-wider">
          PLAYGROUND
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button className="font-mono text-xs text-[#999] border border-[#1A1A1A] px-4 py-2 hover:border-[#333] transition-colors">
          Docs
        </button>
        <button className="bg-[#BFFF00] text-black font-mono text-xs font-semibold px-4 py-2 hover:brightness-110 transition-all">
          Connect Wallet
        </button>
      </div>
    </header>
  );
}
