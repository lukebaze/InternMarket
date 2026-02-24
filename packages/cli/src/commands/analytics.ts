/**
 * analytics.ts — display download analytics for published agents
 * Shows table: Agent, Downloads (total), Rating, Versions
 */
import { isAuthenticated } from "../lib/auth-store.js";
import { apiGet } from "../lib/api-client.js";
import { error, createSpinner } from "../lib/logger.js";
import chalk from "chalk";

interface AgentStats {
  slug: string;
  name: string;
  downloads: number;
  rating: number | null;
  versionCount: number;
}

function formatTable(stats: AgentStats[]): void {
  const rows = stats.map((s) => ({
    Agent: s.slug,
    Name: s.name,
    "Downloads (total)": s.downloads,
    Rating: s.rating != null ? s.rating.toFixed(1) : "—",
    Versions: s.versionCount,
  }));
  console.table(rows);
}

export async function analyticsCmd(slug?: string): Promise<void> {
  if (!isAuthenticated()) {
    error("Not authenticated. Run: internmarket login");
    process.exit(1);
  }

  const endpoint = slug ? `/agents/${slug}/stats` : "/agents/mine/stats";
  const spinner = createSpinner("Fetching analytics...");
  spinner.start();

  try {
    const data = await apiGet<AgentStats | AgentStats[]>(endpoint);
    spinner.stop();

    const stats: AgentStats[] = Array.isArray(data) ? data : [data];

    if (stats.length === 0) {
      console.log(chalk.yellow("No analytics data found."));
      return;
    }

    console.log(chalk.bold(`\nIntern Analytics${slug ? ` — ${slug}` : ""}\n`));
    formatTable(stats);
  } catch (err) {
    spinner.fail(`Failed to fetch analytics: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}
