import { createMcpHandler } from "../../shared/mcp-handler";

const app = createMcpHandler(
  { name: "echo-agent", version: "1.0.0" },
  [
    {
      name: "echo",
      description: "Echoes the input message back. Useful for testing connectivity.",
      inputSchema: {
        type: "object",
        properties: { message: { type: "string", description: "Message to echo" } },
        required: ["message"],
      },
    },
  ],
  (_toolName, args) => ({
    content: [{ type: "text", text: String(args.message ?? "") }],
  }),
);

export default app;
