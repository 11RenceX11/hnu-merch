import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";
import { listCollections } from "@/lib/collections";
import { requireAdmin } from "@/lib/dal";
import { listProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Admin: Add product" };

export default async function NewProductPage() {
  await requireAdmin();

  const [collections, products] = await Promise.all([listCollections(), listProducts()]);

  return (
    <>
      <h1 className="font-display text-5xl uppercase">Add a product</h1>
      <p className="mb-8 mt-2 text-ink/70">
        Upload a photo, then pin labels on it (for example the cap and the t-shirt worn in the photo).
      </p>

      <ProductForm
        collections={collections.map(({ slug, name }) => ({ slug, name }))}
        productOptions={products.map(({ slug, name }) => ({ slug, name }))}
      />
    </>
  );
}
