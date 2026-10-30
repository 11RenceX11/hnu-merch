import "server-only";
import crypto from "crypto";

/**
 * PayMongo Hosted Checkout (Checkout Sessions API).
 *
 * DEMO MODE: use a TEST secret key (sk_test_...). In test mode no real money
 * moves, and PayMongo's hosted page accepts test payments, for example the
 * test card 4343434343434345 with any future expiry date and any 3-digit CVC.
 *
 * Docs followed:
 *   Checkout API    https://developers.paymongo.com/docs/checkout-api
 *   Testing         https://developers.paymongo.com/docs/payment-acceptance-testing
 *   Webhooks        https://developers.paymongo.com/docs/developer-tools-webhook-setup-management
 *
 * Flow:
 *   1. Our server creates a Checkout Session and redirects the customer to its checkout_url.
 *   2. The customer pays on PayMongo's hosted page.
 *   3. We learn that the payment succeeded in one of two trusted, server-to-server ways:
 *        a. PayMongo's webhook "checkout_session.payment.paid" (needs a public URL), or
 *        b. asking PayMongo directly (Retrieve a Checkout Session) when the customer comes back.
 *      The success redirect on its own never marks an order as paid.
 */

const PAYMONGO_API_URL = "https://api.paymongo.com/v1";
const DEFAULT_PAYMENT_METHODS = "qrph,gcash,paymaya,card";

export function isLiveMode(): boolean {
  return (process.env.PAYMONGO_SECRET_KEY ?? "").startsWith("sk_live_");
}

/** True when the shop is running with a test key (no real money). */
export function isTestMode(): boolean {
  return (process.env.PAYMONGO_SECRET_KEY ?? "").startsWith("sk_test_");
}

/** PayMongo uses HTTP Basic auth: the secret key is the username and the password is empty. */
function getAuthorizationHeader(): string {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Missing environment variable: PAYMONGO_SECRET_KEY");
  }

  // This is a demo shop, so live keys are blocked unless you explicitly allow them.
  if (isLiveMode() && process.env.ALLOW_LIVE_PAYMENTS !== "true") {
    throw new Error("A live PayMongo key was found. Use a sk_test_ key for the demo.");
  }

  return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}

// ---------------------------------------------------------------
// Create a Checkout Session
// ---------------------------------------------------------------

export type CheckoutLineItem = {
  name: string;
  /** Price of ONE unit in centavos. PHP 100.50 is 10050. */
  amountInCentavos: number;
  quantity: number;
};

