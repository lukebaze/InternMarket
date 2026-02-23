import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { AgentForm } from "@/components/dashboard/agent-form";
import { createNodeClient } from "@repo/db";
import { agents } from "@repo/db";
import { eq } from "drizzle-orm";
import type { Agent } from "@repo/types";

interface EditAgentPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAgentPage({ params }: EditAgentPageProps) {
  const { id } = await params;
  const session = await auth();
  const walletAddress = (session?.user as { address?: string })?.address;

  let agent: Agent | null = null;
  try {
    const url = process.env.DATABASE_URL;
    if (url) {
      const db = createNodeClient(url);
      const rows = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
      if (rows.length) agent = rows[0] as unknown as Agent;
    }
  } catch {
    // DB not available yet — show empty form fallback
  }

  if (!agent) notFound();

  // Authorization check
  if (agent.creatorWallet !== walletAddress) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Edit Agent</h1>
        <p className="text-sm text-gray-500 mt-1">Update your agent&apos;s details.</p>
      </div>
      <AgentForm agent={agent} walletAddress={walletAddress} />
    </div>
  );
}
