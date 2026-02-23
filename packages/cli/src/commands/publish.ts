import { Command } from "commander";
import ora from "ora";
import chalk from "chalk";
import { readFileSync } from "fs";

interface AgentConfig {
  name: string;
  endpoint: string;
  price: string;
  category: string;
  description?: string;
}

const REQUIRED_FIELDS: (keyof AgentConfig)[] = ["name", "endpoint", "price", "category"];
const VALID_CATEGORIES = ["marketing", "assistant", "copywriting", "coding", "pm", "trading", "social"];

function loadConfig(configPath: string): AgentConfig {
  try {
    const raw = readFileSync(configPath, "utf-8");
    return JSON.parse(raw) as AgentConfig;
  } catch {
    throw new Error(`Cannot read config at ${configPath}. Ensure the file exists and is valid JSON.`);
  }
}

function validateConfig(config: AgentConfig): void {
  for (const field of REQUIRED_FIELDS) {
    if (!config[field]) {
      throw new Error(`Missing required field: "${field}" in config`);
    }
  }
  if (!VALID_CATEGORIES.includes(config.category)) {
    throw new Error(`Invalid category "${config.category}". Must be one of: ${VALID_CATEGORIES.join(", ")}`);
  }
  const price = parseFloat(config.price);
  if (isNaN(price) || price <= 0) {
    throw new Error(`Invalid price "${config.price}". Must be a positive number (USDC per call).`);
  }
}

async function healthCheckEndpoint(endpoint: string): Promise<void> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(endpoint, { method: "HEAD", signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) {
      throw new Error(`Endpoint returned HTTP ${res.status}`);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Endpoint health check failed: ${msg}`);
  }
}

export const publishCommand = new Command("publish")
  .description("Publish an AI agent to interns.market")
  .option("-c, --config <path>", "Path to config file", "interns.json")
  .option("-k, --api-key <key>", "API key (or set INTERNS_API_KEY env var)")
  .option("--api-url <url>", "Override API URL", "https://interns.market/api/agents")
  .action(async (opts) => {
    const apiKey = opts.apiKey || process.env.INTERNS_API_KEY;
    if (!apiKey) {
      console.error(chalk.red("Error: API key required. Use --api-key or set INTERNS_API_KEY."));
      process.exit(1);
    }

    // Load & validate config
    let config: AgentConfig;
    try {
      config = loadConfig(opts.config);
      validateConfig(config);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(chalk.red(`Config error: ${msg}`));
      process.exit(1);
    }

    // Health check
    const healthSpinner = ora("Checking agent endpoint...").start();
    try {
      await healthCheckEndpoint(config.endpoint);
      healthSpinner.succeed(chalk.green("Endpoint is reachable"));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      healthSpinner.fail(chalk.red(msg));
      process.exit(1);
    }

    // Publish
    const publishSpinner = ora("Publishing agent...").start();
    try {
      const res = await fetch(opts.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          name: config.name,
          endpoint: config.endpoint,
          pricePerCall: config.price,
          category: config.category,
          description: config.description ?? "",
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`API error ${res.status}: ${body}`);
      }

      const data = (await res.json()) as { slug?: string };
      publishSpinner.succeed(chalk.green("Agent published successfully!"));
      const agentUrl = `https://interns.market/agents/${data.slug ?? ""}`;
      console.log(`\n  ${chalk.bold("Agent URL:")} ${chalk.cyan(agentUrl)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      publishSpinner.fail(chalk.red(`Publish failed: ${msg}`));
      process.exit(1);
    }
  });
