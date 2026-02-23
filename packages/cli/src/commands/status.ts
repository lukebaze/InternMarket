import { Command } from "commander";
import ora from "ora";
import chalk from "chalk";

interface AgentStatus {
  name: string;
  status: string;
  totalCalls: number;
  revenue: string;
  ratingAvg: string;
}

function formatRow(agent: AgentStatus): Record<string, string | number> {
  return {
    Name: agent.name,
    Status: agent.status,
    Calls: agent.totalCalls,
    Revenue: `$${parseFloat(agent.revenue || "0").toFixed(2)} USDC`,
    Rating: `${parseFloat(agent.ratingAvg || "0").toFixed(1)} / 5`,
  };
}

export const statusCommand = new Command("status")
  .description("View status of your published agents")
  .option("-k, --api-key <key>", "API key (or set INTERNS_API_KEY env var)")
  .option("--api-url <url>", "Override base API URL", "https://interns.market/api")
  .action(async (opts) => {
    const apiKey = opts.apiKey || process.env.INTERNS_API_KEY;
    if (!apiKey) {
      console.error(chalk.red("Error: API key required. Use --api-key or set INTERNS_API_KEY."));
      process.exit(1);
    }

    const spinner = ora("Fetching your agents...").start();

    try {
      const res = await fetch(`${opts.apiUrl}/agents/mine`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (!res.ok) {
        throw new Error(`API error ${res.status}`);
      }

      const agents = (await res.json()) as AgentStatus[];
      spinner.stop();

      if (!agents.length) {
        console.log(chalk.yellow("No agents found. Run `interns publish` to get started."));
        return;
      }

      console.log(chalk.bold(`\nYour Agents (${agents.length})\n`));
      console.table(agents.map(formatRow));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      spinner.fail(chalk.red(`Failed to fetch status: ${msg}`));
      process.exit(1);
    }
  });
