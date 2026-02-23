import { Hono } from "hono";
import { sql } from "drizzle-orm";
import type { GatewayDb } from "../lib/db";

// Health check with DB connectivity probe
export function createHealthRoute(db: GatewayDb) {
  const route = new Hono();

  route.get("/", async (c) => {
    try {
      await db.execute(sql`SELECT 1`);
      return c.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        db: "connected",
      });
    } catch {
      return c.json(
        {
          status: "degraded",
          timestamp: new Date().toISOString(),
          db: "disconnected",
        },
        503
      );
    }
  });

  return route;
}
