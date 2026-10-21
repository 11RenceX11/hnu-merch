import Link from "next/link";
import type { StorefrontProduct } from "@/types/shop";

type CollectionProgressProps = {
  products: StorefrontProduct[];
  /** null when nobody is logged in. */
  ownedSlugs: Set<string> | null;
};

/** Shows a collector how many pieces of a collection they already own. */
export function CollectionProgress({ products, ownedSlugs }: CollectionProgressProps) {
  if (!ownedSlugs) {
    return (
      <p className="mt-10 bg-mist p-5 text-sm text-ink/70">
        <Link href="/login" className="font-semibold underline">
          Log in
        </Link>{" "}
        to see which pieces of this collection you already own.
      </p>
    );
  }

  const ownedCount = products.filter((product) => ownedSlugs.has(product.slug)).length;

  return (
    <section className="mt-10 bg-mist p-5">
      <h2 className="font-display text-2xl uppercase">
        Your collection: {ownedCount} of {products.length}
      </h2>
      <p className="mt-1 text-sm text-ink/70">
        You can always buy another of any piece, even one you own.
      </p>

      <ul className="mt-4 flex flex-wrap gap-2 text-sm">
        {products.map((product) => (
          <li
            key={product.slug}
            className={`border px-3 py-1 ${
              ownedSlugs.has(product.slug) ? "border-blood text-blood" : "border-ink/20 text-ink/60"
            }`}
          >
            {ownedSlugs.has(product.slug) ? "✓ " : ""}
            {product.name}
          </li>
        ))}
      </ul>
    </section>
  );
}
