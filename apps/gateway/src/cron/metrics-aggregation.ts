import { createDb } from "../lib/db";
import { agentMetrics } from "@repo/db";
import { sql, lt } from "drizzle-orm";

const CLEANUP_THRESHOLD_MS = 31 * 24 * 60 * 60 * 1000; // 31 days — must exceed 30-day trust window

/**
 * Hourly metrics aggregation: rolls up per-request rows into hourly summaries.
 * Uses INSERT ... ON CONFLICT to merge rows sharing the same (agent_id, timestamp) bucket.
 * Deletes aggregated rows older than 31 days (trust-recalc uses 30-day window).
 */
export async function handleMetricsAggregation(env: { DATABASE_URL: string }) {
  const db = createDb(env.DATABASE_URL);

  // Aggregate: merge duplicate rows per (agent_id, timestamp) bucket into single summary
  // This collapses multiple per-request rows into one aggregated row per hour per agent
  try {
    await db.execute(sql`
      WITH duplicates AS (
        SELECT agent_id, timestamp,
          SUM(total_requests) as total_reqs,
          SUM(successful_requests) as success_reqs,
          SUM(failed_requests) as fail_reqs,
          ROUND(AVG(avg_latency_ms)) as avg_lat,
          MAX(p95_latency_ms) as p95_lat,
          SUM(unique_consumers) as consumers,
          COUNT(*) as row_count
        FROM agent_metrics
        GROUP BY agent_id, timestamp
        HAVING COUNT(*) > 1
      )
      UPDATE agent_metrics am
      SET
        total_requests = d.total_reqs,
        successful_requests = d.success_reqs,
        failed_requests = d.fail_reqs,
        avg_latency_ms = d.avg_lat,
        p95_latency_ms = d.p95_lat,
        unique_consumers = d.consumers
      FROM duplicates d
      WHERE am.agent_id = d.agent_id
        AND am.timestamp = d.timestamp
        AND am.id = (
          SELECT id FROM agent_metrics
          WHERE agent_id = d.agent_id AND timestamp = d.timestamp
          ORDER BY id LIMIT 1
        )
    `);

    // Delete duplicate rows (keep the first one per bucket, updated above)
    await db.execute(sql`
      DELETE FROM agent_metrics
      WHERE id NOT IN (
        SELECT DISTINCT ON (agent_id, timestamp) id
        FROM agent_metrics
        ORDER BY agent_id, timestamp, id
      )
    `);
  } catch (err) {
    console.error("[metrics-aggregation] aggregation failed:", err);
  }

  // Cleanup: delete rows older than 48 hours
  const cutoff = new Date(Date.now() - CLEANUP_THRESHOLD_MS);
  try {
    const deleted = await db
      .delete(agentMetrics)
      .where(lt(agentMetrics.timestamp, cutoff))
      .returning({ id: agentMetrics.id });

    console.log(`[metrics-aggregation] cleaned=${deleted.length} old rows`);
  } catch (err) {
    console.error("[metrics-aggregation] cleanup failed:", err);
  }
}
