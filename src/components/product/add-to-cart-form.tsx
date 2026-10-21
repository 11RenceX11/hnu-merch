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

  function handleAdd() {
    addToCart(slug, selectedSize);

    // Show "Added!" for a moment so the click feels rewarding.
    setJustAdded(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setJustAdded(false), 1200);
  }

  const hasSizeChoice = sizes.length > 1;

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
              className={`min-w-14 border-2 px-4 py-3 font-bold ${
                size === selectedSize ? "border-ink bg-ink text-paper hard-shadow" : "border-ink/30"
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
        className={`mt-6 w-full border-2 border-ink py-4 font-display text-2xl uppercase hard-shadow transition active:translate-x-1 active:translate-y-1 active:shadow-none ${
          justAdded ? "bg-mint text-ink" : "bg-blood text-white"
        }`}
      >
        {justAdded ? "Added! ✓" : "Add to cart"}
      </button>
    </div>
  );
}
