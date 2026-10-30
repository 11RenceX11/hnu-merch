import type { Metadata } from "next";
import Link from "next/link";
import { ShopBrowser } from "@/components/product/shop-browser";
import {
  categoryGroups,
  getCategoryBySlug,
  getCategorySlugsOfGroup,
  getGroupBySlug,
} from "@/data/categories";
import { getStorefrontProducts } from "@/lib/catalog";
import { getSessionUser } from "@/lib/dal";
import { getPurchasedProductSlugs } from "@/lib/orders";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse every product by category.",
};

type ShopPageProps = {
  // searchParams is a Promise in Next.js 15 and later.
  searchParams: Promise<{ group?: string; category?: string }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { group: groupSlug, category: categorySlug } = await searchParams;

  const [allProducts, user] = await Promise.all([getStorefrontProducts(), getSessionUser()]);
  const purchasedSlugs = user ? await getPurchasedProductSlugs(user.id) : new Set<string>();

  const activeCategory = categorySlug ? getCategoryBySlug(categorySlug) : undefined;
  const activeGroup = groupSlug ? getGroupBySlug(groupSlug) : undefined;

  // A category filter wins over a group filter.
  const visibleCategorySlugs = activeCategory
    ? [activeCategory.slug]
    : activeGroup
      ? getCategorySlugsOfGroup(activeGroup.slug)
      : null;

  const products = visibleCategorySlugs
    ? allProducts.filter((product) =>
        product.categorySlugs.some((slug) => visibleCategorySlugs.includes(slug)),
      )
    : allProducts;

  const chipClass = (isActive: boolean) =>
    `rounded-full border-2 px-4 py-1.5 text-sm font-bold transition ${
      isActive ? "border-ink bg-ink text-paper hard-shadow" : "border-ink/30 hover:border-ink"
    }`;

  return (
    <div className="mx-auto max-w-7xl px-5 py-14">
      <h1 className="font-display text-6xl md:text-7xl">{activeCategory?.name ?? activeGroup?.name ?? "Shop"}</h1>

      {/* Top level: category groups. */}
      <nav aria-label="Category groups" className="mt-8 flex flex-wrap gap-2">
        <Link href="/shop" className={chipClass(!activeGroup && !activeCategory)}>
          All
        </Link>
        {categoryGroups.map((group) => (
          <Link
            key={group.slug}
            href={`/shop?group=${group.slug}`}
            className={chipClass(activeGroup?.slug === group.slug && !activeCategory)}
          >
            {group.name}
          </Link>
        ))}
        <Link href="/collections" className="rounded-full border-2 border-brand px-4 py-1.5 text-sm font-bold text-brand hover:bg-brand hover:text-white">
          Collections / Bundles
        </Link>
      </nav>

      {/* Second level: the categories inside the chosen group. */}
      {activeGroup && (
        <nav aria-label="Categories" className="mt-3 flex flex-wrap gap-2">
          {activeGroup.categories.map((category) => (
            <Link
              key={category.slug}
              href={`/shop?group=${activeGroup.slug}&category=${category.slug}`}
              className={chipClass(activeCategory?.slug === category.slug)}
            >
              {category.name}
            </Link>
          ))}
        </nav>
      )}

      {/* The key makes the search box start empty when you switch category. */}
      <div className="mt-10">
        <ShopBrowser key={`${groupSlug}-${categorySlug}`} products={products} ownedSlugs={[...purchasedSlugs]} />
      </div>
    </div>
  );
}
