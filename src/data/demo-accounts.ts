import type { UserRole } from "@/types/shop";

export type DemoAccount = {
  role: UserRole;
  label: string;
  description: string;
};

export const demoAccounts: DemoAccount[] = [
  {
    role: "collector",
    label: "Collector",
    description: "Shop, see what you own, check out.",
  },
  {
    role: "admin",
    label: "Admin",
    description: "Add products, pin photos, schedule sales.",
  },
];
