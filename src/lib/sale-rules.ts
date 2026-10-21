import type { Product, Sale, SaleStatus } from "@/types/shop";

/**
 * The rules that decide when a sale applies. Pure functions (no file access),
 * so they are easy to read and test.
 */

/**
 * - paused:    switched off manually. Never applies.
 * - scheduled: starts in the future (this is how the calendar starts a sale automatically).
 * - active:    today is between the start and end date.
 * - ended:     the end date has passed.
 */
export function getSaleStatus(sale: Sale, today: string): SaleStatus {
  if (sale.isPaused) return "paused";
  if (today < sale.startDate) return "scheduled";
  if (today > sale.endDate) return "ended";
  return "active";
}

export function saleAppliesToProduct(
  sale: Sale,
  product: Pick<Product, "slug" | "collectionSlug">,
): boolean {
  switch (sale.scope.type) {
    case "all":
      return true;
    case "collection":
      return product.collectionSlug === sale.scope.collectionSlug;
    case "products":
      return sale.scope.productSlugs.includes(product.slug);
  }
}

/** When several sales apply to a product, the biggest discount wins. */
export function findBestActiveSale(
  product: Pick<Product, "slug" | "collectionSlug">,
  sales: Sale[],
  today: string,
): Sale | undefined {
  const applicableSales = sales.filter(
    (sale) => getSaleStatus(sale, today) === "active" && saleAppliesToProduct(sale, product),
  );

  return applicableSales.sort((a, b) => b.discountPercent - a.discountPercent)[0];
}

/** 1000 with 20% off becomes 800. Never lower than 1 peso. */
export function applyDiscount(price: number, discountPercent: number): number {
  return Math.max(1, Math.round((price * (100 - discountPercent)) / 100));
}

/** Short text for what a sale covers, for example "Campus Classics" or "3 products". */
export function describeSaleScope(sale: Sale, collectionNames: ReadonlyMap<string, string>): string {
  switch (sale.scope.type) {
    case "all":
      return "Everything";
    case "collection":
      return collectionNames.get(sale.scope.collectionSlug) ?? "A collection";
    case "products":
      return `${sale.scope.productSlugs.length} selected product${sale.scope.productSlugs.length === 1 ? "" : "s"}`;
  }
}