export async function createCheckoutSession(input: {
  /** Our own order reference. PayMongo gives it back so we can find the order. */
  referenceNumber: string;
  description: string;
  lineItems: CheckoutLineItem[];
  successUrl: string;
  cancelUrl: string;
}) {
  const paymentMethodTypes = (process.env.PAYMONGO_PAYMENT_METHODS ?? DEFAULT_PAYMENT_METHODS)
    .split(",")
    .map((method) => method.trim());

  const response = await fetch(`${PAYMONGO_API_URL}/checkout_sessions`, {
    method: "POST",
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
    headers: {
      Authorization: getAuthorizationHeader(),
      "Content-Type": "application/json",
      // PayMongo recommends this on every POST. The same key can never create two checkout sessions.
      "Idempotency-Key": input.referenceNumber,
    },
    body: JSON.stringify({
      data: {
        attributes: {
          line_items: input.lineItems.map((item) => ({
            name: item.name,
            amount: item.amountInCentavos,
            currency: "PHP",
            quantity: item.quantity,
          })),
          payment_method_types: paymentMethodTypes,
          description: input.description,
          success_url: input.successUrl,
          cancel_url: input.cancelUrl,
          reference_number: input.referenceNumber,
        },
      },
    }),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok || !body?.data?.attributes?.checkout_url) {
    // Log the details on the server, but never show them to the customer.
    console.error("PayMongo: could not create checkout session", response.status, body?.errors);
    throw new Error("Could not create the PayMongo checkout session.");
  }

  return {
    checkoutSessionId: body.data.id as string,
    checkoutUrl: body.data.attributes.checkout_url as string,
  };
}

// ---------------------------------------------------------------
// Retrieve a Checkout Session (to confirm a payment without a webhook)
// ---------------------------------------------------------------

type PaymentResource = { attributes?: { status?: string; amount?: number } };

export async function retrieveCheckoutPayment(
  checkoutSessionId: string,
): Promise<{ isPaid: boolean; paidAmountInCentavos?: number } | null> {
  const response = await fetch(`${PAYMONGO_API_URL}/checkout_sessions/${checkoutSessionId}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
    headers: { Authorization: getAuthorizationHeader() },
  });

  if (!response.ok) return null;

  const body = await response.json().catch(() => null);
  const payments: PaymentResource[] = body?.data?.attributes?.payments ?? [];
  const paidPayment = payments.find((payment) => payment.attributes?.status === "paid");

  return {
    isPaid: paidPayment !== undefined,
    paidAmountInCentavos: paidPayment?.attributes?.amount,
  };
}

// ---------------------------------------------------------------
// Webhooks
// ---------------------------------------------------------------

/**
 * Verifies the Paymongo-Signature header.
 *
 * The header looks like:  t=1496734173,te=<test signature>,li=<live signature>
 * PayMongo signs the text  "<t>.<raw request body>"  with HMAC-SHA256 using the
 * webhook secret. Test events are signed in `te`, live events in `li`.
 *
 * IMPORTANT: pass the RAW request body (request.text()). Parsing it first changes
 * the bytes and the signature would no longer match.
 */
export function verifyWebhookSignature(input: {
  rawBody: string;
  signatureHeader: string | null;
  webhookSecret: string;
}): boolean {
  if (!input.signatureHeader) return false;

  const headerParts: Record<string, string> = {};
  for (const part of input.signatureHeader.split(",")) {
    const separatorIndex = part.indexOf("=");
    if (separatorIndex === -1) continue;
    headerParts[part.slice(0, separatorIndex).trim()] = part.slice(separatorIndex + 1).trim();
  }

  const timestamp = headerParts.t;
  const providedSignature = isLiveMode() ? headerParts.li : headerParts.te;

  if (!timestamp || !providedSignature) return false;

  const expectedSignature = crypto
    .createHmac("sha256", input.webhookSecret)
    .update(`${timestamp}.${input.rawBody}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature);
  const providedBuffer = Buffer.from(providedSignature);

  // timingSafeEqual throws when lengths differ, so check the length first.
  return (
    expectedBuffer.length === providedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, providedBuffer)
  );
}

/** The parts of a PayMongo webhook body that we read. */
type CheckoutSessionResource = {
  attributes?: {
    reference_number?: string;
    payments?: PaymentResource[];
  };
};

type WebhookEventResource = {
  id?: string;
  type?: string;
  livemode?: boolean;
  data?: CheckoutSessionResource;
  attributes?: {
    type?: string;
    livemode?: boolean;
    data?: CheckoutSessionResource;
  };
};

export type PaymongoWebhookEvent = {
  eventId?: string;
  type?: string;
  livemode?: boolean;
  referenceNumber?: string;
  paidAmountInCentavos?: number;
};

/**
 * Reads the fields we need from a webhook body.
 * The event is { data: { id, attributes: { type, livemode, data: <checkout session> } } }.
 * Some payloads put `type`, `livemode` and `data` directly on `data`, so both are handled here.
 */
export function parseWebhookEvent(rawBody: string): PaymongoWebhookEvent | null {
  let payload: { data?: WebhookEventResource };

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return null;
  }

  const event = payload?.data;
  const checkoutSession = event?.attributes?.data ?? event?.data;
  const paidPayment = checkoutSession?.attributes?.payments?.find(
    (payment) => payment.attributes?.status === "paid",
  );

  return {
    eventId: event?.id,
    type: event?.attributes?.type ?? event?.type,
    livemode: event?.attributes?.livemode ?? event?.livemode,
    referenceNumber: checkoutSession?.attributes?.reference_number,
    paidAmountInCentavos: paidPayment?.attributes?.amount,
  };
}
