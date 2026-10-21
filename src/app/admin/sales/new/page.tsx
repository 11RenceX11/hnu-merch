import type { Metadata } from "next";
import { SaleForm } from "@/components/admin/sale-form";
import { listCollections } from "@/lib/collections";
import { requireAdmin } from "@/lib/dal";
import { isIsoDate } from "@/lib/dates";
import { listProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Admin: Schedule a sale" };

type NewSalePageProps = {
  // Clicking a day on the calendar opens /admin/sales/new?start=2026-10-24
  searchParams: Promise<{ start?: string }>;
};

export default async function NewSalePage({ searchParams }: NewSalePageProps) {
  await requireAdmin();

  const { start } = await searchParams;
  const [collections, products] = await Promise.all([listCollections(), listProducts()]);

  return (
    <>
      <h1 className="mb-8 font-display text-5xl uppercase">Schedule a sale</h1>

      <SaleForm
        defaultStartDate={start && isIsoDate(start) ? start : undefined}
        collections={collections.map(({ slug, name }) => ({ slug, name }))}
        products={products.map(({ slug, name }) => ({ slug, name }))}
      />
    </>
  );
}
