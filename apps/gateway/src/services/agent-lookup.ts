import { eq } from "drizzle-orm";
import { agents } from "@repo/db";
import type { GatewayDb } from "../lib/db";

// Fetch agent by ID — returns null if not found
export async function getAgentById(db: GatewayDb, agentId: string) {
  const result = await db.query.agents.findFirst({
    where: eq(agents.id, agentId),
  });
  return result ?? null;
}

// Fetch agent only if status is "active"
export async function getActiveAgent(db: GatewayDb, agentId: string) {
  const agent = await getAgentById(db, agentId);
  if (!agent || agent.status !== "active") return null;
  return agent;
}
