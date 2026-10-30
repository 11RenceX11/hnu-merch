import Link from "next/link";
import { CollectionCard } from "@/components/collection/collection-card";
import { PinnedPhoto } from "@/components/photo/pinned-photo";
import { ProductCard } from "@/components/product/product-card";
import { HillsDivider } from "@/components/ui/hills-divider";
import { Reveal } from "@/components/ui/reveal";
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

// Each category group gets a colour from the HNU palette, like stickers on a laptop.
const GROUP_STYLES: Record<string, string> = {
  clothing: "bg-gold",
  accessories: "bg-leaf",
  drinkware: "bg-sky",
  "school-supplies": "bg-sand",
  sports: "bg-brand text-white",
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
      <section className="bg-mist">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-[1fr_1.3fr] lg:py-16">
          <div>
            <span className="sticker rise bg-gold">Tagbilaran City · Bohol</span>

            <h1
              className="rise mt-5 font-display text-[clamp(3.2rem,8vw,7rem)] leading-[0.95]"
              style={{ animationDelay: "0.12s" }}
            >
              {featuredCollection?.name ?? "Wear the Name"}
            </h1>

            <p className="rise mt-4 max-w-md text-lg" style={{ animationDelay: "0.28s" }}>
              {featuredCollection?.label ? `${featuredCollection.label}. ` : ""}
              {featuredCollection?.description ?? "Campus merch and student essentials."} Limited edition.
            </p>

            <div className="rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "0.44s" }}>
              <Link
                href={featuredCollection ? `/collections/${featuredCollection.slug}` : "/shop"}
                className="rounded-2xl border-2 border-ink bg-brand px-8 py-4 text-lg font-extrabold uppercase text-white hard-shadow transition hover:-translate-y-0.5"
              >
                Shop the drop
              </Link>
              <Link
                href="/shop"
                className="rounded-2xl border-2 border-ink bg-paper px-8 py-4 text-lg font-extrabold uppercase hard-shadow transition hover:-translate-y-0.5"
              >
                See everything
              </Link>
            </div>

            {featuredCollection && featuredCollection.pins.length > 0 && (
              <p className="rise mt-6 text-sm font-semibold" style={{ animationDelay: "0.6s" }}>
                Psst. Hover the green circles on the photo to peek at each piece.
              </p>
            )}
          </div>

          {featuredCollection && (
            <div className="rise rounded-2xl hard-shadow" style={{ animationDelay: "0.3s" }}>
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

        {/* Round hills, like the Chocolate Hills of Bohol, flow into the green banner below. */}
        <HillsDivider backgroundClass="bg-mist" />
      </section>

      {/* ---------- Scrolling banner (pauses when you hover it) ---------- */}
      <div className="overflow-hidden bg-brand py-3 text-white">
        <div className="marquee flex w-max whitespace-nowrap font-display text-2xl">
          <span>{marqueeText}</span>
          <span aria-hidden="true">{marqueeText}</span>
        </div>
      </div>

      {/* ---------- Latest releases ---------- */}
      <section className="mx-auto max-w-7xl px-5 pt-20">
        <Reveal>
          <div className="flex items-end justify-between">
            <h2 className="font-display text-5xl md:text-6xl">Latest releases</h2>
            <Link href="/shop" className="link-grow font-bold">
              Shop all
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {latestReleases.map((product) => (
              <ProductCard key={product.slug} product={product} isOwned={purchasedSlugs.has(product.slug)} />
            ))}
          </div>
        </Reveal>
      </section>

      {/* ---------- Shop by category ---------- */}
      <section className="mx-auto max-w-7xl px-5 pt-24">
        <Reveal>
          <h2 className="font-display text-5xl md:text-6xl">Shop by category</h2>

          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {categoryGroups.map((group) => (
              <Link
                key={group.slug}
                href={`/shop?group=${group.slug}`}
                className={`group rounded-2xl border-2 border-ink p-5 transition hover:-translate-y-1 hover:hard-shadow ${
                  GROUP_STYLES[group.slug] ?? "bg-paper"
                }`}
              >
                <span className="font-display text-3xl leading-none">{group.name}</span>
                <span className="mt-2 block text-xs font-semibold opacity-80">
                  {group.categories.map((category) => category.name).join(", ")}
                </span>
                <span className="mt-3 block text-sm font-bold opacity-0 transition group-hover:opacity-100">
                  Explore →
                </span>
              </Link>
            ))}

            <Link
              href="/collections"
              className="group rounded-2xl border-2 border-ink bg-ink p-5 text-paper transition hover:-translate-y-1 hover:hard-shadow"
            >
              <span className="font-display text-3xl leading-none">Collections</span>
              <span className="mt-2 block text-xs font-semibold opacity-80">Bundles and full sets</span>
              <span className="mt-3 block text-sm font-bold opacity-0 transition group-hover:opacity-100">
                Explore →
              </span>
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ---------- Collections ---------- */}
      <section className="mx-auto max-w-7xl px-5 pt-24">
        <Reveal>
          <div className="flex items-end justify-between">
            <h2 className="font-display text-5xl md:text-6xl">Collections</h2>
            <Link href="/collections" className="link-grow font-bold">
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
        </Reveal>
      </section>

      {/* ---------- Student essentials ---------- */}
      <section className="mx-auto max-w-7xl px-5 pt-24">
        <Reveal>
          <div className="flex items-end justify-between">
            <h2 className="font-display text-5xl md:text-6xl">Student essentials</h2>
            <Link href="/shop?group=accessories" className="link-grow font-bold">
              View all
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {essentials.map((product) => (
              <ProductCard key={product.slug} product={product} isOwned={purchasedSlugs.has(product.slug)} />
            ))}
          </div>
        </Reveal>
      </section>
    </>
  );
}
