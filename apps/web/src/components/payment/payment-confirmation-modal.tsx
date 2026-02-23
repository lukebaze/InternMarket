"use client";

import { X, ShieldCheck, Bot, CircleCheck, Info, Lock } from "lucide-react";

interface PaymentConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  agentName: string;
  toolName: string;
  pricePerCall: string;
}

export function PaymentConfirmationModal({
  open,
  onClose,
  onConfirm,
  agentName,
  toolName,
  pricePerCall,
}: PaymentConfirmationModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="bg-[#111] border border-[#1A1A1A] w-[520px] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#1A1A1A] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#BFFF0015] rounded p-2">
              <ShieldCheck className="w-5 h-5 text-[#BFFF00]" />
            </div>
            <span className="font-ui text-base font-semibold text-[#FFF]">Confirm Payment</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#404040] hover:text-[#999] transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6">
          {/* Agent info card */}
          <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-md p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#1A1A1A] flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-[#BFFF00]" />
            </div>
            <div>
              <p className="font-ui text-sm font-semibold text-[#FFF]">{agentName}</p>
              <p className="font-mono text-[11px] text-[#6e6e6e] mt-0.5">{toolName}</p>
            </div>
          </div>

          {/* Cost breakdown */}
          <div className="flex flex-col gap-0">
            <p className="font-mono text-[9px] font-bold text-[#404040] tracking-wider mb-2">
              COST BREAKDOWN
            </p>
            <div className="flex justify-between items-center border-b border-[#1A1A1A] py-2.5">
              <span className="font-mono text-xs text-[#6e6e6e]">Agent Fee</span>
              <span className="font-mono text-xs text-[#FFF]">$0.085 USDC</span>
            </div>
            <div className="flex justify-between items-center border-b border-[#1A1A1A] py-2.5">
              <span className="font-mono text-xs text-[#6e6e6e]">Platform Fee (15%)</span>
              <span className="font-mono text-xs text-[#FFF]">$0.015 USDC</span>
            </div>
            <div className="flex justify-between items-center py-2.5">
              <span className="font-ui text-sm font-semibold text-[#FFF]">Total</span>
              <span className="font-mono font-bold text-sm text-[#BFFF00]">{pricePerCall}</span>
            </div>
          </div>

          {/* Wallet balance */}
          <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-md p-4 flex justify-between items-center">
            <div>
              <p className="font-mono text-[9px] font-bold text-[#404040] tracking-wider mb-1">
                WALLET BALANCE
              </p>
              <p className="font-ui text-lg font-semibold text-[#FFF]">24.50 USDC</p>
            </div>
            <div className="bg-[#BFFF0015] rounded px-2.5 py-1.5 flex items-center gap-1.5">
              <CircleCheck className="w-3 h-3 text-[#BFFF00]" />
              <span className="font-mono text-[10px] font-semibold text-[#BFFF00]">Sufficient</span>
            </div>
          </div>

          {/* Protocol note */}
          <div className="bg-[#3B82F610] rounded p-3 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-[#3B82F6] shrink-0 mt-0.5" />
            <p className="font-mono text-[10px] text-[#6e6e6e] leading-relaxed">
              Payment processed via x402 protocol. Funds deducted from your connected wallet.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1A1A1A] flex justify-end gap-3 items-center">
          <button
            onClick={onClose}
            className="font-mono text-xs text-[#6e6e6e] hover:text-[#999] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-[#BFFF00] text-black font-mono text-xs font-bold px-6 py-2.5 flex items-center gap-2 hover:brightness-110 transition-all"
          >
            <Lock className="w-3.5 h-3.5" />
            Confirm &amp; Pay $0.10
          </button>
        </div>
      </div>
    </div>
  );
}
