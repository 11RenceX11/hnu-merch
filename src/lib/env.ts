/** True when everything needed to start a PayMongo checkout is configured. */
export function isPaymentConfigured(): boolean {
  return Boolean(process.env.PAYMONGO_SECRET_KEY);
}

/**
 * Where the shop lives, without a trailing slash. PayMongo sends customers back here after paying.
 * Order of preference: SITE_URL, then the production address Vercel provides, then localhost.
 */
export function getSiteUrl(): string {
  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined;

  return (process.env.SITE_URL ?? vercelProductionUrl ?? "http://localhost:3000").replace(/\/$/, "");
}
