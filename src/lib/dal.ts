import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session-token";
import { findUserById } from "@/lib/users";
import type { SessionUser } from "@/types/shop";

/**
 * Data Access Layer (DAL), as recommended by the Next.js authentication guide.
 * Every page, Server Action and Route Handler that needs to know who is logged
 * in asks here. The Proxy only does a quick redirect check; this is the real check.
 */

/**
 * The logged-in user, or null. `cache` makes this run once per request
 * even when many components call it.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const session = await verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!session) return null;

  // Read the user again so a changed role or removed account takes effect immediately.
  const user = await findUserById(session.userId);
  if (!user) return null;

  return { id: user.id, name: user.name, email: user.email, role: user.role };
});

/** Use in pages that need a login. Sends visitors to /login and back afterwards. */
export async function requireUser(returnToPath = "/account"): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(returnToPath)}`);
  }

  return user;
}

/** Use in admin pages AND in every admin Server Action. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser("/admin");

  if (user.role !== "admin") {
    redirect("/");
  }

  return user;
}
