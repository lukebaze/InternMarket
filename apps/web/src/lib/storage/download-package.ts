/**
 * download-package.ts — generate signed download URLs for packages in Supabase Storage.
 * Server-side only. Uses service role key via supabase-storage-client.
 */
import { getStorageClient, PACKAGES_BUCKET } from "./supabase-storage-client";

const DOWNLOAD_URL_EXPIRY = 3600; // 1 hour

/**
 * Generate a time-limited signed download URL for a package stored in Supabase Storage.
 * @param key - storage path (e.g. "my-agent/my-agent-1.0.0.clawagent")
 */
export async function generateDownloadUrl(key: string): Promise<string> {
  const supabase = getStorageClient();

  const { data, error } = await supabase.storage
    .from(PACKAGES_BUCKET)
    .createSignedUrl(key, DOWNLOAD_URL_EXPIRY);

  if (error || !data) {
    throw new Error(`Failed to generate download URL: ${error?.message}`);
  }

  return data.signedUrl;
}

/**
 * Check whether a package exists in storage.
 * Returns size in bytes, or null if not found.
 */
export async function getPackageMetadata(
  key: string
): Promise<{ size: number } | null> {
  const supabase = getStorageClient();
  const dir = key.split("/").slice(0, -1).join("/") || "";
  const filename = key.split("/").pop() ?? key;

  const { data, error } = await supabase.storage
    .from(PACKAGES_BUCKET)
    .list(dir, { search: filename });

  if (error || !data?.length) return null;

  const file = data.find((f) => f.name === filename);
  if (!file) return null;

  return { size: file.metadata?.size ?? 0 };
}
