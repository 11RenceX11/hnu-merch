import "server-only";
import { findOrder, recordPayment } from "@/lib/orders";
import { retrieveCheckoutPayment } from "@/lib/paymongo";

/**
 * Asks PayMongo directly (server to server, with our secret key) whether a
 * pending order was paid. This lets the demo work on localhost without a webhook.
 * It is just as trustworthy as the webhook because it does not rely on anything
 * the customer's browser says.
 */
export async function refreshPendingOrder(reference: string): Promise<void> {
  const order = await findOrder(reference);

  if (!order || order.status !== "pending" || !order.checkoutSessionId) return;

  const payment = await retrieveCheckoutPayment(order.checkoutSessionId).catch(() => null);

  if (payment?.isPaid) {
    await recordPayment({ reference, paidAmountInCentavos: payment.paidAmountInCentavos });
  }
}
