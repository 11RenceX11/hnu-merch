import { jwtVerify, SignJWT } from "jose";
import type { UserRole } from "@/types/shop";

/**
 * Signing and checking the login token (a JWT stored in a cookie).
 * This follows the "Stateless sessions" approach from the Next.js
 * authentication guide, using the `jose` library.
 *
 * This file does not use `server-only` or `cookies()` on purpose, so the
 * Proxy (src/proxy.ts) can import it too.
 */

export const SESSION_COOKIE_NAME = "hnu_session";
export const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

export type SessionPayload = {
  userId: string;
  role: UserRole;
};

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("Missing environment variable: SESSION_SECRET (see .env.example).");
  }

  return new TextEncoder().encode(secret);
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

/** Returns the session data, or null when the token is missing, invalid or expired. */
export async function verifySessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: ["HS256"] });

    const { userId, role } = payload;
    const isValidRole = role === "collector" || role === "admin";

    if (typeof userId !== "string" || !isValidRole) return null;

    return { userId, role };
  } catch {
    return null;
  }
}
