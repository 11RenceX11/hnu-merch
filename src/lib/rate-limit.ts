import { headers } from "next/headers";

/**
 * A very small in-memory rate limiter.
 *
 * It protects against accidental floods and basic abuse. It keeps its counters
 * in memory, so on serverless hosting (many instances) replace it with a shared
 * store such as Upstash Redis.
 */
const requestTimesByKey = new Map<string, number[]>();

export async function isRateLimited(
  bucket: string,
  maxRequests: number,
  windowMs = 60_000,
): Promise<boolean> {
  const headerList = await headers();
  const clientIp = headerList.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";

  const key = `${bucket}:${clientIp}`;
  const now = Date.now();

  const recentRequests = (requestTimesByKey.get(key) ?? []).filter(
    (time) => now - time < windowMs,
  );
  recentRequests.push(now);
  requestTimesByKey.set(key, recentRequests);

  return recentRequests.length > maxRequests;
}
