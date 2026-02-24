/**
 * upload-package.ts — upload .clawagent packages to Supabase Storage.
 * Server-side only. Uses service role key via supabase-storage-client.
 */
import { getStorageClient, PACKAGES_BUCKET } from "./supabase-storage-client";

const SIGNED_UPLOAD_EXPIRY = 900; // 15 minutes

/**
 * Generate a signed upload URL for direct client-to-Supabase upload.
 * Returns the upload URL and the storage path (key).
 */
export async function generateSignedUploadUrl(
  slug: string,
  version: string
): Promise<{ uploadUrl: string; key: string }> {
  const key = `${slug}/${slug}-${version}.clawagent`;
  const supabase = getStorageClient();

  const { data, error } = await supabase.storage
    .from(PACKAGES_BUCKET)
    .createSignedUploadUrl(key, { upsert: true });

  if (error || !data) {
    throw new Error(`Failed to generate signed upload URL: ${error?.message}`);
  }

  return { uploadUrl: data.signedUrl, key };
}

/**
 * Verify that an upload completed by checking the file exists in storage.
 */
export async function confirmUpload(
  key: string
): Promise<{ exists: boolean; size?: number }> {
  const supabase = getStorageClient();
  const dir = key.split("/").slice(0, -1).join("/") || "";
  const filename = key.split("/").pop() ?? key;

  const { data, error } = await supabase.storage
    .from(PACKAGES_BUCKET)
    .list(dir, { search: filename });

  if (error || !data?.length) return { exists: false };

  const file = data.find((f) => f.name === filename);
  if (!file) return { exists: false };

  return { exists: true, size: file.metadata?.size ?? undefined };
}

/**
 * Upload package buffer directly (server-side upload — used by API when
 * the client sends the file body to the API route instead of using presigned URL).
 */
export async function uploadPackageBuffer(
  slug: string,
  version: string,
  buffer: Buffer,
  contentType = "application/octet-stream"
): Promise<string> {
  const key = `${slug}/${slug}-${version}.clawagent`;
  const supabase = getStorageClient();

  const { error } = await supabase.storage
    .from(PACKAGES_BUCKET)
    .upload(key, buffer, { contentType, upsert: true });

  if (error) {
    throw new Error(`Failed to upload package: ${error.message}`);
  }

  return key;
}
