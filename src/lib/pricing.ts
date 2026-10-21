import type { CartLine, PriceListEntry, Quote, QuotedLine, StorefrontProduct } from "@/types/shop";

/** Turns storefront products into the small list the cart needs. */
export function buildPriceList(products: StorefrontProduct[]): PriceListEntry[] {
  return products.map((product) => ({
    slug: product.slug,
    name: product.name,
    image: product.image,
    sizes: product.sizes,
    unitPrice: product.currentPrice,
  }));
}

/**
 * Prices a cart. The same function runs in the browser (to show the cart)
 * and on the server (to decide the amount PayMongo charges).
 * The server's answer is the one that counts.
 */
export function priceCart(lines: CartLine[], priceList: ReadonlyMap<string, PriceListEntry>): Quote {
  const quotedLines: QuotedLine[] = [];

  for (const line of lines) {
    const entry = priceList.get(line.productSlug);
    if (!entry) continue; // Product no longer exists or is hidden.

    quotedLines.push({
      ...line,
      productName: entry.name,
      productImage: entry.image,
      unitPrice: entry.unitPrice,
      subtotal: entry.unitPrice * line.quantity,
    });
  }

  const total = quotedLines.reduce((sum, line) => sum + line.subtotal, 0);

  return { lines: quotedLines, total };
}
