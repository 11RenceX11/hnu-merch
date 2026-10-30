import "server-only";
import { seedUsers } from "@/data/seed-users";
import type { User } from "@/types/shop";

/**
 * Accounts are fixed in src/data/seed-users.ts (hard coded). Nothing is saved
 * to a file or a database, and the website cannot create accounts.
 */

export async function findUserByEmail(email: string): Promise<User | undefined> {
  return seedUsers.find((user) => user.email === email.toLowerCase());
}

export async function findUserById(id: string): Promise<User | undefined> {
  return seedUsers.find((user) => user.id === id);
}
