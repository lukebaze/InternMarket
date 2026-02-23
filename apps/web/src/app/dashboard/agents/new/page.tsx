import { auth } from "@/lib/auth";
import { AgentForm } from "@/components/dashboard/agent-form";

export default async function NewAgentPage() {
  const session = await auth();
  const walletAddress = (session?.user as { address?: string })?.address;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">New Agent</h1>
        <p className="text-sm text-gray-500 mt-1">Register your MCP agent on the marketplace.</p>
      </div>
      <AgentForm walletAddress={walletAddress} />
    </div>
  );
}
