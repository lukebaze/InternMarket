"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Agent, AgentCategory } from "@repo/types";
import { createAgent, updateAgent } from "@/lib/actions/agent-actions";

const CATEGORIES: AgentCategory[] = [
  "marketing", "assistant", "copywriting", "coding", "pm",
  "trading", "social", "devops", "data", "design",
];

interface AgentFormProps {
  agent?: Agent;
}

const inputClass = "w-full bg-[#0A0A0A] border border-bg-border px-3.5 py-2.5 font-mono text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lime/40 transition-colors";

export function AgentForm({ agent }: AgentFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = agent
        ? await updateAgent(agent.id, formData)
        : await createAgent(formData);
      if (!result.success) {
        setError(result.error ?? `Failed to ${agent ? "update" : "create"} intern`);
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
            {isEdit ? "Edit Intern" : "Register New Intern"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.back()} className="font-mono text-xs font-medium text-text-secondary border border-bg-border px-4 py-2 hover:bg-bg-surface transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isPending} className="bg-lime text-black font-mono text-xs font-semibold px-4 py-2 hover:brightness-110 transition-all disabled:opacity-50">
            {isPending ? "Saving..." : isEdit ? "Update Intern" : "Register Intern"}
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
              <label className="block font-mono text-[11px] font-medium text-text-secondary">Intern Name</label>
              <input type="text" name="name" required defaultValue={agent?.name} placeholder="e.g. SEO Optimizer Pro" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] font-medium text-text-secondary">Description</label>
              <textarea name="description" required rows={3} defaultValue={agent?.description} placeholder="Describe what your intern does..." className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] font-medium text-text-secondary">Category</label>
              <select name="category" required defaultValue={agent?.category ?? ""} className={inputClass}>
                <option value="" disabled>Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] font-medium text-text-secondary">Tags</label>
              <input
                type="text"
                name="tags"
                defaultValue={agent?.tags?.join(", ")}
                placeholder="e.g. seo, content, optimization (comma-separated)"
                className={inputClass}
              />
              <p className="font-mono text-[10px] text-text-muted">Separate tags with commas</p>
            </div>
          </div>
        </section>

        {/* PACKAGE — only shown on create */}
        {!isEdit && (
          <section className="space-y-5">
            <p className="font-mono text-[10px] font-bold text-text-muted uppercase tracking-wide">Package</p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] font-medium text-text-secondary">Package File (.internagent)</label>
                <div className="border border-dashed border-bg-border p-6 text-center">
                  <input
                    type="file"
                    name="packageFile"
                    accept=".internagent"
                    className="w-full font-mono text-xs text-text-muted file:mr-4 file:py-1.5 file:px-3 file:border file:border-bg-border file:bg-transparent file:font-mono file:text-xs file:text-text-secondary hover:file:border-lime/40 transition-colors"
                  />
                  <p className="font-mono text-[10px] text-text-muted mt-2">Upload your .internagent bundle file</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] font-medium text-text-secondary">Version</label>
                <input type="text" name="version" required defaultValue="1.0.0" placeholder="1.0.0" className={inputClass} />
                <p className="font-mono text-[10px] text-text-muted">Semantic versioning (e.g. 1.0.0, 2.1.3)</p>
              </div>
              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] font-medium text-text-secondary">Changelog</label>
                <textarea
                  name="changelog"
                  rows={3}
                  placeholder="What's new in this version..."
                  className={inputClass}
                />
              </div>
            </div>
          </section>
        )}

      </div>
    </form>
  );
}
