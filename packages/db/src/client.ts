import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// For Next.js / Node.js — standard pg pool
export function createNodeClient(databaseUrl: string) {
  const pool = new Pool({ connectionString: databaseUrl });
  return drizzleNode(pool, { schema });
}
