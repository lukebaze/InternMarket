import fs from "fs";
import path from "path";

/** Copy skills/, commands/, prompts/ dirs and concatenate rules/ .md files */
export async function installAgent(
  extractedDir: string,
  targetDir: string,
  slug: string
): Promise<void> {
  fs.mkdirSync(targetDir, { recursive: true });

  // skills/ → {target}/skills/{slug}/
  const skillsSrc = path.join(extractedDir, "skills");
  if (fs.existsSync(skillsSrc)) {
    const dest = path.join(targetDir, "skills", slug);
    fs.mkdirSync(dest, { recursive: true });
    fs.cpSync(skillsSrc, dest, { recursive: true });
  }

  // commands/ → {target}/commands/{slug}/
  const commandsSrc = path.join(extractedDir, "commands");
  if (fs.existsSync(commandsSrc)) {
    const dest = path.join(targetDir, "commands", slug);
    fs.mkdirSync(dest, { recursive: true });
    fs.cpSync(commandsSrc, dest, { recursive: true });
  }

  // rules/ → {target}/rules/{slug}-rules.md (concatenate all .md files)
  const rulesSrc = path.join(extractedDir, "rules");
  if (fs.existsSync(rulesSrc)) {
    const mdFiles = fs
      .readdirSync(rulesSrc)
      .filter((f) => f.endsWith(".md"))
      .sort();
    if (mdFiles.length > 0) {
      const combined = mdFiles
        .map((f) => fs.readFileSync(path.join(rulesSrc, f), "utf8"))
        .join("\n\n");
      fs.mkdirSync(path.join(targetDir, "rules"), { recursive: true });
      fs.writeFileSync(path.join(targetDir, "rules", `${slug}-rules.md`), combined, "utf8");
    }
  }

  // prompts/ → {target}/prompts/{slug}/
  const promptsSrc = path.join(extractedDir, "prompts");
  if (fs.existsSync(promptsSrc)) {
    const dest = path.join(targetDir, "prompts", slug);
    fs.mkdirSync(dest, { recursive: true });
    fs.cpSync(promptsSrc, dest, { recursive: true });
  }

  // CLAUDE.md → append section between markers to {target}/CLAUDE.md
  const claudeMdSrc = path.join(extractedDir, "CLAUDE.md");
  if (fs.existsSync(claudeMdSrc)) {
    const addition = fs.readFileSync(claudeMdSrc, "utf8");
    const targetFile = path.join(targetDir, "CLAUDE.md");
    const startMarker = `<!-- internmarket:${slug}:start -->`;
    const endMarker = `<!-- internmarket:${slug}:end -->`;
    const section = `\n${startMarker}\n${addition}\n${endMarker}\n`;

    if (fs.existsSync(targetFile)) {
      const existing = fs.readFileSync(targetFile, "utf8");
      // Replace existing section if present, else append
      const markerRe = new RegExp(
        `\n?${escapeRe(startMarker)}[\\s\\S]*?${escapeRe(endMarker)}\n?`,
        "g"
      );
      const updated = markerRe.test(existing)
        ? existing.replace(markerRe, section)
        : existing + section;
      fs.writeFileSync(targetFile, updated, "utf8");
    } else {
      fs.writeFileSync(targetFile, section, "utf8");
    }
  }
}

/** Remove all namespaced directories and CLAUDE.md section for slug */
export async function uninstallAgent(targetDir: string, slug: string): Promise<void> {
  const dirs = [
    path.join(targetDir, "skills", slug),
    path.join(targetDir, "commands", slug),
    path.join(targetDir, "prompts", slug),
  ];
  for (const d of dirs) {
    if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
  }

  const rulesFile = path.join(targetDir, "rules", `${slug}-rules.md`);
  if (fs.existsSync(rulesFile)) fs.rmSync(rulesFile);

  // Remove CLAUDE.md section between markers
  const targetFile = path.join(targetDir, "CLAUDE.md");
  if (fs.existsSync(targetFile)) {
    const startMarker = `<!-- internmarket:${slug}:start -->`;
    const endMarker = `<!-- internmarket:${slug}:end -->`;
    const markerRe = new RegExp(
      `\n?${escapeRe(startMarker)}[\\s\\S]*?${escapeRe(endMarker)}\n?`,
      "g"
    );
    const updated = fs.readFileSync(targetFile, "utf8").replace(markerRe, "");
    fs.writeFileSync(targetFile, updated, "utf8");
  }
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
