/**
 * signer.ts — Ed25519 key management and package signing/verification
 * Uses Node.js built-in crypto (Node 18+), no external deps.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const KEYS_DIR = path.join(os.homedir(), ".internmarket", "keys");
const PRIVATE_KEY_FILE = path.join(KEYS_DIR, "private.pem");
const PUBLIC_KEY_FILE = path.join(KEYS_DIR, "public.pem");

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

/** Generate a new Ed25519 key pair in PEM format. */
export function generateKeyPair(): KeyPair {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519", {
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  return { publicKey, privateKey };
}

/**
 * Sign a file with the given Ed25519 private key PEM.
 * Returns the signature as a base64 string.
 */
export function signPackage(filePath: string, privateKeyPem: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  const sign = crypto.createSign("SHA512");
  sign.update(fileBuffer);
  sign.end();
  return sign.sign(privateKeyPem, "base64");
}

/**
 * Verify a file's Ed25519 signature against a public key PEM.
 * Returns true if the signature is valid.
 */
export function verifyPackage(
  filePath: string,
  signature: string,
  publicKeyPem: string
): boolean {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const verify = crypto.createVerify("SHA512");
    verify.update(fileBuffer);
    verify.end();
    return verify.verify(publicKeyPem, signature, "base64");
  } catch {
    return false;
  }
}

/**
 * Ensure key pair exists at ~/.internmarket/keys/.
 * Generates and saves new keys if not present, chmod 600 on private key.
 */
export function ensureKeys(): KeyPair {
  if (fs.existsSync(PRIVATE_KEY_FILE) && fs.existsSync(PUBLIC_KEY_FILE)) {
    return {
      privateKey: fs.readFileSync(PRIVATE_KEY_FILE, "utf-8"),
      publicKey: fs.readFileSync(PUBLIC_KEY_FILE, "utf-8"),
    };
  }

  fs.mkdirSync(KEYS_DIR, { recursive: true });
  const { publicKey, privateKey } = generateKeyPair();

  fs.writeFileSync(PRIVATE_KEY_FILE, privateKey, { encoding: "utf-8", mode: 0o600 });
  fs.writeFileSync(PUBLIC_KEY_FILE, publicKey, { encoding: "utf-8", mode: 0o644 });
  fs.chmodSync(PRIVATE_KEY_FILE, 0o600);

  return { publicKey, privateKey };
}
