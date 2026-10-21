"use server";

import { redirect } from "next/navigation";
import { getSafeRedirectPath } from "@/lib/definitions";
import { readText } from "@/lib/form-data";
import { createSession, deleteSession } from "@/lib/session";
import { seedUsers } from "@/data/seed-users";

/**
 * The shop has fixed demo accounts, so the login page lets visitors choose a
 * role directly. The role is still checked against the configured accounts.
 */
export async function loginAsDemo(formData: FormData): Promise<void> {
  const role = formData.get("role");
  if (role !== "collector" && role !== "admin") {
    throw new Error("Invalid demo account selected.");
  }

  const user = seedUsers.find((account) => account.role === role);
  if (!user) {
    throw new Error(`No demo account is configured for the ${role} role.`);
  }

  await createSession(user.id, user.role);

  const fallbackPath = role === "admin" ? "/admin" : "/account";
  redirect(getSafeRedirectPath(readText(formData, "next"), fallbackPath));
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
