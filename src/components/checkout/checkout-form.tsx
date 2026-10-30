"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { startCheckout } from "@/actions/checkout";
import { useCart } from "@/components/cart/cart-provider";
import { formatPeso } from "@/lib/format";

type CheckoutFormProps = {
  customerName: string;
  customerEmail: string;
  /** True when PayMongo is in test mode (no real money). */
  isDemoPayment: boolean;
};

export function CheckoutForm({ customerName, customerEmail, isDemoPayment }: CheckoutFormProps) {
  const { lines, quote } = useCart();
  const [errorMessage, setErrorMessage] = useState("");
  const [isPaying, startPaying] = useTransition();

  function handlePay() {
    setErrorMessage("");

    startPaying(async () => {
      // On success the Server Action redirects to PayMongo, so we only get an answer when it fails.
      const result = await startCheckout(lines);
      setErrorMessage(result.error);
    });
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-5 py-12 md:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <h1 className="font-display text-5xl">Checkout</h1>

        <p className="text-ink/70">
          Ordering as <span className="font-semibold text-ink">{customerName}</span> ({customerEmail}).
          Pickup at the campus merch point.
        </p>

        {isDemoPayment && (
          <div className="border border-brand p-4 text-sm">
            <p className="font-semibold text-brand">Demo payment. No real money is charged.</p>
            <p className="mt-1 text-ink/80">
              On PayMongo&apos;s page use the test card <strong>4343 4343 4343 4345</strong>, any
              future expiry date and any 3-digit CVC. For GCash or Maya, choose &quot;Authorize&quot;
              on the test page.
            </p>
          </div>
        )}

        {errorMessage && (
          <p role="alert" className="text-sm font-semibold text-danger">
            {errorMessage}
          </p>
        )}

        <button
          type="button"
          onClick={handlePay}
          disabled={quote.lines.length === 0 || isPaying}
          className="w-full rounded-xl bg-brand py-4 font-display text-2xl text-white disabled:opacity-40"
        >
          {isPaying ? "Going to PayMongo..." : `Pay ${formatPeso(quote.total)}`}
        </button>

        {quote.lines.length === 0 && (
          <p className="text-sm">
            Your cart is empty.{" "}
            <Link href="/shop" className="underline">
              Browse the shop
            </Link>
            .
          </p>
        )}
      </div>

      <aside className="h-fit bg-mist p-6">
        <h2 className="font-display text-2xl">Summary</h2>

        <ul className="mt-4 space-y-3 text-sm">
          {quote.lines.map((line) => (
            <li key={`${line.productSlug}-${line.size}`} className="flex justify-between gap-3">
              <span>
                {line.quantity}× {line.productName}
                {line.size !== "One size" && ` (${line.size})`}
              </span>
              <span>{formatPeso(line.subtotal)}</span>
            </li>
          ))}
        </ul>

        <p className="mt-4 flex justify-between border-t border-ink/20 pt-4 text-lg">
          <span>Total</span>
          <span>{formatPeso(quote.total)}</span>
        </p>
        <p className="mt-2 text-xs text-ink/60">
          The final amount is confirmed on the server before payment.
        </p>
      </aside>
    </div>
  );
}
