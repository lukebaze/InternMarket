/**
 * Seed script for InternMarket package marketplace.
 * Creates demo creators, agents, versions, and ratings.
 * Idempotent: safe to re-run (uses onConflictDoNothing).
 * Run: pnpm db:seed (requires DATABASE_URL env var)
 */
import { createNodeClient } from "./client";
import { creators, agents, agentVersions, ratings } from "./schema";
import { CREATORS_DATA, buildAgentData, buildRatingData } from "./seed-data";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL env var is required");
  process.exit(1);
}

const db = createNodeClient(DATABASE_URL);

async function seed() {
  console.log("Seeding InternMarket database...\n");

  // 1. Create demo creators (idempotent on clerkUserId)
  const insertedCreators = await db
    .insert(creators)
    .values([...CREATORS_DATA])
    .onConflictDoNothing()
    .returning();

  // If creators already exist, re-fetch them
  const allCreators = insertedCreators.length === CREATORS_DATA.length
    ? insertedCreators
    : await db.query.creators.findMany();

  const alice = allCreators.find((c) => c.clerkUserId === CREATORS_DATA[0].clerkUserId)!;
  const bob = allCreators.find((c) => c.clerkUserId === CREATORS_DATA[1].clerkUserId)!;
  const carol = allCreators.find((c) => c.clerkUserId === CREATORS_DATA[2].clerkUserId)!;
  console.log(`Creators ready: ${allCreators.length}`);

  // 2. Create demo agents (idempotent on slug)
  const creatorIds = { alice: alice.id, bob: bob.id, carol: carol.id };
  const agentData = buildAgentData(creatorIds);

  const insertedAgents = await db
    .insert(agents)
    .values(agentData)
    .onConflictDoNothing()
    .returning();

  const allAgents = insertedAgents.length === agentData.length
    ? insertedAgents
    : await db.query.agents.findMany();
  console.log(`Agents ready: ${allAgents.length}`);

  // 3. Create version history (idempotent on agentId+version)
  const versionData = allAgents.flatMap((a) => {
    const versions = [
      { agentId: a.id, version: a.currentVersion, packageUrl: a.packageUrl, packageSize: a.packageSize, sha256Hash: `sha256-demo-${a.slug}-${a.currentVersion}`, changelog: "Latest release", downloads: a.downloads ?? 0 },
    ];
    if (a.currentVersion !== "1.0.0" && a.currentVersion !== "0.9.0" && a.currentVersion !== "0.8.0") {
      versions.unshift({
        agentId: a.id, version: "1.0.0", packageUrl: a.packageUrl.replace(a.currentVersion, "1.0.0"), packageSize: Math.floor(a.packageSize * 0.8), sha256Hash: `sha256-demo-${a.slug}-1.0.0`, changelog: "Initial release", downloads: Math.floor((a.downloads ?? 0) * 0.3),
      });
    }
    return versions;
  });

  await db.insert(agentVersions).values(versionData).onConflictDoNothing();
  console.log(`Versions ready: ${versionData.length}`);

  // 4. Create sample ratings (idempotent on agentId+userId)
  const agentIdBySlug: Record<string, string> = {};
  for (const a of allAgents) agentIdBySlug[a.slug] = a.id;

  const ratingData = buildRatingData(agentIdBySlug, creatorIds);
  await db.insert(ratings).values(ratingData).onConflictDoNothing();
  console.log(`Ratings ready: ${ratingData.length}`);

  console.log("\nSeed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
