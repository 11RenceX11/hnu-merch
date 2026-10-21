import type { User } from "@/types/shop";

/**
 * The shop's accounts. They are fixed in the code (hard coded): there is no
 * sign-up and no user database. To change a password, create a new hash with
 * hashPassword() from src/lib/password.ts and paste it here. Passwords are
 * never stored in plain text: the values below are scrypt hashes.
 *
 * The login page shows these two accounts and fills the form for you.
 * Keep src/data/demo-accounts.ts in sync with this file.
 */
export const seedUsers: User[] = [
  {
    id: "user-admin",
    name: "HNU Merch Admin",
    email: "admin@hnu-merch.test",
    role: "admin",
    passwordHash: "88f6c61e9f2487ab31d07a4b298a4be5:1c55f29afb3b7a071847c91b99ad3f2581b774d715d4213696543ebd656b5c170c835efa12ea3df4ae511db43c23aac4dc3f8e082143df8dde4350d1a65be9c3",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "user-collector",
    name: "Demo Collector",
    email: "collector@hnu-merch.test",
    role: "collector",
    passwordHash: "fb83a886a89c4760f4b6d155569c3975:ce97791751e1914e40ae46b4d98044631ab1dd2f8395d88c980ed8e39b4d84d547388c99df829bd68fb106138f2fbf8731219fd4e9240d134ea50dc149eb41d6",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];
