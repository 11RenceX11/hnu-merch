import Link from "next/link";
import { PriceTag } from "@/components/product/price-tag";
import { ProductImage } from "@/components/product/product-image";
import type { StorefrontProduct } from "@/types/shop";

type ProductCardProps = {
  product: StorefrontProduct;
  /** True when the logged-in collector has already bought this item. */
  isOwned?: boolean;
};

export function ProductCard({ product, isOwned = false }: ProductCardProps) {
  const isOnSale = product.discountPercent > 0;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      {/* On hover the photo lifts, tilts a little and gets a sticker shadow. */}
      <div className="relative overflow-hidden border-2 border-ink bg-mist transition duration-300 group-hover:-translate-y-1 group-hover:-rotate-1 group-hover:hard-shadow">
        <ProductImage product={product} sizes="(min-width: 1024px) 25vw, 50vw" />

        {isOnSale && (
          <span className="sticker absolute left-2 top-2 rotate-6 bg-blood text-white">
            -{product.discountPercent}%
          </span>
        )}

        {!isOnSale && product.badge && (
          <span className="sticker absolute left-2 top-2 -rotate-6 bg-sun">{product.badge}</span>
        )}

        {isOwned && <span className="sticker absolute bottom-2 left-2 -rotate-3 bg-mint text-xs">You own this</span>}
      </div>

      <div className="mt-3 flex items-start justify-between gap-4">
        <h3 className="font-bold leading-tight">{product.name}</h3>
        <PriceTag product={product} />
      </div>
    </Link>
  );
}
