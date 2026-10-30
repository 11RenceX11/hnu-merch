"use client";

import { useActionState } from "react";
import { subscribe } from "@/actions/subscribe";
import { FieldError } from "@/components/ui/field-error";

/** "Never miss a drop" email sign-up. */
export function NewsletterForm() {
  const [state, formAction, isPending] = useActionState(subscribe, undefined);

  if (state?.success) {
    return <p className="font-display text-2xl">{state.success}</p>;
  }

  return (
    <form action={formAction} className="w-full max-w-md">
      <div className="flex rounded-2xl border-2 border-ink bg-paper hard-shadow">
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Your email"
          aria-label="Email address"
          className="min-w-0 flex-1 bg-transparent px-4 py-3 outline-none"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-r-xl bg-ink px-5 font-display text-lg text-paper disabled:opacity-60"
        >
          {isPending ? "..." : "Subscribe"}
        </button>
      </div>
      <FieldError messages={state?.errors?.email} />
      {state?.message && <p className="mt-2 text-sm font-semibold">{state.message}</p>}
    </form>
  );
}
