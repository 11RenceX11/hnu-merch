import Link from "next/link";
import { PriceTag } from "@/components/product/price-tag";
import { ProductImage } from "@/components/product/product-image";
import { QuickAdd } from "@/components/product/quick-add";
import type { StorefrontProduct } from "@/types/shop";

type ProductCardProps = {
  product: StorefrontProduct;
  /** True when the logged-in collector has already bought this item. */
  isOwned?: boolean;
};

export function ProductCard({ product, isOwned = false }: ProductCardProps) {
  const isOnSale = product.discountPercent > 0;

  return (
    <div className="group">
      {/* On hover the photo lifts and gets a sticker shadow, and Quick add slides up. */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-ink bg-mist transition duration-300 group-hover:-translate-y-1 group-hover:hard-shadow">
        <Link href={`/products/${product.slug}`} aria-label={product.name} className="block">
          <ProductImage product={product} sizes="(min-width: 1024px) 25vw, 50vw" />
        </Link>

        <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1">
          {isOnSale && <span className="sticker bg-brand text-white">-{product.discountPercent}%</span>}
          {!isOnSale && product.badge && <span className="sticker bg-gold">{product.badge}</span>}
        </div>

        {isOwned && <span className="sticker pointer-events-none absolute right-2 top-2 bg-leaf text-xs">You own this</span>}

        <QuickAdd slug={product.slug} name={product.name} sizes={product.sizes} />
      </div>

      <Link href={`/products/${product.slug}`} className="mt-3 flex items-start justify-between gap-4">
        <h3 className="font-bold leading-tight">{product.name}</h3>
        <PriceTag product={product} />
      </Link>
    </div>
  );
}
