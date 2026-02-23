/**
 * Shared MCP JSON-RPC 2.0 handler factory for reference agents.
 * Handles: initialize, notifications/initialized, tools/list, tools/call, ping
 */

import { Hono } from "hono";

export interface McpToolDef {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface McpServerInfo {
  name: string;
  version: string;
}

export interface ToolCallResult {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

type ToolHandler = (toolName: string, args: Record<string, unknown>) => ToolCallResult;

/** Create a Hono MCP agent app with JSON-RPC routing */
export function createMcpHandler(
  serverInfo: McpServerInfo,
  tools: McpToolDef[],
  toolHandler: ToolHandler,
) {
  const app = new Hono();

  app.post("/", async (c) => {
    const body = await c.req.json();
    const { method, id } = body;

    switch (method) {
      case "initialize":
        return c.json({
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2025-03-26",
            capabilities: { tools: {} },
            serverInfo,
          },
        });

      case "notifications/initialized":
        return new Response(null, { status: 202 });

      case "tools/list":
        return c.json({ jsonrpc: "2.0", id, result: { tools } });

      case "tools/call": {
        const toolName = body.params?.name;
        const args = body.params?.arguments ?? {};

        const tool = tools.find((t) => t.name === toolName);
        if (!tool) {
          return c.json({
            jsonrpc: "2.0",
            id,
            error: { code: -32602, message: `Unknown tool: ${toolName}` },
          });
        }

        try {
          const result = toolHandler(toolName, args);
          return c.json({ jsonrpc: "2.0", id, result });
        } catch (err) {
          return c.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : "unknown"}` }],
              isError: true,
            },
          });
        }
      }

      case "ping":
        return c.json({ jsonrpc: "2.0", id, result: {} });

      default:
        return c.json({
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: "Method not found" },
        });
    }
  });

  // Health check GET
  app.get("/", (c) => c.json({ status: "ok", server: serverInfo.name }));

  return app;
}
