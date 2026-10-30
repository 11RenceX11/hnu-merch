"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product/product-card";
import type { StorefrontProduct } from "@/types/shop";

type SortOption = "featured" | "price-low" | "price-high" | "name";

type ShopBrowserProps = {
  products: StorefrontProduct[];
  /** Slugs the logged-in collector already bought. */
  ownedSlugs: string[];
};

/** A product grid with instant search and sorting. Nothing reloads while you type. */
export function ShopBrowser({ products, ownedSlugs }: ShopBrowserProps) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("featured");

  const visibleProducts = useMemo(() => {
    const searchText = query.trim().toLowerCase();

    const matching = searchText
      ? products.filter(
          (product) =>
            product.name.toLowerCase().includes(searchText) ||
            product.description.toLowerCase().includes(searchText),
        )
      : products;

    const sorted = [...matching];

    if (sort === "price-low") sorted.sort((a, b) => a.currentPrice - b.currentPrice);
    if (sort === "price-high") sorted.sort((a, b) => b.currentPrice - a.currentPrice);
    if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));

    return sorted;
  }, [products, query, sort]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products..."
          aria-label="Search products"
          className="min-w-0 flex-1 rounded-2xl border-2 border-ink bg-paper px-4 py-3 sm:max-w-sm"
        />

        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as SortOption)}
          aria-label="Sort products"
          className="rounded-2xl border-2 border-ink bg-paper px-4 py-3 font-semibold"
        >
          <option value="featured">Featured</option>
          <option value="price-low">Price: low to high</option>
          <option value="price-high">Price: high to low</option>
          <option value="name">Name: A to Z</option>
        </select>

        <p className="text-sm font-semibold text-ink/60">
          {visibleProducts.length} {visibleProducts.length === 1 ? "item" : "items"}
        </p>
      </div>

      {visibleProducts.length === 0 ? (
        <div className="mt-12 rounded-2xl border-2 border-dashed border-ink/30 p-10 text-center">
          <p className="font-display text-3xl">Nothing matches that</p>
          <button type="button" onClick={() => setQuery("")} className="mt-4 font-bold underline">
            Clear the search
          </button>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCard key={product.slug} product={product} isOwned={ownedSlugs.includes(product.slug)} />
          ))}
        </div>
      )}
    </div>
  );
}
