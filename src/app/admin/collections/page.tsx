import type { Metadata } from "next";
import Link from "next/link";
import { CollectionCard } from "@/components/collection/collection-card";
import { listCollections } from "@/lib/collections";
import { requireAdmin } from "@/lib/dal";
import { listProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Admin: Collections" };

export default async function AdminCollectionsPage() {
  await requireAdmin();

  const [collections, products] = await Promise.all([listCollections(), listProducts()]);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-5xl uppercase">Collections</h1>
        <Link href="/admin/collections/new" className="bg-blood px-5 py-3 font-semibold text-white">
          + Add a collection
        </Link>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {collections.map((collection) => (
          <div key={collection.slug}>
            <CollectionCard
              collection={collection}
              pieceCount={products.filter((product) => product.collectionSlug === collection.slug).length}
            />
            <Link href={`/admin/collections/${collection.slug}/edit`} className="mt-2 inline-block underline">
              Edit photo and pins
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
