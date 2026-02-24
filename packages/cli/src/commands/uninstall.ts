import { Command } from "commander";
import { uninstallAgent } from "../lib/installer.js";
import { error, success } from "../lib/logger.js";
import { getInstalled, isInstalled, removeInstalled } from "../lib/metadata-store.js";

/** Uninstall agent by slug. Used by both Commander command and lazy entry point. */
export async function uninstallCmd(slug: string): Promise<void> {
  if (!isInstalled(slug)) {
    error(`Intern "${slug}" is not installed.`);
    process.exit(1);
  }

  const entry = getInstalled()[slug];

  try {
    await uninstallAgent(entry.path, slug);
    removeInstalled(slug);
    success(`Uninstalled ${slug}`);
  } catch (err) {
    error((err as Error).message);
    process.exit(1);
  }
}

/** Commander Command object (used when registering via addCommand) */
export const uninstallCommand = new Command("uninstall")
  .description("Uninstall an installed intern")
  .argument("<slug>", "Intern slug to uninstall")
  .action(async (slug: string) => {
    await uninstallCmd(slug);
  });
