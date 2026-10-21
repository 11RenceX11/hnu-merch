import type { User } from "@/types/shop";

/** Fixed demo accounts for the shop; there is no sign-up or user database. */
export const seedUsers: User[] = [
  {
    id: "user-admin",
    name: "HNU Merch Admin",
    email: "admin@hnu-merch.test",
    role: "admin",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "user-collector",
    name: "Demo Collector",
    email: "collector@hnu-merch.test",
    role: "collector",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];
