import "server-only";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  signSessionToken,
} from "@/lib/session-token";
import type { UserRole } from "@/types/shop";

/** Logs a user in by saving a signed token in an HttpOnly cookie. */
export async function createSession(userId: string, role: UserRole): Promise<void> {
  const token = await signSessionToken({ userId, role });
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true, // JavaScript in the browser cannot read this cookie
    secure: process.env.NODE_ENV === "production", // https only in production
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
