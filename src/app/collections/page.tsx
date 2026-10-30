import type { Metadata } from "next";
import { CollectionCard } from "@/components/collection/collection-card";
import { getStorefrontProducts } from "@/lib/catalog";
import { listCollections } from "@/lib/collections";

export const metadata: Metadata = {
  title: "Collections",
  description: "Browse every merch collection.",
};

export default async function CollectionsPage() {
  const [collections, products] = await Promise.all([listCollections(), getStorefrontProducts()]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-14">
      <h1 className="font-display text-7xl">Collections</h1>
      <p className="mt-4 max-w-md text-ink/70">
        Every release is its own collection. Pick one to see everything in it.
      </p>

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {collections.map((collection) => (
          <CollectionCard
            key={collection.slug}
            collection={collection}
            pieceCount={products.filter((product) => product.collectionSlug === collection.slug).length}
          />
        ))}
      </div>
    </div>
  );
}
