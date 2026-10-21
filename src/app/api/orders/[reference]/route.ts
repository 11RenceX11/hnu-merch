import { NextResponse } from "next/server";
import { getOrderSummary } from "@/lib/orders";
import { refreshPendingOrder } from "@/lib/payment-sync";

const REFERENCE_PATTERN = /^HNU-[A-F0-9]{10}$/;

/**
 * Returns the status of an order for the success page.
 * If the order is still pending, we first ask PayMongo whether it was paid.
 * The reference is random and unguessable, and the answer has no personal data.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;

  if (!REFERENCE_PATTERN.test(reference)) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  await refreshPendingOrder(reference);

  const summary = await getOrderSummary(reference);

  if (!summary) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(summary, { headers: { "Cache-Control": "no-store" } });
}
