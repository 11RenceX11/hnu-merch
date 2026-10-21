import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";

/**
 * Password hashing with scrypt, which is built into Node.js.
 * Passwords are never stored. We store "<salt>:<hash>" (both hex).
 */

const KEY_LENGTH = 64;

function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt);

  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, keyHex] = storedHash.split(":");
  if (!saltHex || !keyHex) return false;

  const storedKey = Buffer.from(keyHex, "hex");
  const candidateKey = await deriveKey(password, Buffer.from(saltHex, "hex"));

  // timingSafeEqual throws when lengths differ, so check the length first.
  return storedKey.length === candidateKey.length && timingSafeEqual(storedKey, candidateKey);
}
