/**
 * The demo logins shown on the login page, so a visitor can fill the form with one click.
 * These must match the accounts in src/data/seed-users.ts.
 */
export type DemoAccount = {
  label: string;
  description: string;
  email: string;
  password: string;
};

export const demoAccounts: DemoAccount[] = [
  {
    label: "Collector",
    description: "Shop, see what you own, check out.",
    email: "collector@hnu-merch.test",
    password: "Collector#2026",
  },
  {
    label: "Admin",
    description: "Add products, pin photos, schedule sales.",
    email: "admin@hnu-merch.test",
    password: "HnuAdmin#2026",
  },
];
