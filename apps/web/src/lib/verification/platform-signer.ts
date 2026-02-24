/**
 * platform-signer.ts — Platform Ed25519 counter-signature for published packages.
 * The platform signs the creator's public key + package hash to create a double-signature.
 * PLATFORM_SIGNING_KEY env var must be set to a base64-encoded Ed25519 private key (PKCS8 PEM).
 */
import crypto from "node:crypto";

export interface SignatureBundle {
  creatorSignature: string;
  platformSignature: string;
  platformPublicKey: string;
  signedAt: string;
}

/**
 * Get the platform's public key (PEM) derived from the private key env var.
 * Returns null if PLATFORM_SIGNING_KEY is not configured.
 */
export function getPlatformPublicKey(): string | null {
  const privPem = process.env.PLATFORM_SIGNING_KEY;
  if (!privPem) return null;

  try {
    const privateKey = crypto.createPrivateKey(privPem);
    return crypto.createPublicKey(privateKey).export({ type: "spki", format: "pem" }) as string;
  } catch {
    return null;
  }
}

/**
 * Counter-sign a package: sign the packageUrl + creatorSignature with the platform key.
 * @param packageUrl - the storage key / URL of the package
 * @param creatorSignature - base64 creator Ed25519 sig (if available, else empty string)
 * @returns SignatureBundle or null if platform key not configured
 */
export function counterSign(packageUrl: string, creatorSignature: string): SignatureBundle | null {
  const privPem = process.env.PLATFORM_SIGNING_KEY;
  if (!privPem) return null;

  try {
    const payload = `${packageUrl}:${creatorSignature}`;
    const sign = crypto.createSign("SHA512");
    sign.update(payload);
    sign.end();
    const platformSignature = sign.sign(privPem, "base64");

    const platformPublicKey = getPlatformPublicKey() ?? "";
    return {
      creatorSignature,
      platformSignature,
      platformPublicKey,
      signedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/**
 * Verify a platform counter-signature.
 * @param packageUrl - storage key / URL of the package
 * @param bundle - signature bundle stored at publish time
 */
export function verifyPlatformSignature(packageUrl: string, bundle: SignatureBundle): boolean {
  try {
    const payload = `${packageUrl}:${bundle.creatorSignature}`;
    const verify = crypto.createVerify("SHA512");
    verify.update(payload);
    verify.end();
    return verify.verify(bundle.platformPublicKey, bundle.platformSignature, "base64");
  } catch {
    return false;
  }
}
