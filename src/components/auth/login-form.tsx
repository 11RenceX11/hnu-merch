"use client";

import { useActionState, useState } from "react";
import { login } from "@/actions/auth";
import { FieldError } from "@/components/ui/field-error";
import { inputClass, labelClass, primaryButtonClass } from "@/components/ui/form-styles";
import { demoAccounts, type DemoAccount } from "@/data/demo-accounts";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, isPending] = useActionState(login, undefined);

  // The form starts filled in with the first account (the collector).
  const [email, setEmail] = useState(demoAccounts[0].email);
  const [password, setPassword] = useState(demoAccounts[0].password);

  function fillWith(account: DemoAccount) {
    setEmail(account.email);
    setPassword(account.password);
  }

  return (
    <div className="space-y-6">
      {/* One click fills the form with a fixed account. */}
      <div>
        <p className="mb-2 text-sm font-bold uppercase tracking-wide">Choose an account</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {demoAccounts.map((account) => {
            const isSelected = account.email === email;

            return (
              <button
                key={account.email}
                type="button"
                onClick={() => fillWith(account)}
                aria-pressed={isSelected}
                className={`rounded-2xl border-2 border-ink p-4 text-left transition ${
                  isSelected ? "bg-gold hard-shadow" : "bg-paper hover:-translate-y-0.5"
                }`}
              >
                <span className="block font-display text-2xl leading-none">{account.label}</span>
                <span className="mt-1 block text-xs">{account.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />

        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
          />
          <FieldError messages={state?.errors?.email} />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="text"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass}
          />
          <FieldError messages={state?.errors?.password} />
        </div>

        {state?.message && (
          <p role="alert" className="text-sm font-semibold text-danger">
            {state.message}
          </p>
        )}

        <button type="submit" disabled={isPending} className={`${primaryButtonClass} w-full`}>
          {isPending ? "Logging in..." : "Log in"}
        </button>

        <p className="text-sm text-ink/70">Demo shop: the accounts are fixed, so there is nothing to sign up for.</p>
      </form>
    </div>
  );
}
