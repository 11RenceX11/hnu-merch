import type { Metadata } from "next";
import { CollectionForm } from "@/components/admin/collection-form";
import { requireAdmin } from "@/lib/dal";
import { listProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Admin: Add collection" };

export default async function NewCollectionPage() {
  await requireAdmin();

  const products = await listProducts();

  return (
    <>
      <h1 className="font-display text-5xl">Add a collection</h1>
      <p className="mb-8 mt-2 text-ink/70">
        Upload one photo of the whole bundle, then pin every item. Customers hover a pin to see its
        name and click it to open that item.
      </p>

      <CollectionForm productOptions={products.map(({ slug, name }) => ({ slug, name }))} />
    </>
  );
}
