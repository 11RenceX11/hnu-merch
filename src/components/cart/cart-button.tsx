"use client";

import { useCart } from "@/components/cart/cart-provider";

export function CartButton() {
  const { itemCount, setIsDrawerOpen } = useCart();

  return (
    <button
      type="button"
      onClick={() => setIsDrawerOpen(true)}
      className="rounded-2xl border-2 border-ink bg-ink px-4 py-1.5 text-sm font-bold uppercase text-paper transition hover:bg-brand"
    >
      Cart{" "}
      {/* Changing the key restarts the animation, so the number pops every time it changes. */}
      <span key={itemCount} className="pop inline-block">
        ({itemCount})
      </span>
    </button>
  );
}
