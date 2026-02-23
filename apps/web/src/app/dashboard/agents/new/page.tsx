import { auth } from "@/lib/auth";
import { AgentForm } from "@/components/dashboard/agent-form";

export default async function NewAgentPage() {
  const session = await auth();
  const walletAddress = (session?.user as { address?: string })?.address;

  return <AgentForm walletAddress={walletAddress} />;
}
