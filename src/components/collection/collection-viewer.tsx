"use client";

import Link from "next/link";
import { useState } from "react";
import { PinnedPhoto } from "@/components/photo/pinned-photo";
import { AddToCartForm } from "@/components/product/add-to-cart-form";
import { PriceTag } from "@/components/product/price-tag";
import { ProductImage } from "@/components/product/product-image";
import type { Collection, StorefrontProduct } from "@/types/shop";

type CollectionViewerProps = {
  collection: Collection;
  /** Every product in the collection. */
  products: StorefrontProduct[];
  /** Slugs the logged-in collector already bought. */
  ownedSlugs: string[];
};

/**
 * The collection photo with its pins. Click a pin (or a name in the list) and
 * that item opens on its own next to the photo.
 */
export function CollectionViewer({ collection, products, ownedSlugs }: CollectionViewerProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const selectedProduct = products.find((product) => product.slug === selectedSlug) ?? null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <PinnedPhoto
        image={collection.image}
        alt={`${collection.name} collection`}
        aspect="wide"
        pins={collection.pins}
        priority
        sizes="(min-width: 1024px) 60vw, 100vw"
        selectedProductSlug={selectedSlug}
        onSelectProduct={setSelectedSlug}
      />

      <div className="border-2 border-ink bg-mist p-5">
        {selectedProduct ? (
          <>
            <ProductImage product={selectedProduct} sizes="(min-width: 1024px) 30vw, 100vw" />

            <h3 className="mt-4 font-display text-3xl uppercase">{selectedProduct.name}</h3>
            <div className="mt-1 text-xl">
              <PriceTag product={selectedProduct} />
            </div>
            {ownedSlugs.includes(selectedProduct.slug) && (
              <p className="mt-2 text-sm text-ink/70">You already own this. You can still buy another.</p>
            )}
            <p className="mt-3 text-sm text-ink/70">{selectedProduct.description}</p>

            <AddToCartForm slug={selectedProduct.slug} sizes={selectedProduct.sizes} />

            <div className="mt-4 flex justify-between text-sm">
              <Link href={`/products/${selectedProduct.slug}`} className="underline">
                Open full page
              </Link>
              <button type="button" onClick={() => setSelectedSlug(null)} className="underline">
                Back to the collection
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-display text-3xl uppercase">{collection.name}</h3>
            <p className="mt-3 text-ink/70">
              Hover the circles to see each item. Click one to look at it on its own.
            </p>

            {/* The same items as a list, for phones and keyboard users. */}
            <ul className="mt-6 space-y-2">
              {products.map((product) => (
                <li key={product.slug}>
                  <button
                    type="button"
                    onClick={() => setSelectedSlug(product.slug)}
                    className="flex w-full items-center justify-between gap-3 border border-ink/20 px-4 py-3 text-left hover:border-blood"
                  >
                    <span>
                      {product.name}
                      {ownedSlugs.includes(product.slug) && (
                        <span className="ml-2 text-xs text-blood">Owned</span>
                      )}
                    </span>
                    <PriceTag product={product} />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
