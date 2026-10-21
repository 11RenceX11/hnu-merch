import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionForm } from "@/components/admin/collection-form";
import { findCollection } from "@/lib/collections";
import { requireAdmin } from "@/lib/dal";
import { listProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Admin: Edit collection" };

type EditCollectionPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditCollectionPage({ params }: EditCollectionPageProps) {
  await requireAdmin();

  const { slug } = await params;
  const [collection, products] = await Promise.all([findCollection(slug), listProducts()]);

  if (!collection) notFound();

  return (
    <>
      <h1 className="mb-8 font-display text-5xl uppercase">Edit: {collection.name}</h1>

      <CollectionForm
        collection={collection}
        productOptions={products.map(({ slug, name }) => ({ slug, name }))}
      />
    </>
  );
}
