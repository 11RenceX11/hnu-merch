"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { Confetti } from "@/components/ui/confetti";
import { formatPeso } from "@/lib/format";
import type { OrderStatus as OrderStatusValue } from "@/types/shop";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 40; // About two minutes.

type OrderSummary = { status: OrderStatusValue; total: number };

/**
 * Shows the result of the payment. Our server confirms the payment with PayMongo
 * (webhook or direct check), so this page asks the server until it knows.
 */
export function OrderStatus({ reference }: { reference: string }) {
  const { clearCart } = useCart();
  const [summary, setSummary] = useState<OrderSummary | null>(null);

  useEffect(() => {
    let isStopped = false;
    let pollCount = 0;

    async function checkOrder() {
      const response = await fetch(`/api/orders/${reference}`, { cache: "no-store" }).catch(
        () => null,
      );

      if (isStopped) return;

      if (response?.ok) {
        const latest: OrderSummary = await response.json();
        setSummary(latest);

        if (latest.status === "paid") {
          clearCart();
          return;
        }

        if (latest.status !== "pending") return; // failed or needs review: stop asking
      }

      pollCount += 1;
      if (pollCount < MAX_POLLS) setTimeout(checkOrder, POLL_INTERVAL_MS);
    }

    checkOrder();

    return () => {
      isStopped = true;
    };
    // clearCart only rewrites localStorage, so it is safe to leave out of the dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  const messages: Record<OrderStatusValue, { title: string; body: string }> = {
    paid: {
      title: "Payment received!",
      body: `Order ${reference} (${formatPeso(summary?.total ?? 0)}) is confirmed. Claim it at the campus merch pickup point and show this reference.`,
    },
    needs_review: {
      title: "Order under review",
      body: `Order ${reference} needs a quick manual check.`,
    },
    failed: {
      title: "Payment not completed",
      body: "You were not charged. You can try again from your cart.",
    },
    pending: {
      title: "Confirming your payment",
      body: "This usually takes a few seconds. Please keep this page open.",
    },
  };

  const message = messages[summary?.status ?? "pending"];

  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      {summary?.status === "paid" && <Confetti />}
      <h1 className="font-display text-6xl">{message.title}</h1>
      <p className="mt-4 text-ink/70">{message.body}</p>

      <div className="mt-8 flex justify-center gap-3">
        <Link href="/account" className="bg-ink px-6 py-3 font-semibold text-paper">
          My account
        </Link>
        <Link href="/shop" className="border border-ink/40 px-6 py-3 font-semibold">
          Keep shopping
        </Link>
      </div>
    </div>
  );
}
