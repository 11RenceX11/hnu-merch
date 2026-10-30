import "server-only";
import { JsonStore } from "@/lib/json-store";
import type { Order, OrderItem, OrderStatus } from "@/types/shop";

type OrderData = {
  orders: Order[];
  /** IDs of PayMongo webhook events we already handled (webhooks can be delivered twice). */
  processedEventIds: string[];
};

const orderStore = new JsonStore<OrderData>("orders.json", () => ({
  orders: [],
  processedEventIds: [],
}));

const MAX_REMEMBERED_EVENTS = 2000;

export function createPendingOrder(order: {
  reference: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
}): Promise<void> {
  return orderStore.update(({ orders }) => {
    orders.push({ ...order, status: "pending", createdAt: new Date().toISOString() });
  });
}

export function attachCheckoutSession(reference: string, checkoutSessionId: string): Promise<void> {
  return orderStore.update(({ orders }) => {
    const order = orders.find((item) => item.reference === reference);
    if (order) order.checkoutSessionId = checkoutSessionId;
  });
}

export function markOrderFailed(reference: string): Promise<void> {
  return orderStore.update(({ orders }) => {
    const order = orders.find((item) => item.reference === reference);
    if (order) order.status = "failed";
  });
}

export async function findOrder(reference: string): Promise<Order | undefined> {
  const { orders } = await orderStore.read();
  return orders.find((order) => order.reference === reference);
}

/** Status only, with no personal data. Used by the success page. */
export async function getOrderSummary(
  reference: string,
): Promise<{ status: OrderStatus; total: number } | null> {
  const order = await findOrder(reference);
  return order ? { status: order.status, total: order.total } : null;
}

/** A collector's orders, newest first. */
export async function listOrdersForUser(userId: string): Promise<Order[]> {
  const { orders } = await orderStore.read();
  return orders
    .filter((order) => order.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Every order, newest first. For the admin. */
export async function listAllOrders(): Promise<Order[]> {
  const { orders } = await orderStore.read();
  return [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Slugs of every product this collector has bought (PAID orders only).
 * Used to show "You own this". Buying the same item again is always allowed.
 */
export async function getPurchasedProductSlugs(userId: string): Promise<Set<string>> {
  const orders = await listOrdersForUser(userId);
  const purchasedSlugs = new Set<string>();

  for (const order of orders) {
    if (order.status !== "paid") continue;
    for (const item of order.items) purchasedSlugs.add(item.productSlug);
  }

  return purchasedSlugs;
}

/**
 * Marks an order as paid. Called by the PayMongo webhook and by the
 * "check the payment" step on the success page. Safe to call many times.
 */
export function recordPayment(payment: {
  eventId?: string;
  reference: string;
  paidAmountInCentavos?: number;
}): Promise<void> {
  return orderStore.update((data) => {
    if (payment.eventId) {
      if (data.processedEventIds.includes(payment.eventId)) return;
      data.processedEventIds = [
        ...data.processedEventIds.slice(-MAX_REMEMBERED_EVENTS),
        payment.eventId,
      ];
    }

    const order = data.orders.find((item) => item.reference === payment.reference);
    if (!order || order.status === "paid") return;

    // If PayMongo reports less money than we asked for, hold the order for a person to check.
    const expectedAmountInCentavos = order.total * 100;
    const paidTooLittle =
      payment.paidAmountInCentavos !== undefined &&
      payment.paidAmountInCentavos < expectedAmountInCentavos;

    if (paidTooLittle) {
      order.status = "needs_review";
      return;
    }

    order.status = "paid";
    order.paidAt = new Date().toISOString();
  });
}
