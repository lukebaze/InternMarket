import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { AgentForm } from "@/components/dashboard/agent-form";
import { createNodeClient, agents, creators } from "@repo/db";
import { eq } from "drizzle-orm";
import type { Agent } from "@repo/types";

interface EditAgentPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAgentPage({ params }: EditAgentPageProps) {
  const { id } = await params;
  const { userId } = await auth();

  let agent: Agent | null = null;
  let ownerKey: string | null = null;

  try {
    const url = process.env.DATABASE_URL;
    if (url) {
      const db = createNodeClient(url);
      const rows = await db
        .select({ agent: agents, ownerKey: creators.clerkUserId })
        .from(agents)
        .leftJoin(creators, eq(agents.creatorId, creators.id))
        .where(eq(agents.id, id))
        .limit(1);

      if (rows.length) {
        agent = rows[0].agent as unknown as Agent;
        ownerKey = rows[0].ownerKey ?? null;
      }
    }
  } catch {
    // DB not available — show 404
  }

  if (!agent) notFound();
  if (ownerKey !== userId) notFound();

  return <AgentForm agent={agent} />;
}
