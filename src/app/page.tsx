import Link from "next/link";
import { CollectionCard } from "@/components/collection/collection-card";
import { PinnedPhoto } from "@/components/photo/pinned-photo";
import { ProductCard } from "@/components/product/product-card";
import { categoryGroups } from "@/data/categories";
import { siteConfig } from "@/data/site";
import { getStorefrontProducts } from "@/lib/catalog";
import { listCollections } from "@/lib/collections";
import { getSessionUser } from "@/lib/dal";
import { getPurchasedProductSlugs } from "@/lib/orders";

const LATEST_RELEASE_COUNT = 4;
const MAX_ESSENTIALS = 8;

// Student essentials: everything that is not clothing.
const ESSENTIAL_GROUP_SLUGS = ["accessories", "drinkware", "school-supplies", "sports"];

// Each category group gets its own colour and a small tilt, like stickers on a laptop.
const GROUP_STYLES: Record<string, string> = {
  clothing: "bg-sun -rotate-1",
  accessories: "bg-mint rotate-1",
  drinkware: "bg-sky -rotate-1",
  "school-supplies": "bg-pink rotate-1",
  sports: "bg-blood text-white -rotate-1",
};

export default async function HomePage() {
  const [products, collections, user] = await Promise.all([
    getStorefrontProducts(),
    listCollections(),
    getSessionUser(),
  ]);

  const purchasedSlugs = user ? await getPurchasedProductSlugs(user.id) : new Set<string>();

  const featuredCollection =
    collections.find((collection) => collection.slug === siteConfig.featuredCollectionSlug) ?? collections[0];

  // The newest products are the last ones added.
  const latestReleases = [...products].reverse().slice(0, LATEST_RELEASE_COUNT);

  const essentialCategorySlugs = categoryGroups
    .filter((group) => ESSENTIAL_GROUP_SLUGS.includes(group.slug))
    .flatMap((group) => group.categories.map((category) => category.slug));

  const essentials = products
    .filter((product) => product.categorySlugs.some((slug) => essentialCategorySlugs.includes(slug)))
    .slice(0, MAX_ESSENTIALS);

  // The marquee is repeated so the loop looks endless.
  const marqueeText = Array(6)
    .fill(siteConfig.marqueeItems.join("  ★  ") + "  ★  ")
    .join("");

  return (
    <>
      {/* ---------- Hero: the newest collection, big ---------- */}
      <section className="border-b-2 border-ink bg-mist">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-[1fr_1.3fr] lg:py-16">
          <div>
            <span className="sticker -rotate-3 bg-sun">
              {featuredCollection?.label ? `${featuredCollection.label} · ` : ""}Now live
            </span>

            <h1 className="mt-5 font-display text-[clamp(3.5rem,9vw,8rem)] uppercase leading-[0.9]">
              {featuredCollection?.name ?? "Wear the Name"}
            </h1>

            <p className="mt-4 max-w-md text-lg">
              {featuredCollection?.description ?? "Campus merch and student essentials."} Limited edition.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={featuredCollection ? `/collections/${featuredCollection.slug}` : "/shop"}
                className="border-2 border-ink bg-blood px-8 py-4 font-display text-xl uppercase text-white hard-shadow transition hover:-translate-y-0.5"
              >
                Shop the drop
              </Link>
              <Link
                href="/shop"
                className="border-2 border-ink bg-paper px-8 py-4 font-display text-xl uppercase hard-shadow transition hover:-translate-y-0.5"
              >
                See everything
              </Link>
            </div>

            {featuredCollection && featuredCollection.pins.length > 0 && (
              <p className="mt-6 text-sm font-semibold">Psst. Hover the red circles on the photo to peek at each piece.</p>
            )}
          </div>

          {featuredCollection && (
            <div className="hard-shadow">
              <PinnedPhoto
                image={featuredCollection.image}
                alt={`${featuredCollection.name} collection`}
                aspect="wide"
                pins={featuredCollection.pins}
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
              />
            </div>
          )}
        </div>
      </section>

      {/* ---------- Scrolling banner ---------- */}
      <div className="overflow-hidden border-b-2 border-ink bg-blood py-3 text-white">
        <div className="marquee flex w-max whitespace-nowrap font-display text-2xl uppercase">
          <span>{marqueeText}</span>
          <span aria-hidden="true">{marqueeText}</span>
        </div>
      </div>

      {/* ---------- Latest releases ---------- */}
      <section className="mx-auto max-w-7xl px-5 pt-20">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-5xl uppercase md:text-7xl">Latest releases</h2>
          <Link href="/shop" className="font-bold underline">
            Shop all
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {latestReleases.map((product) => (
            <ProductCard key={product.slug} product={product} isOwned={purchasedSlugs.has(product.slug)} />
          ))}
        </div>
      </section>

      {/* ---------- Shop by category ---------- */}
      <section className="mx-auto max-w-7xl px-5 pt-24">
        <h2 className="font-display text-5xl uppercase md:text-7xl">Shop by category</h2>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categoryGroups.map((group) => (
            <Link
              key={group.slug}
              href={`/shop?group=${group.slug}`}
              className={`border-2 border-ink p-5 transition hover:rotate-0 hover:-translate-y-1 hover:hard-shadow ${
                GROUP_STYLES[group.slug] ?? "bg-paper"
              }`}
            >
              <span className="font-display text-3xl uppercase leading-none">{group.name}</span>
              <span className="mt-2 block text-xs font-semibold opacity-80">
                {group.categories.map((category) => category.name).join(", ")}
              </span>
            </Link>
          ))}

          <Link
            href="/collections"
            className="border-2 border-ink bg-ink p-5 text-paper transition hover:-translate-y-1 hover:hard-shadow"
          >
            <span className="font-display text-3xl uppercase leading-none">Collections</span>
            <span className="mt-2 block text-xs font-semibold opacity-80">Bundles and full sets</span>
          </Link>
        </div>
      </section>

      {/* ---------- Collections ---------- */}
      <section className="mx-auto max-w-7xl px-5 pt-24">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-5xl uppercase md:text-7xl">Collections</h2>
          <Link href="/collections" className="font-bold underline">
            View all
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.slug}
              collection={collection}
              pieceCount={products.filter((product) => product.collectionSlug === collection.slug).length}
            />
          ))}
        </div>
      </section>

      {/* ---------- Student essentials ---------- */}
      <section className="mx-auto max-w-7xl px-5 pt-24">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-5xl uppercase md:text-7xl">Student essentials</h2>
          <Link href="/shop?group=accessories" className="font-bold underline">
            View all
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {essentials.map((product) => (
            <ProductCard key={product.slug} product={product} isOwned={purchasedSlugs.has(product.slug)} />
          ))}
        </div>
      </section>
    </>
  );
}
