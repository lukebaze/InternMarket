"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Agent, AgentCategory } from "@repo/types";
import { createAgent, updateAgent } from "@/lib/actions/agent-actions";
import { cn } from "@/lib/utils";

const CATEGORIES: AgentCategory[] = [
  "marketing", "assistant", "copywriting", "coding", "pm", "trading", "social",
];

interface AgentFormProps {
  agent?: Agent;
  walletAddress?: string;
}

export function AgentForm({ agent, walletAddress }: AgentFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      if (agent) {
        const result = await updateAgent(agent.id, formData);
        if (!result.success) { setError(result.error ?? "Failed to update agent"); return; }
        router.push("/dashboard/agents");
      } else {
        const result = await createAgent(formData);
        if (!result.success) { setError(result.error ?? "Failed to create agent"); return; }
        router.push("/dashboard/agents");
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Field label="Agent Name" name="name" required defaultValue={agent?.name} placeholder="My Awesome Agent" />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          required
          rows={3}
          defaultValue={agent?.description}
          placeholder="What does this agent do?"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <select name="category" required defaultValue={agent?.category ?? ""} className={inputClass}>
          <option value="" disabled>Select a category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
      </div>

      <Field label="MCP Endpoint URL" name="mcpEndpoint" required type="url" defaultValue={agent?.mcpEndpoint} placeholder="https://your-agent.example.com/mcp" />
      <Field label="Price per Call (USDC)" name="pricePerCall" required type="number" defaultValue={agent?.pricePerCall} placeholder="0.01" step="0.000001" min="0" />

      {walletAddress && (
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">Creator Wallet</label>
          <input
            type="text"
            value={walletAddress}
            readOnly
            className={cn(inputClass, "bg-gray-50 text-gray-500 font-mono text-xs")}
          />
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Saving..." : agent ? "Update Agent" : "Create Agent"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent";

interface FieldProps {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  step?: string;
  min?: string;
}

function Field({ label, name, required, type = "text", defaultValue, placeholder, step, min }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        step={step}
        min={min}
        className={inputClass}
      />
    </div>
  );
}
