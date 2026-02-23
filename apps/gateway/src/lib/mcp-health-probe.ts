/**
 * MCP initialize handshake probe for health checks.
 * Sends a standard MCP initialize message and validates the response.
 */

export interface ProbeResult {
  healthy: boolean;
  latencyMs: number;
}

export async function probeMcpEndpoint(url: string, timeoutMs = 5000): Promise<ProbeResult> {
  const start = Date.now();

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2025-03-26",
          capabilities: {},
          clientInfo: { name: "InternMarket-HealthCheck", version: "1.0" },
        },
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });

    const latencyMs = Date.now() - start;

    // Accept any 2xx response — agent may not implement full MCP spec yet
    if (!res.ok) return { healthy: false, latencyMs };

    // Validate it's a JSON-RPC response (basic check)
    const data = await res.json().catch(() => null);
    const isValid = data && typeof data === "object" && ("result" in data || "jsonrpc" in data);

    return { healthy: !!isValid, latencyMs };
  } catch {
    return { healthy: false, latencyMs: Date.now() - start };
  }
}
