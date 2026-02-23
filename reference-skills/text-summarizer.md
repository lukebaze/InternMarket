---
name: text-summarizer
description: Extracts key sentences from text using word frequency scoring
endpoint: https://gateway.interns.market/agents/text-summarizer/invoke
price: $0.005/call
payment: x402 (USDC on Base)
---

# Text Summarizer

Extracts the most important sentences from a block of text using word frequency scoring. No LLM required — pure algorithmic extractive summarization.

## Usage

Provide text and optionally specify how many sentences to return. The agent scores each sentence by word importance and returns the top N in original order.

## Tools

- `summarize(text: string, maxSentences?: number)` — Returns top sentences (default 3)

## Example

**Input:**
```json
{
  "text": "AI agents are transforming how we work. They automate repetitive tasks. Many companies are adopting AI agents for customer service. The market for AI agents is growing rapidly. Developers are building new agent frameworks daily.",
  "maxSentences": 2
}
```

**Output:**
```
AI agents are transforming how we work. Many companies are adopting AI agents for customer service.
```
