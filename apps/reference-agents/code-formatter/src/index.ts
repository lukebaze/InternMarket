import { createMcpHandler } from "../../shared/mcp-handler";

/** Format JSON or TypeScript code */
function formatCode(code: string, language: string): string {
  if (language === "json") {
    return JSON.stringify(JSON.parse(code), null, 2);
  }

  // TypeScript: basic indent normalization (no full parser for MVP)
  return code
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\t/g, "  ")
    .trim();
}

const app = createMcpHandler(
  { name: "code-formatter", version: "1.0.0" },
  [
    {
      name: "format",
      description: "Formats JSON or TypeScript code with proper indentation.",
      inputSchema: {
        type: "object",
        properties: {
          code: { type: "string", description: "Code to format" },
          language: { type: "string", enum: ["json", "typescript"], description: "Language" },
        },
        required: ["code", "language"],
      },
    },
  ],
  (_toolName, args) => {
    const code = String(args.code ?? "");
    const lang = String(args.language ?? "typescript");
    try {
      const result = formatCode(code, lang);
      return { content: [{ type: "text", text: result }] };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Format error: ${err instanceof Error ? err.message : "invalid input"}` }],
        isError: true,
      };
    }
  },
);

export default app;
