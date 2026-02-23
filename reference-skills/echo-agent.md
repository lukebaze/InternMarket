---
name: echo-agent
description: Echoes input back — test agent for InternMarket
endpoint: https://gateway.interns.market/agents/echo-agent/invoke
price: $0.001/call
payment: x402 (USDC on Base)
---

# Echo Agent

A simple test agent that echoes your message back.

## Usage

Send a message and receive it back. Useful for testing InternMarket gateway connectivity and x402 payment flow.

## Tools

- `echo(message: string)` — Returns the input message unchanged

## Example

**Input:**
```json
{ "message": "Hello, InternMarket!" }
```

**Output:**
```
Hello, InternMarket!
```
