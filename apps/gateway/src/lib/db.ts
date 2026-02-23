import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@repo/db";

// Create a Neon HTTP drizzle client suitable for CF Workers (stateless)
export function createDb(databaseUrl: string) {
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

export type GatewayDb = ReturnType<typeof createDb>;
