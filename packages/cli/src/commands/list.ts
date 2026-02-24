/**
 * list.ts — list all installed interns as a formatted table
 * Uses chalk for color output; no Ink required for a simple read-only table.
 */
import { Command } from "commander";
import chalk from "chalk";
import { getInstalled } from "../lib/metadata-store.js";
import { info } from "../lib/logger.js";

const COL_WIDTHS = { name: 28, version: 10, scope: 8, installed: 20 };

function pad(str: string, width: number): string {
  return str.length >= width ? str.slice(0, width - 1) + "…" : str.padEnd(width);
}

function printRow(name: string, version: string, scope: string, installed: string): void {
  console.log(
    `  ${pad(name, COL_WIDTHS.name)}  ${pad(version, COL_WIDTHS.version)}  ${pad(scope, COL_WIDTHS.scope)}  ${installed}`
  );
}

/** List all installed interns as a formatted table. */
export function listCmd(): void {
  const installed = getInstalled();
  const slugs = Object.keys(installed);

  if (slugs.length === 0) {
    info("No interns installed. Run `internmarket install <slug>` to get started.");
    return;
  }

  const divider = chalk.gray(
    `  ${"─".repeat(COL_WIDTHS.name)}  ${"─".repeat(COL_WIDTHS.version)}  ${"─".repeat(COL_WIDTHS.scope)}  ${"─".repeat(COL_WIDTHS.installed)}`
  );

  console.log();
  console.log(chalk.bold("  Installed Interns\n"));
  console.log(
    chalk.bold(
      `  ${pad("Name", COL_WIDTHS.name)}  ${pad("Version", COL_WIDTHS.version)}  ${pad("Scope", COL_WIDTHS.scope)}  Installed At`
    )
  );
  console.log(divider);

  for (const slug of slugs) {
    const agent = installed[slug];
    const name = chalk.cyan(pad(slug, COL_WIDTHS.name));
    const version = chalk.green(pad(agent.version, COL_WIDTHS.version));
    const scope =
      agent.scope === "global"
        ? chalk.blue(pad("global", COL_WIDTHS.scope))
        : chalk.yellow(pad("local", COL_WIDTHS.scope));
    const installedAt = new Date(agent.installedAt).toLocaleString();
    console.log(`  ${name}  ${version}  ${scope}  ${installedAt}`);
  }

  console.log(divider);
  console.log(chalk.gray(`\n  ${slugs.length} intern${slugs.length !== 1 ? "s" : ""} installed`));
  console.log();
}

/** Commander Command object (used when registering via addCommand) */
export const listCommand = new Command("list")
  .description("List all installed interns")
  .action(() => listCmd());
