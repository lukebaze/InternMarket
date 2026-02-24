/**
 * init.ts — scaffold a new agent project in the current directory
 * Creates manifest.json, README.md, CLAUDE.md, skills/, prompts/, permissions.md
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { info, success } from "../lib/logger.js";

interface InitOptions {
  name?: string;
  slug?: string;
  category?: string;
}

const VALID_CATEGORIES = [
  "marketing", "assistant", "copywriting", "coding", "pm", "trading", "social", "analytics",
];

async function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function writeIfAbsent(filePath: string, content: string): void {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, "utf-8");
  }
}

export async function initCmd(opts: InitOptions): Promise<void> {
  const cwd = process.cwd();
  let { name, slug, category } = opts;

  if (!name || !slug || !category) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
      if (!name) {
        name = (await prompt(rl, "Intern name: ")).trim() || "My Intern";
      }
      if (!slug) {
        const defaultSlug = slugify(name);
        const input = (await prompt(rl, `Slug [${defaultSlug}]: `)).trim();
        slug = input || defaultSlug;
      }
      if (!category) {
        info(`Categories: ${VALID_CATEGORIES.join(", ")}`);
        const input = (await prompt(rl, "Category [assistant]: ")).trim();
        category = VALID_CATEGORIES.includes(input) ? input : "assistant";
      }
    } finally {
      rl.close();
    }
  }

  const description = `${name} — an AI intern on InternMarket`;

  fs.mkdirSync(path.join(cwd, "skills"), { recursive: true });
  fs.mkdirSync(path.join(cwd, "prompts"), { recursive: true });

  writeIfAbsent(
    path.join(cwd, "manifest.json"),
    JSON.stringify(
      { name, slug, version: "1.0.0", description, category, author: { name: "" }, tags: [], permissions: [], compatibleOpenClaw: ">=1.0.0" },
      null,
      2
    ) + "\n"
  );

  writeIfAbsent(
    path.join(cwd, "README.md"),
    `# ${name}\n\n${description}\n\n## Usage\n\nDescribe how to use this agent.\n\n## Category\n\n${category}\n`
  );

  writeIfAbsent(
    path.join(cwd, "CLAUDE.md"),
    `# ${name}\n\nThis file provides guidance to Claude when using this agent.\n\n## Role\n\nDescribe the agent role and responsibilities.\n\n## Instructions\n\n- Add specific instructions here\n`
  );

  writeIfAbsent(
    path.join(cwd, "permissions.md"),
    `# Permissions\n\nThis agent requires the following permissions:\n\n- Read files in working directory\n- Write files in working directory\n`
  );

  success(`Initialized intern project: ${slug}`);
  info(`Edit manifest.json, then run: internmarket package`);
}
