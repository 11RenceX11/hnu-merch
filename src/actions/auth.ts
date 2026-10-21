"use server";

import { redirect } from "next/navigation";
import { getFieldErrors, getSafeRedirectPath, LoginSchema } from "@/lib/definitions";
import type { FormState } from "@/lib/definitions";
import { readText } from "@/lib/form-data";
import { hashPassword, verifyPassword } from "@/lib/password";
import { isRateLimited } from "@/lib/rate-limit";
import { createSession, deleteSession } from "@/lib/session";
import { findUserByEmail } from "@/lib/users";

/**
 * Authentication Server Actions, following the Next.js authentication guide:
 * validate the form, check the password, create the session, redirect.
 * Accounts are fixed in src/data/seed-users.ts, so there is no sign-up.
 * https://nextjs.org/docs/app/guides/authentication
 */

export async function login(state: FormState, formData: FormData): Promise<FormState> {
  if (await isRateLimited("login", 10)) {
    return { message: "Too many attempts. Please wait a minute and try again." };
  }

  const validatedFields = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: getFieldErrors(validatedFields.error) };
  }

  const { email, password } = validatedFields.data;
  const user = await findUserByEmail(email);

  // Same message and same amount of work whether the email exists or not,
  // so nobody can use this form to find out which emails have accounts.
  const isPasswordCorrect = user
    ? await verifyPassword(password, user.passwordHash)
    : (await hashPassword(password), false);

  if (!user || !isPasswordCorrect) {
    return { message: "Incorrect email or password." };
  }

  await createSession(user.id, user.role);

  const fallbackPath = user.role === "admin" ? "/admin" : "/account";
  redirect(getSafeRedirectPath(readText(formData, "next"), fallbackPath));
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
