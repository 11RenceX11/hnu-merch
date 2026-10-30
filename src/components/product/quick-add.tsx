"use client";

import { useCart } from "@/components/cart/cart-provider";

type QuickAddProps = {
  slug: string;
  name: string;
  sizes: string[];
};

/**
 * A small panel that slides up over a product photo when you hover the card.
 * It adds the item to the cart without opening the product page.
 */
export function QuickAdd({ slug, name, sizes }: QuickAddProps) {
  const { addToCart } = useCart();
  const hasSizeChoice = sizes.length > 1;

  return (
    <div className="absolute inset-x-2 bottom-2 translate-y-[150%] rounded-2xl border-2 border-ink bg-paper p-2 transition duration-300 group-focus-within:translate-y-0 group-hover:translate-y-0">
      {hasSizeChoice ? (
        <>
          <p className="mb-1 text-center text-[11px] font-bold uppercase tracking-wide">Quick add</p>
          <div className="flex justify-center gap-1">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                aria-label={`Add ${name}, size ${size}, to the cart`}
                onClick={() => addToCart(slug, size)}
                className="min-w-9 rounded-full border-2 border-ink px-2 py-1 text-xs font-bold hover:bg-ink hover:text-paper"
              >
                {size}
              </button>
            ))}
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => addToCart(slug, sizes[0])}
          className="w-full rounded-xl bg-brand py-2 text-sm font-bold text-white hover:bg-deep"
        >
          Add to cart
        </button>
      )}
    </div>
  );
}
