/**
 * index.ts — InternMarket CLI entry point
 * Consumer commands: static imports (Commander objects).
 * Creator/auth commands: lazy dynamic imports for fast startup.
 */
import { Command } from "commander";
import { installCommand } from "./commands/install.js";
import { uninstallCommand } from "./commands/uninstall.js";
import { listCommand } from "./commands/list.js";
import { updateCommand } from "./commands/update.js";

const program = new Command();
program
  .name("internmarket")
  .description("InternMarket agent marketplace CLI")
  .version("0.1.0");

// Consumer commands (static — Commander objects)
program.addCommand(installCommand);
program.addCommand(uninstallCommand);
program.addCommand(listCommand);
program.addCommand(updateCommand);

// Creator commands — lazy imports for fast startup
program
  .command("init")
  .description("Scaffold a new intern project")
  .option("--name <name>", "Intern name")
  .option("--slug <slug>", "Intern slug")
  .option("--category <category>", "Intern category")
  .action(async (opts) => {
    const { initCmd } = await import("./commands/init.js");
    await initCmd(opts);
  });

program
  .command("package")
  .description("Build .internagent package from current directory")
  .action(async () => {
    const { packageCmd } = await import("./commands/package-cmd.js");
    await packageCmd();
  });

program
  .command("publish")
  .description("Publish your intern to InternMarket")
  .option("--changelog <text>", "Version changelog")
  .option("--no-tui", "Disable interactive TUI (for CI environments)")
  .action(async (opts) => {
    const { publishCmd } = await import("./commands/publish.js");
    await publishCmd(opts);
  });

program
  .command("analytics [slug]")
  .description("View download analytics for your interns")
  .action(async (slug) => {
    const { analyticsCmd } = await import("./commands/analytics.js");
    await analyticsCmd(slug);
  });

// Auth commands — lazy imports
program
  .command("login")
  .description("Authenticate with InternMarket")
  .option("--token <token>", "API token (for CI)")
  .action(async (opts) => {
    const { loginCmd } = await import("./commands/login.js");
    await loginCmd(opts);
  });

program
  .command("logout")
  .description("Clear stored credentials")
  .action(async () => {
    const { logoutCmd } = await import("./commands/logout.js");
    await logoutCmd();
  });

program.parse();
