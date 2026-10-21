import { formatPeso } from "@/lib/format";
import type { StorefrontProduct } from "@/types/shop";

/** Shows the current price. During a sale it also shows the old price crossed out. */
export function PriceTag({
  product,
}: {
  product: Pick<StorefrontProduct, "price" | "currentPrice" | "discountPercent">;
}) {
  if (product.discountPercent === 0) {
    return <span>{formatPeso(product.price)}</span>;
  }

  return (
    <span className="flex items-baseline gap-2">
      <span className="font-semibold text-blood">{formatPeso(product.currentPrice)}</span>
      <span className="text-sm text-ink/50 line-through">{formatPeso(product.price)}</span>
    </span>
  );
}
