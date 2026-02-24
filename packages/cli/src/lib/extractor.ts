import fs from "fs";
import path from "path";
import * as tar from "tar";

/**
 * Extract a .tar.gz tarball to destDir.
 * Verifies manifest.json exists after extraction.
 */
export async function extractPackage(tarballPath: string, destDir: string): Promise<void> {
  fs.mkdirSync(destDir, { recursive: true });

  await tar.extract({
    file: tarballPath,
    cwd: destDir,
  });

  const manifestPath = path.join(destDir, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Extraction succeeded but manifest.json not found in ${destDir}`);
  }
}
