import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PinnedPhoto } from "@/components/photo/pinned-photo";
import { AddToCartForm } from "@/components/product/add-to-cart-form";
import { PriceTag } from "@/components/product/price-tag";
import { ProductCard } from "@/components/product/product-card";
import { getCategoryBySlug } from "@/data/categories";
import { getStorefrontProducts } from "@/lib/catalog";
import { findCollection } from "@/lib/collections";
import { getSessionUser } from "@/lib/dal";
import { getPurchasedProductSlugs } from "@/lib/orders";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const products = await getStorefrontProducts();
  const product = products.find((item) => item.slug === slug);

  return {
    title: product?.name ?? "Product",
    description: product?.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const [products, user] = await Promise.all([getStorefrontProducts(), getSessionUser()]);
  const product = products.find((item) => item.slug === slug);

  if (!product) notFound();

  const collection = product.collectionSlug ? await findCollection(product.collectionSlug) : undefined;
  const purchasedSlugs = user ? await getPurchasedProductSlugs(user.id) : new Set<string>();

  const categories = product.categorySlugs
    .map((categorySlug) => getCategoryBySlug(categorySlug))
    .filter((category) => category !== undefined);

  const relatedProducts = products
    .filter(
      (item) =>
        item.slug !== product.slug &&
        item.categorySlugs.some((categorySlug) => product.categorySlugs.includes(categorySlug)),
    )
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <div className="grid gap-10 md:grid-cols-2">
        {/* Pins on the photo link to other products (for example the cap worn with this tee). */}
        <PinnedPhoto
          image={product.image}
          alt={product.name}
          aspect="square"
          pins={product.pins}
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
        />

        <div className="md:pt-6">
          <p className="flex flex-wrap gap-x-3 text-ink/60">
            {collection && (
              <Link href={`/collections/${collection.slug}`} className="underline">
                {collection.name}
              </Link>
            )}
            {categories.map((category) => (
              <Link key={category.slug} href={`/shop?category=${category.slug}`} className="underline">
                {category.name}
              </Link>
            ))}
          </p>

          <h1 className="mt-2 font-display text-5xl uppercase leading-none md:text-6xl">{product.name}</h1>
          <div className="mt-4 text-3xl">
            <PriceTag product={product} />
          </div>
          {product.saleName && <p className="mt-1 text-sm text-blood">{product.saleName}</p>}

          <p className="mt-6 max-w-md text-ink/75">{product.description}</p>

          {purchasedSlugs.has(product.slug) && (
            <p className="mt-4 max-w-md border border-ink/20 p-3 text-sm text-ink/70">
              You already own this one. You can still buy another.
            </p>
          )}

          <AddToCartForm slug={product.slug} sizes={product.sizes} />
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <>
          <h2 className="mt-24 font-display text-4xl uppercase">More like this</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item.slug} product={item} isOwned={purchasedSlugs.has(item.slug)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
