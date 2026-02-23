import { createMcpHandler } from "../../shared/mcp-handler";

/** Simple extractive summarization — score sentences by word frequency */
function summarize(text: string, maxSentences = 3): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  if (sentences.length <= maxSentences) return text.trim();

  // Score words by frequency (ignore short/common words)
  const words = text.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);

  // Score each sentence by sum of its word frequencies
  const scored = sentences.map((s, i) => {
    const sWords = s.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
    const score = sWords.reduce((sum, w) => sum + (freq.get(w) ?? 0), 0);
    return { sentence: s.trim(), score, index: i };
  });

  // Return top N sentences in original order
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.index - b.index)
    .map((s) => s.sentence)
    .join(" ");
}

const app = createMcpHandler(
  { name: "text-summarizer", version: "1.0.0" },
  [
    {
      name: "summarize",
      description: "Extracts key sentences from text using word frequency scoring.",
      inputSchema: {
        type: "object",
        properties: {
          text: { type: "string", description: "Text to summarize" },
          maxSentences: { type: "number", description: "Max sentences to return (default 3)" },
        },
        required: ["text"],
      },
    },
  ],
  (_toolName, args) => {
    const text = String(args.text ?? "");
    const max = typeof args.maxSentences === "number" ? args.maxSentences : 3;
    const result = summarize(text, max);
    return { content: [{ type: "text", text: result }] };
  },
);

export default app;
