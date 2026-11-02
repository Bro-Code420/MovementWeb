import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function getEncryptionKey() {
  const secret =
    process.env.ENCRYPTION_KEY ||
    process.env.JWT_SECRET ||
    "movement_rehab_default_encryption_secret_key_2026";
  return crypto.createHash("sha256").update(String(secret)).digest();
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Output format: iv:tag:ciphertext (hex encoded)
 */
export function encryptPassword(plainText) {
  if (!plainText || typeof plainText !== "string") return null;
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plainText, "utf8"),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
  } catch (err) {
    console.error("Encryption error:", err);
    return null;
  }
}

/**
 * Decrypt an iv:tag:ciphertext string back into plaintext.
 */
export function decryptPassword(cipherText) {
  if (!cipherText || typeof cipherText !== "string") return null;
  try {
    const parts = cipherText.split(":");
    if (parts.length !== 3) return null;
    const [ivHex, tagHex, encryptedHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch (err) {
    console.error("Decryption error:", err);
    return null;
  }
}

