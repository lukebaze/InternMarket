"use client";

import { useState, useCallback } from "react";

export type McpStatus = "idle" | "validating" | "valid" | "invalid";

export interface McpValidationResult {
  name?: string;
  tools?: { name: string; description?: string }[];
}

/**
 * Hook for MCP endpoint validation with status tracking.
 * Calls /api/mcp/validate and returns status + discovered metadata.
 */
export function useMcpValidation(initialValid = false) {
  const [mcpStatus, setMcpStatus] = useState<McpStatus>(initialValid ? "valid" : "idle");
  const [mcpError, setMcpError] = useState<string | null>(null);

  const validateMcp = useCallback(async (
    endpoint: string,
    onSuccess?: (result: McpValidationResult) => void,
  ) => {
    if (!endpoint) return;
    setMcpStatus("validating");
    setMcpError(null);

    try {
      const res = await fetch("/api/mcp/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint }),
      });
      const data = await res.json();

      if (data.valid) {
        setMcpStatus("valid");
        onSuccess?.({ name: data.name, tools: data.tools });
      } else {
        setMcpStatus("invalid");
        setMcpError(data.error ?? "Validation failed");
      }
    } catch {
      setMcpStatus("invalid");
      setMcpError("Network error during validation");
    }
  }, []);

  return { mcpStatus, mcpError, validateMcp };
}
