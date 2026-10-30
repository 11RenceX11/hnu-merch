"use client";

import { useRef, useState } from "react";
import { useCart } from "@/components/cart/cart-provider";

type AddToCartFormProps = {
  slug: string;
  sizes: string[];
};

export function AddToCartForm({ slug, sizes }: AddToCartFormProps) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [justAdded, setJustAdded] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasSizeChoice = sizes.length > 1;

  function handleAdd() {
    addToCart(slug, selectedSize);

    // Show "Added!" for a moment so the click feels rewarding.
    setJustAdded(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <div className="mt-6">
      {hasSizeChoice && (
        <div role="radiogroup" aria-label="Size" className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
              role="radio"
              aria-checked={size === selectedSize}
              onClick={() => setSelectedSize(size)}
              className={`min-w-14 rounded-full border-2 px-4 py-2 font-bold transition ${
                size === selectedSize ? "border-ink bg-ink text-paper hard-shadow" : "border-ink/30 hover:border-ink"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleAdd}
        className={`mt-6 w-full rounded-2xl border-2 border-ink py-4 font-display text-2xl hard-shadow transition active:translate-x-1 active:translate-y-1 active:shadow-none ${
          justAdded ? "bg-leaf text-ink" : "bg-brand text-white"
        }`}
      >
        {justAdded ? "Added! ✓" : "Add to cart"}
      </button>
    </div>
  );
}
