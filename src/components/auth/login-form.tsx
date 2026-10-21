import { loginAsDemo } from "@/actions/auth";
import { primaryButtonClass } from "@/components/ui/form-styles";
import { demoAccounts } from "@/data/demo-accounts";

export function LoginForm({ next }: { next: string }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-bold uppercase tracking-wide">Choose an account to log in</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {demoAccounts.map((account) => (
            <form key={account.role} action={loginAsDemo}>
              <input type="hidden" name="role" value={account.role} />
              <input type="hidden" name="next" value={next} />
              <button
                type="submit"
                className={`${primaryButtonClass} w-full border-2 border-ink p-4 text-left`}
              >
                <span className="block font-display text-2xl uppercase leading-none">
                  Log in as {account.label}
                </span>
                <span className="mt-1 block text-xs font-normal normal-case">
                  {account.description}
                </span>
              </button>
            </form>
          ))}
        </div>
      </div>
      <p className="text-sm text-ink/70">
        Demo shop: the accounts are fixed, so there is nothing to sign up for.
      </p>
    </div>
  );
}
