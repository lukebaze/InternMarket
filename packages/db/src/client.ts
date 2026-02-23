import { drizzle as drizzleNeonHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";
import * as schema from "./schema";

// For Cloudflare Workers / edge — Neon serverless HTTP driver
export function createNeonClient(databaseUrl: string) {
  const sql = neon(databaseUrl);
  return drizzleNeonHttp(sql, { schema });
}

// For Next.js / Node.js — standard pg pool
export function createNodeClient(databaseUrl: string) {
  const pool = new Pool({ connectionString: databaseUrl });
  return drizzleNode(pool, { schema });
}
