import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getStorefrontProducts } from "@/lib/catalog";
import { listCollections } from "@/lib/collections";
import { requireUser } from "@/lib/dal";
import { formatPeso } from "@/lib/format";
import { getPurchasedProductSlugs, listOrdersForUser } from "@/lib/orders";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  // Real permission check (the Proxy only does a quick redirect).
  const user = await requireUser("/account");

  const [orders, purchasedSlugs, products, collections] = await Promise.all([
    listOrdersForUser(user.id),
    getPurchasedProductSlugs(user.id),
    getStorefrontProducts({ includeHidden: true }),
    listCollections(),
  ]);

  const ownedProducts = products.filter((product) => purchasedSlugs.has(product.slug));

  return (
    <div className="mx-auto max-w-5xl px-5 py-14">
      <h1 className="font-display text-6xl uppercase">My account</h1>
      <p className="mt-2 text-ink/70">
        {user.name} · {user.email} · {user.role === "admin" ? "Admin" : "Collector"}
      </p>

      {/* ---------- What the collector already bought ---------- */}
      <section className="mt-12">
        <h2 className="font-display text-3xl uppercase">What I own</h2>
        <p className="mt-1 text-sm text-ink/70">You can always buy another of anything.</p>

        {ownedProducts.length === 0 ? (
          <p className="mt-4 text-ink/70">
            Nothing yet.{" "}
            <Link href="/shop" className="underline">
              Start your collection
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-6">
            {ownedProducts.map((product) => (
              <li key={product.slug}>
                <Link href={`/products/${product.slug}`} className="block">
                  <div className="relative aspect-square bg-mist">
                    <Image src={product.image} alt={product.name} fill sizes="120px" className="object-cover" />
                  </div>
                  <p className="mt-1 text-xs">{product.name}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ---------- Progress in each collection ---------- */}
      <section className="mt-12">
        <h2 className="font-display text-3xl uppercase">My collections</h2>

        <ul className="mt-4 space-y-3">
          {collections.map((collection) => {
            const pieces = products.filter((product) => product.collectionSlug === collection.slug);
            const ownedCount = pieces.filter((piece) => purchasedSlugs.has(piece.slug)).length;

            return (
              <li key={collection.slug} className="flex items-center justify-between bg-mist p-4">
                <Link href={`/collections/${collection.slug}`} className="font-semibold underline">
                  {collection.name}
                </Link>
                <span className="text-sm text-ink/70">
                  {ownedCount} of {pieces.length} pieces
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ---------- Order history ---------- */}
      <section className="mt-12">
        <h2 className="font-display text-3xl uppercase">Orders</h2>

        {orders.length === 0 ? (
          <p className="mt-4 text-ink/70">No orders yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {orders.map((order) => (
              <li key={order.reference} className="bg-mist p-4 text-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-semibold">{order.reference}</span>
                  <span>
                    {new Date(order.createdAt).toLocaleDateString("en-PH")} ·{" "}
                    <span className={order.status === "paid" ? "text-blood" : "text-ink/60"}>
                      {order.status.replace("_", " ")}
                    </span>{" "}
                    · {formatPeso(order.total)}
                  </span>
                </div>
                <p className="mt-2 text-ink/70">
                  {order.items.map((item) => `${item.quantity}× ${item.productName}`).join(", ")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
