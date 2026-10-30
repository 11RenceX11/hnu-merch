import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PriceTag } from "@/components/product/price-tag";
import { getCategoryBySlug } from "@/data/categories";
import { getStorefrontProducts } from "@/lib/catalog";
import { requireAdmin } from "@/lib/dal";

export const metadata: Metadata = { title: "Admin: Products" };

export default async function AdminProductsPage() {
  await requireAdmin();

  const products = await getStorefrontProducts({ includeHidden: true });

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-5xl">Products</h1>
        <Link href="/admin/products/new" className="rounded-xl bg-brand px-5 py-3 font-semibold text-white">
          + Add a product
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="text-ink/60">
            <tr>
              <th className="p-2">Photo</th>
              <th className="p-2">Name</th>
              <th className="p-2">Categories</th>
              <th className="p-2">Price</th>
              <th className="p-2">Status</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.slug} className="border-t border-ink/15">
                <td className="p-2">
                  <div className="relative h-14 w-14 bg-mist">
                    <Image src={product.image} alt="" fill sizes="56px" className="object-cover" />
                  </div>
                </td>
                <td className="p-2 font-semibold">{product.name}</td>
                <td className="p-2 text-ink/70">
                  {product.categorySlugs.map((slug) => getCategoryBySlug(slug)?.name ?? slug).join(", ")}
                </td>
                <td className="p-2">
                  <PriceTag product={product} />
                </td>
                <td className="p-2">{product.isHidden ? "Hidden" : "Visible"}</td>
                <td className="p-2 text-right">
                  <Link href={`/admin/products/${product.slug}/edit`} className="underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
