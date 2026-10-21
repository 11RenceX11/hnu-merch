import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getSafeRedirectPath } from "@/lib/definitions";
import { getSessionUser } from "@/lib/dal";

export const metadata: Metadata = { title: "Log in" };

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;
  const nextPath = getSafeRedirectPath(next, "/account");

  // Already logged in? Skip the form.
  if (await getSessionUser()) redirect(nextPath);

  return (
    <div className="mx-auto max-w-lg px-5 py-16">
      <h1 className="font-display text-6xl uppercase">Log in</h1>
      <div className="mt-8">
        <LoginForm next={nextPath} />
      </div>
    </div>
  );
}
