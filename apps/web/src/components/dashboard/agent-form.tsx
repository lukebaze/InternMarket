"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import type { Agent, AgentCategory } from "@repo/types";
import { createAgent, updateAgent } from "@/lib/actions/agent-actions";
import { useMcpValidation } from "./use-mcp-validation";

const CATEGORIES: AgentCategory[] = [
  "marketing", "assistant", "copywriting", "coding", "pm", "trading", "social",
];

interface AgentFormProps {
  agent?: Agent;
  walletAddress?: string;
}

interface ToolEntry { name: string; description: string }

const inputClass = "w-full bg-[#0A0A0A] border border-bg-border px-3.5 py-2.5 font-mono text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lime/40 transition-colors";

export function AgentForm({ agent, walletAddress }: AgentFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [tools, setTools] = useState<ToolEntry[]>(
    (agent?.tools as ToolEntry[] | undefined) ?? [{ name: "", description: "" }],
  );
  const { mcpStatus, mcpError, validateMcp } = useMcpValidation(!!agent);

  function handleValidate() {
    const input = formRef.current?.querySelector<HTMLInputElement>("[name=mcpEndpoint]");
    if (!input?.value) return;
    validateMcp(input.value, (result) => {
      if (result.name && nameInputRef.current && !nameInputRef.current.value) {
        nameInputRef.current.value = result.name;
      }
      if (result.tools?.length) {
        setTools(result.tools.map((t) => ({ name: t.name, description: t.description ?? "" })));
      }
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (mcpStatus !== "valid") {
      setError("Please validate your MCP endpoint before submitting");
      return;
    }
    const formData = new FormData(e.currentTarget);
    formData.set("tools", JSON.stringify(tools.filter((t) => t.name.trim())));

    startTransition(async () => {
      const result = agent
        ? await updateAgent(agent.id, formData)
        : await createAgent(formData);
      if (!result.success) {
        setError(result.error ?? `Failed to ${agent ? "update" : "create"} agent`);
        return;
      }
      router.push("/dashboard/agents");
    });
  }

  const isEdit = !!agent;

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between h-14 px-8 border-b border-bg-border shrink-0">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.back()} className="text-text-muted hover:text-text-secondary transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-ui text-lg font-semibold text-text-primary">
            {isEdit ? "Edit Agent" : "Register New Agent"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.back()} className="font-mono text-xs font-medium text-text-secondary border border-bg-border px-4 py-2 hover:bg-bg-surface transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isPending} className="bg-lime text-black font-mono text-xs font-semibold px-4 py-2 hover:brightness-110 transition-all disabled:opacity-50">
            {isPending ? "Saving..." : isEdit ? "Update Agent" : "Register Agent"}
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {error && (
          <div className="bg-red-error/10 border border-red-error/30 px-4 py-3 font-mono text-sm text-red-error">{error}</div>
        )}

        {/* BASIC INFORMATION */}
        <section className="space-y-5">
          <p className="font-mono text-[10px] font-bold text-text-muted uppercase tracking-wide">Basic Information</p>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] font-medium text-text-secondary">Agent Name</label>
              <input ref={nameInputRef} type="text" name="name" required defaultValue={agent?.name} placeholder="e.g. SEO Optimizer Pro" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] font-medium text-text-secondary">Description</label>
              <textarea name="description" required rows={3} defaultValue={agent?.description} placeholder="Describe what your agent does..." className={inputClass} />
            </div>
            <div className="flex gap-4">
              <div className="flex-1 space-y-1.5">
                <label className="block font-mono text-[11px] font-medium text-text-secondary">Category</label>
                <select name="category" required defaultValue={agent?.category ?? ""} className={inputClass}>
                  <option value="" disabled>Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="block font-mono text-[11px] font-medium text-text-secondary">Price per call (USDC)</label>
                <input type="number" name="pricePerCall" required defaultValue={agent?.pricePerCall} placeholder="0.01" step="0.000001" min="0" className={inputClass} />
              </div>
            </div>
          </div>
        </section>

        {/* MCP CONFIGURATION */}
        <section className="space-y-5">
          <p className="font-mono text-[10px] font-bold text-text-muted uppercase tracking-wide">MCP Configuration</p>
          <div className="space-y-1.5">
            <label className="block font-mono text-[11px] font-medium text-text-secondary">MCP Server URL</label>
            <div className="flex gap-2">
              <input type="url" name="mcpEndpoint" required defaultValue={agent?.mcpEndpoint} placeholder="https://your-agent.example.com/mcp" className={`flex-1 ${inputClass}`} />
              <button type="button" onClick={handleValidate} disabled={mcpStatus === "validating"} className="bg-bg-surface border border-bg-border px-4 py-2.5 font-mono text-xs font-medium text-text-secondary hover:text-text-primary hover:border-lime/40 transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0">
                {mcpStatus === "validating" && <Loader2 className="w-3 h-3 animate-spin" />}
                {mcpStatus === "valid" && <CheckCircle2 className="w-3 h-3 text-lime" />}
                {mcpStatus === "invalid" && <XCircle className="w-3 h-3 text-red-error" />}
                {mcpStatus === "validating" ? "Validating..." : "Validate"}
              </button>
            </div>
            {mcpStatus === "valid" && <p className="font-mono text-[10px] text-lime">MCP endpoint validated successfully</p>}
            {mcpStatus === "invalid" && mcpError && <p className="font-mono text-[10px] text-red-error">{mcpError}</p>}
            <p className="font-mono text-[10px] text-text-muted">Validate your MCP server to auto-discover agent name and tools</p>
          </div>
        </section>

        {/* TOOLS */}
        <section className="space-y-5">
          <p className="font-mono text-[10px] font-bold text-text-muted uppercase tracking-wide">Tools</p>
          <p className="font-mono text-[11px] text-text-tertiary">Define the tools your agent exposes via MCP protocol</p>
          <div className="space-y-2">
            {tools.map((tool, i) => (
              <div key={i} className="bg-bg-surface border border-bg-border p-4 space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1 space-y-1.5">
                    <label className="block font-mono text-[10px] font-medium text-text-muted">Tool Name</label>
                    <input type="text" value={tool.name} onChange={(e) => setTools((prev) => prev.map((t, j) => j === i ? { ...t, name: e.target.value } : t))} placeholder="analyze_page" className={inputClass} />
                  </div>
                  <div className="flex-[2] space-y-1.5">
                    <label className="block font-mono text-[10px] font-medium text-text-muted">Description</label>
                    <input type="text" value={tool.description} onChange={(e) => setTools((prev) => prev.map((t, j) => j === i ? { ...t, description: e.target.value } : t))} placeholder="Analyze a URL and give SEO tips" className={inputClass} />
                  </div>
                  {tools.length > 1 && (
                    <button type="button" onClick={() => setTools((prev) => prev.filter((_, j) => j !== i))} className="self-end pb-2 text-text-muted hover:text-red-error transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setTools((prev) => [...prev, { name: "", description: "" }])} className="flex items-center justify-center gap-2 w-full border border-bg-border py-3 font-mono text-xs text-text-muted hover:text-text-secondary hover:border-text-muted transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Tool
            </button>
          </div>
        </section>

        {/* Wallet display (read-only) */}
        {walletAddress && (
          <section className="space-y-5">
            <p className="font-mono text-[10px] font-bold text-text-muted uppercase tracking-wide">Creator</p>
            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] font-medium text-text-secondary">Wallet Address</label>
              <input type="text" value={walletAddress} readOnly className={`${inputClass} text-text-muted cursor-not-allowed`} />
            </div>
          </section>
        )}
      </div>
    </form>
  );
}
