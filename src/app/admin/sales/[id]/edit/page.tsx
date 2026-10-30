import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SaleForm } from "@/components/admin/sale-form";
import { listCollections } from "@/lib/collections";
import { requireAdmin } from "@/lib/dal";
import { listProducts } from "@/lib/products";
import { findSale } from "@/lib/sales";

export const metadata: Metadata = { title: "Admin: Edit sale" };

type EditSalePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSalePage({ params }: EditSalePageProps) {
  await requireAdmin();

  const { id } = await params;
  const [sale, collections, products] = await Promise.all([findSale(id), listCollections(), listProducts()]);

  if (!sale) notFound();

  return (
    <>
      <h1 className="mb-8 font-display text-5xl">Edit: {sale.name}</h1>

      <SaleForm
        sale={sale}
        collections={collections.map(({ slug, name }) => ({ slug, name }))}
        products={products.map(({ slug, name }) => ({ slug, name }))}
      />
    </>
  );
}
