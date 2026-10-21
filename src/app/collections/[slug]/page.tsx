import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CollectionProgress } from "@/components/collection/collection-progress";
import { CollectionViewer } from "@/components/collection/collection-viewer";
import { ProductCard } from "@/components/product/product-card";
import { getStorefrontProducts } from "@/lib/catalog";
import { findCollection } from "@/lib/collections";
import { getSessionUser } from "@/lib/dal";
import { getPurchasedProductSlugs } from "@/lib/orders";

type CollectionPageProps = {
  // In Next.js 15 and later, route params are a Promise and must be awaited.
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await findCollection(slug);

  return {
    title: collection?.name ?? "Collection",
    description: collection?.description,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;

  const [collection, allProducts, user] = await Promise.all([
    findCollection(slug),
    getStorefrontProducts(),
    getSessionUser(),
  ]);

  if (!collection) notFound();

  const products = allProducts.filter((product) => product.collectionSlug === collection.slug);
  const purchasedSlugs = user ? await getPurchasedProductSlugs(user.id) : null;

  return (
    <div className="mx-auto max-w-7xl px-5 py-14">
      <Link href="/collections" className="text-sm text-ink/60 underline">
        All collections
      </Link>

      <h1 className="mt-4 font-display text-[clamp(3.5rem,10vw,8rem)] uppercase leading-[0.9]">
        {collection.name}
      </h1>
      <p className="mt-4 max-w-lg text-lg text-ink/70">{collection.description}</p>

      <div className="mt-10">
        <CollectionViewer
          collection={collection}
          products={products}
          ownedSlugs={[...(purchasedSlugs ?? [])]}
        />
      </div>

      <CollectionProgress products={products} ownedSlugs={purchasedSlugs} />

      <h2 className="mt-16 font-display text-4xl uppercase">All pieces</h2>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} isOwned={purchasedSlugs?.has(product.slug)} />
        ))}
      </div>
    </div>
  );
}
