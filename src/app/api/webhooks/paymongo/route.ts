import { NextResponse } from "next/server";
import { recordPayment } from "@/lib/orders";
import { isLiveMode, parseWebhookEvent, verifyWebhookSignature } from "@/lib/paymongo";

/**
 * PayMongo webhook endpoint.
 * Register this URL in the PayMongo dashboard (Developers > Webhooks) using your
 * TEST key, and subscribe to the event "checkout_session.payment.paid".
 *
 * Next.js Route Handler docs: https://nextjs.org/docs/app/api-reference/file-conventions/route
 */
export async function POST(request: Request) {
  // 1. Read the RAW body. It must not be parsed before the signature is verified.
  const rawBody = await request.text();

  // 2. Verify the request really came from PayMongo.
  const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;
  const isSignatureValid =
    webhookSecret !== undefined &&
    verifyWebhookSignature({
      rawBody,
      signatureHeader: request.headers.get("paymongo-signature"),
      webhookSecret,
    });

  if (!isSignatureValid) {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  // 3. From here on we always answer 200, even for events we ignore.
  //    A non-2xx answer would make PayMongo retry the delivery.
  const event = parseWebhookEvent(rawBody);

  const isPaidEvent = event?.type === "checkout_session.payment.paid";
  const isFromExpectedMode = event?.livemode === undefined || event.livemode === isLiveMode();

  if (!event || !isPaidEvent || !isFromExpectedMode || !event.referenceNumber) {
    return NextResponse.json({ received: true });
  }

  // 4. Mark the order as paid. Safe to repeat, so retried events are harmless.
  await recordPayment({
    eventId: event.eventId,
    reference: event.referenceNumber,
    paidAmountInCentavos: event.paidAmountInCentavos,
  });

  return NextResponse.json({ received: true });
}
