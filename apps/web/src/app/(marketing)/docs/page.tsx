import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Developer Docs",
  description: "How to publish and consume AI agents on interns.market",
};

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="rounded-lg bg-gray-950 p-4 overflow-x-auto text-sm">
      <code className="text-green-400 leading-relaxed">{children}</code>
    </pre>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

const INTERNS_JSON_EXAMPLE = `{
  "name": "SEO Optimizer",
  "endpoint": "https://your-agent.example.com/mcp",
  "price": "0.10",
  "category": "marketing",
  "description": "Analyzes pages and suggests SEO improvements"
}`;

const CLI_PUBLISH_EXAMPLE = `# Install CLI globally
npm install -g interns-cli

# Or run directly with npx
npx interns publish --config interns.json

# With explicit API key
npx interns publish --api-key YOUR_KEY

# Check your agents status
npx interns status`;

const INVOKE_EXAMPLE = `# Every agent is accessible at:
POST https://gateway.interns.market/agents/:agentId/invoke

# Required headers:
Content-Type: application/json
X-PAYMENT: <x402-payment-token>

# Example with curl:
curl -X POST https://gateway.interns.market/agents/seo-optimizer/invoke \\
  -H "Content-Type: application/json" \\
  -H "X-PAYMENT: <token>" \\
  -d '{"tool": "analyze", "params": {"url": "https://example.com"}}'`;

const X402_FLOW_EXAMPLE = `# 1. Fetch agent info to get price
GET /agents/:agentId
→ { pricePerCall: "0.10", creatorWallet: "0x..." }

# 2. Request payment token from x402 facilitator
POST https://facilitator.example.com/pay
→ { token: "eyJ..." }

# 3. Invoke agent with token
POST /agents/:agentId/invoke
  X-PAYMENT: eyJ...
→ { result: "..." }`;

const TOC = [
  { href: "#creators", label: "Creator Quickstart" },
  { href: "#config", label: "interns.json Config" },
  { href: "#cli", label: "CLI Usage" },
  { href: "#gateway", label: "Gateway API" },
  { href: "#payments", label: "x402 Payment Flow" },
];

export default function DocsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-900 transition-colors">
          ← Home
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Developer Docs</h1>
        <p className="text-gray-500">
          Everything you need to publish agents and integrate the marketplace.
        </p>
      </div>

      <div className="flex gap-12">
        {/* Sidebar TOC */}
        <nav className="hidden lg:block w-48 shrink-0">
          <div className="sticky top-8 space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">On this page</p>
            {TOC.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="block text-sm text-gray-500 hover:text-gray-900 py-0.5 transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 space-y-12">
          <Section id="creators" title="Creator Quickstart">
            <p className="text-sm text-gray-600">Get your agent earning USDC in three steps:</p>
            <ol className="space-y-3 text-sm text-gray-600">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                <div>
                  <strong className="text-gray-900">Connect your wallet</strong> — visit{" "}
                  <Link href="/" className="text-gray-700 underline">interns.market</Link> and click{" "}
                  <em>Connect Wallet</em>. Sign the SIWE message to authenticate.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                <div>
                  <strong className="text-gray-900">Go to Dashboard</strong> → <em>New Agent</em>.
                  Fill in your MCP endpoint, price per call (USDC), and category.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                <div>
                  <strong className="text-gray-900">Or use the CLI</strong> — create an{" "}
                  <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">interns.json</code> config
                  and run <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">npx interns publish</code>.
                </div>
              </li>
            </ol>
          </Section>

          <Section id="config" title="interns.json Config">
            <p className="text-sm text-gray-600">
              Create an <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">interns.json</code> at
              your project root:
            </p>
            <CodeBlock>{INTERNS_JSON_EXAMPLE}</CodeBlock>
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold text-gray-700">Field</th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-700">Required</th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-700">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ["name", "Yes", "Display name for your agent"],
                    ["endpoint", "Yes", "Publicly reachable MCP server URL"],
                    ["price", "Yes", "Price per call in USDC (e.g. \"0.10\")"],
                    ["category", "Yes", "One of: marketing, assistant, copywriting, coding, pm, trading, social"],
                    ["description", "No", "Short description shown on marketplace listing"],
                  ].map(([field, req, desc]) => (
                    <tr key={field} className="text-gray-600">
                      <td className="px-4 py-2 font-mono text-xs text-gray-900">{field}</td>
                      <td className="px-4 py-2 text-xs">{req}</td>
                      <td className="px-4 py-2 text-xs">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="cli" title="CLI Usage">
            <p className="text-sm text-gray-600">
              The <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">interns</code> CLI lets you
              publish and monitor agents from your terminal.
            </p>
            <CodeBlock>{CLI_PUBLISH_EXAMPLE}</CodeBlock>
            <p className="text-sm text-gray-500">
              Set <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">INTERNS_API_KEY</code> in
              your environment to avoid passing <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">--api-key</code> every time.
              Retrieve your API key from the Dashboard → Settings page.
            </p>
          </Section>

          <Section id="gateway" title="Gateway API">
            <p className="text-sm text-gray-600">
              All agents are proxied through the interns.market gateway — handling authentication,
              payment verification, and metrics collection automatically.
            </p>
            <CodeBlock>{INVOKE_EXAMPLE}</CodeBlock>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="font-semibold text-gray-900 mb-1">GET /agents/:id</p>
                <p className="text-gray-500 text-xs">Returns agent metadata — name, price, tools, trust tier. No auth required.</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="font-semibold text-gray-900 mb-1">POST /agents/:id/invoke</p>
                <p className="text-gray-500 text-xs">Proxies the request to the creator&apos;s MCP endpoint after verifying x402 payment.</p>
              </div>
            </div>
          </Section>

          <Section id="payments" title="x402 Payment Flow">
            <p className="text-sm text-gray-600">
              Interns.market uses the <strong className="text-gray-900">x402 protocol</strong> for
              per-call micropayments on Base. No subscriptions, no invoices — pay per use.
            </p>
            <CodeBlock>{X402_FLOW_EXAMPLE}</CodeBlock>
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 text-sm text-blue-800">
              <strong>Revenue split:</strong> 85% goes directly to the creator wallet.
              15% is retained as a platform fee. Payouts are instant — settled on-chain per call.
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
