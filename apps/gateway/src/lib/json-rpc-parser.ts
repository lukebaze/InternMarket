/** Type-safe JSON-RPC 2.0 body parser for MCP Streamable HTTP transport */

export interface ParsedJsonRpc {
  jsonrpc: string;
  method: string;
  id: string | number | null;
  params: Record<string, unknown> | null;
  /** Extracted tool name when method is "tools/call" */
  toolName: string | null;
}

/**
 * Parse raw JSON-RPC body string. Returns null on invalid input.
 * Extracts toolName from params.name when method is "tools/call".
 */
export function parseJsonRpc(raw: string): ParsedJsonRpc | null {
  try {
    const body = JSON.parse(raw);
    if (typeof body !== "object" || body === null) return null;
    if (body.jsonrpc !== "2.0") return null;
    if (typeof body.method !== "string") return null;

    const params = typeof body.params === "object" ? body.params : null;
    const toolName =
      body.method === "tools/call" && params && typeof params.name === "string"
        ? params.name
        : null;

    return {
      jsonrpc: body.jsonrpc,
      method: body.method,
      id: body.id ?? null,
      params,
      toolName,
    };
  } catch {
    return null;
  }
}
