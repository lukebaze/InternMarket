import { createDb } from "../lib/db";
import { agents } from "@repo/db";
import { eq, or } from "drizzle-orm";
import { probeMcpEndpoint } from "../lib/mcp-health-probe";

const BATCH_SIZE = 50;

/**
 * Health check cron: validates MCP endpoints via initialize handshake.
 * - Active agents: pause after 3 consecutive failures
 * - Paused agents: auto-resume when health check passes
 */
export async function handleHealthCheck(env: { DATABASE_URL: string }) {
  const db = createDb(env.DATABASE_URL);

  // Check both active and paused agents (paused ones can auto-resume)
  const checkableAgents = await db.query.agents.findMany({
    where: or(eq(agents.status, "active"), eq(agents.status, "paused")),
  });

  // Process in batches to stay within cron CPU budget
  let checked = 0;
  let paused = 0;
  let resumed = 0;

  for (let i = 0; i < checkableAgents.length; i += BATCH_SIZE) {
    const batch = checkableAgents.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((agent) => checkAgent(db, agent))
    );

    for (const result of results) {
      checked++;
      if (result.status === "fulfilled") {
        if (result.value === "paused") paused++;
        if (result.value === "resumed") resumed++;
      }
    }
  }

  console.log(`[health-check] checked=${checked} paused=${paused} resumed=${resumed}`);
}

type CheckResult = "ok" | "fail" | "paused" | "resumed";

async function checkAgent(
  db: ReturnType<typeof createDb>,
  agent: { id: string; mcpEndpoint: string; status: string; healthCheckFailures: number | null },
): Promise<CheckResult> {
  const { healthy } = await probeMcpEndpoint(agent.mcpEndpoint);

  if (healthy) {
    // Auto-resume paused agents that pass health check
    if (agent.status === "paused") {
      await db.update(agents).set({
        status: "active",
        healthCheckFailures: 0,
      }).where(eq(agents.id, agent.id));
      console.log(`[health-check] agent=${agent.id} resumed`);
      return "resumed";
    }

    // Reset failure count on success
    if ((agent.healthCheckFailures ?? 0) > 0) {
      await db.update(agents).set({ healthCheckFailures: 0 }).where(eq(agents.id, agent.id));
    }
    return "ok";
  }

  // Health check failed
  const newFailures = (agent.healthCheckFailures ?? 0) + 1;
  const updates: Partial<typeof agents.$inferInsert> = { healthCheckFailures: newFailures };

  if (newFailures >= 3 && agent.status === "active") {
    updates.status = "paused";
    console.warn(`[health-check] agent=${agent.id} paused after ${newFailures} failures`);
    await db.update(agents).set(updates).where(eq(agents.id, agent.id));
    return "paused";
  }

  await db.update(agents).set(updates).where(eq(agents.id, agent.id));
  return "fail";
}
