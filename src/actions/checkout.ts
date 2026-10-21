"use server";

import crypto from "crypto";
import { redirect } from "next/navigation";
import { CartLinesSchema } from "@/lib/definitions";
import { getSessionUser } from "@/lib/dal";
import { getStorefrontProducts } from "@/lib/catalog";
import { getSiteUrl, isPaymentConfigured } from "@/lib/env";
import { attachCheckoutSession, createPendingOrder, markOrderFailed } from "@/lib/orders";
import { createCheckoutSession } from "@/lib/paymongo";
import { buildPriceList, priceCart } from "@/lib/pricing";
import { isRateLimited } from "@/lib/rate-limit";
import type { CartLine } from "@/types/shop";

/**
 * Server Action for checkout.
 * Next.js docs: https://nextjs.org/docs/app/getting-started/mutating-data
 *
 * The browser only sends product slugs, sizes and quantities. Prices are
 * decided here on the server, using today's sale prices.
 */

/** PayMongo does not accept very small checkouts. */
const MINIMUM_ORDER_IN_PESOS = 20;

export type StartCheckoutResult = { error: string };

/**
 * Creates the order and a PayMongo Checkout Session, then sends the customer to
 * PayMongo's hosted payment page. It only returns when something went wrong.
 */
export async function startCheckout(lines: CartLine[]): Promise<StartCheckoutResult> {
  const user = await getSessionUser();

  if (!user) {
    return { error: "Please log in to check out." };
  }

  if (await isRateLimited("checkout", 8)) {
    return { error: "Too many attempts. Please wait a minute and try again." };
  }

  if (!isPaymentConfigured()) {
    return { error: "Payments are not set up yet. Add PAYMONGO_SECRET_KEY and SITE_URL." };
  }

  // 1. Validate what the browser sent.
  const validatedLines = CartLinesSchema.safeParse(lines);

  if (!validatedLines.success) {
    return { error: "Your cart is empty or invalid." };
  }

  // 2. Price the cart on the server and check every line against the real catalog.
  const products = await getStorefrontProducts();
  const priceList = new Map(buildPriceList(products).map((entry) => [entry.slug, entry]));

  const hasInvalidLine = validatedLines.data.some((line) => {
    const entry = priceList.get(line.productSlug);
    return !entry || !entry.sizes.includes(line.size);
  });

  if (hasInvalidLine) {
    return { error: "Something in your cart is no longer available. Please review your cart." };
  }

  const quote = priceCart(validatedLines.data, priceList);

  if (quote.total < MINIMUM_ORDER_IN_PESOS) {
    return { error: `The minimum order is ₱${MINIMUM_ORDER_IN_PESOS}.` };
  }

  // 3. Save the order as "pending" before sending the customer to PayMongo.
  const reference = `HNU-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;

  await createPendingOrder({
    reference,
    userId: user.id,
    customerName: user.name,
    customerEmail: user.email,
    total: quote.total,
    items: quote.lines.map((line) => ({
      productSlug: line.productSlug,
      productName: line.productName,
      size: line.size,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
    })),
  });

  // 4. Create the PayMongo Checkout Session.
  let checkoutUrl: string;

  try {
    const siteUrl = getSiteUrl();

    const session = await createCheckoutSession({
      referenceNumber: reference,
      description: `HNU Merch order ${reference}`,
      successUrl: `${siteUrl}/checkout/success?reference=${reference}`,
      cancelUrl: `${siteUrl}/checkout`,
      lineItems: quote.lines.map((line) => ({
        name: `${line.productName} (${line.size})`.slice(0, 120),
        amountInCentavos: line.unitPrice * 100,
        quantity: line.quantity,
      })),
    });

    await attachCheckoutSession(reference, session.checkoutSessionId);
    checkoutUrl = session.checkoutUrl;
  } catch (error) {
    console.error("Checkout failed", error);
    await markOrderFailed(reference);
    return { error: "We could not start the payment. Please try again." };
  }

  // redirect() works by throwing, so it must be called outside of try/catch.
  redirect(checkoutUrl);
}
