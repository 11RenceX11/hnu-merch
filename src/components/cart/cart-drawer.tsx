"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";
import { formatPeso } from "@/lib/format";

export function CartDrawer() {
  const { quote, itemCount, isLoggedIn, isDrawerOpen, setIsDrawerOpen, changeQuantity } = useCart();

  return (
    <div className={`fixed inset-0 z-50 ${isDrawerOpen ? "" : "pointer-events-none"}`}>
      {/* Dark backdrop. Clicking it closes the drawer. */}
      <div
        onClick={() => setIsDrawerOpen(false)}
        className={`absolute inset-0 bg-ink/50 transition-opacity ${isDrawerOpen ? "opacity-100" : "opacity-0"}`}
      />

      <aside
        aria-label="Shopping cart"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l-2 border-ink bg-paper p-6 transition-transform duration-300 ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl">Your cart ({itemCount})</h2>
          <button type="button" onClick={() => setIsDrawerOpen(false)} className="text-sm font-bold underline">
            Close
          </button>
        </div>

        <ul className="mt-6 flex-1 space-y-4 overflow-y-auto">
          {quote.lines.length === 0 && (
            <li className="text-ink/60">Your cart is emptier than a Monday morning lecture hall. Go fix that.</li>
          )}

          {quote.lines.map((line) => (
            <li key={`${line.productSlug}-${line.size}`} className="flex gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-ink bg-mist">
                <Image
                  src={line.productImage}
                  alt={line.productName}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>

              <div className="flex-1 text-sm">
                <p className="font-bold">{line.productName}</p>
                <p className="text-ink/60">
                  {line.size !== "One size" && `Size ${line.size} · `}
                  {formatPeso(line.unitPrice)}
                </p>

                <div className="mt-2 flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => changeQuantity(line.productSlug, line.size, line.quantity - 1)}
                    className="h-7 w-7 rounded-full border-2 border-ink font-bold hover:bg-ink hover:text-paper"
                  >
                    −
                  </button>
                  <span className="font-bold">{line.quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => changeQuantity(line.productSlug, line.size, line.quantity + 1)}
                    className="h-7 w-7 rounded-full border-2 border-ink font-bold hover:bg-ink hover:text-paper"
                  >
                    +
                  </button>
                </div>
              </div>

              <p className="text-sm font-bold">{formatPeso(line.subtotal)}</p>
            </li>
          ))}
        </ul>

        <div className="border-t-2 border-ink pt-4">
          <div className="mb-4 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatPeso(quote.total)}</span>
          </div>

          <Link
            href="/checkout"
            onClick={() => setIsDrawerOpen(false)}
            className={`block rounded-2xl border-2 border-ink bg-brand py-4 text-center font-display text-xl text-white hard-shadow ${
              itemCount === 0 ? "pointer-events-none opacity-40" : ""
            }`}
          >
            {isLoggedIn ? "Checkout" : "Log in to check out"}
          </Link>
        </div>
      </aside>
    </div>
  );
}
