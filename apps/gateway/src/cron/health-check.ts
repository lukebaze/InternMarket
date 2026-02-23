import { createDb } from "../lib/db";
import { agents } from "@repo/db";
import { eq } from "drizzle-orm";

export async function handleHealthCheck(env: { DATABASE_URL: string }) {
  const db = createDb(env.DATABASE_URL);

  const activeAgents = await db.query.agents.findMany({
    where: eq(agents.status, "active"),
  });

  const results = await Promise.allSettled(
    activeAgents.map((agent) => checkAgent(db, agent))
  );

  const failed = results.filter((r) => r.status === "rejected").length;
  console.log(`[health-check] checked=${activeAgents.length} errors=${failed}`);
}

async function checkAgent(
  db: ReturnType<typeof createDb>,
  agent: { id: string; mcpEndpoint: string; healthCheckFailures: number | null }
) {
  try {
    const res = await fetch(agent.mcpEndpoint, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    // Reset failure count on success only if it was non-zero
    if ((agent.healthCheckFailures ?? 0) > 0) {
      await db
        .update(agents)
        .set({ healthCheckFailures: 0 })
        .where(eq(agents.id, agent.id));
    }
  } catch {
    const newFailures = (agent.healthCheckFailures ?? 0) + 1;
    const updates: Partial<typeof agents.$inferInsert> = {
      healthCheckFailures: newFailures,
    };

    // Pause after 3 consecutive failures
    if (newFailures >= 3) {
      updates.status = "paused";
      console.warn(`[health-check] agent=${agent.id} paused after ${newFailures} failures`);
    }

    await db.update(agents).set(updates).where(eq(agents.id, agent.id));
  }
}
