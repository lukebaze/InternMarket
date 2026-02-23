/**
 * MCP 3-step validation: reachable -> initialize -> tools/list
 * Used for agent registration to verify MCP endpoint validity.
 */

export interface McpTool {
  name: string;
  description?: string;
}

export interface McpValidationResult {
  valid: boolean;
  name?: string;
  tools?: McpTool[];
  error?: string;
}

const STEP_TIMEOUT_MS = 10_000;

/**
 * Step 1: Check if endpoint is reachable via HEAD request.
 */
async function checkReachable(url: string): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), STEP_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    });
    // Accept any response (even 405 Method Not Allowed) — just need TCP reachability
    if (!res.ok && res.status !== 405 && res.status !== 404) {
      throw new Error(`Endpoint returned ${res.status}`);
    }
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Step 2: Send MCP initialize handshake and extract server info.
 */
async function mcpInitialize(url: string): Promise<{ name?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), STEP_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2025-03-26",
          capabilities: {},
          clientInfo: { name: "InternMarket", version: "1.0" },
        },
      }),
    });

    if (!res.ok) throw new Error(`Initialize returned ${res.status}`);

    const data = await res.json();
    const serverName = data?.result?.serverInfo?.name;
    return { name: serverName ?? undefined };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Step 3: Request tools/list to extract the agent's tool catalog.
 */
async function mcpToolsList(url: string): Promise<McpTool[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), STEP_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/list",
        params: {},
      }),
    });

    if (!res.ok) throw new Error(`tools/list returned ${res.status}`);

    const data = await res.json();
    const rawTools = data?.result?.tools;
    if (!Array.isArray(rawTools)) return [];

    return rawTools.map((t: { name?: string; description?: string }) => ({
      name: t.name ?? "unknown",
      description: t.description,
    }));
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Full 3-step MCP endpoint validation.
 * Returns { valid, name, tools } on success, { valid: false, error } on failure.
 */
export async function validateMcpEndpoint(url: string): Promise<McpValidationResult> {
  try {
    // Validate URL format
    new URL(url);
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }

  try {
    // Step 1: Reachability
    await checkReachable(url);
  } catch (err) {
    return {
      valid: false,
      error: `Endpoint unreachable: ${err instanceof Error ? err.message : "unknown error"}`,
    };
  }

  // Step 2: Initialize handshake
  let name: string | undefined;
  try {
    const init = await mcpInitialize(url);
    name = init.name;
  } catch (err) {
    return {
      valid: false,
      error: `MCP initialize failed: ${err instanceof Error ? err.message : "unknown error"}`,
    };
  }

  // Step 3: Tools list (graceful — allow manual entry if fails)
  let tools: McpTool[] = [];
  try {
    tools = await mcpToolsList(url);
  } catch {
    // Non-fatal: tools/list might not be implemented yet
  }

  return { valid: true, name, tools };
}
