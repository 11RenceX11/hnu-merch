/** True when everything needed to start a PayMongo checkout is configured. */
export function isPaymentConfigured(): boolean {
  return Boolean(process.env.PAYMONGO_SECRET_KEY && process.env.SITE_URL);
}

/** Where the shop lives, without a trailing slash. */
export function getSiteUrl(): string {
  return (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
