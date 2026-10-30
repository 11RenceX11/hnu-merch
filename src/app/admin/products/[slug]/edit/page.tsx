import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { listCollections } from "@/lib/collections";
import { requireAdmin } from "@/lib/dal";
import { listProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Admin: Edit product" };

type EditProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  await requireAdmin();

  const { slug } = await params;
  const [products, collections] = await Promise.all([listProducts(), listCollections()]);
  const product = products.find((item) => item.slug === slug);

  if (!product) notFound();

  return (
    <>
      <h1 className="mb-8 font-display text-5xl">Edit: {product.name}</h1>

      <ProductForm
        product={product}
        collections={collections.map(({ slug, name }) => ({ slug, name }))}
        productOptions={products.map(({ slug, name }) => ({ slug, name }))}
      />
    </>
  );
}
