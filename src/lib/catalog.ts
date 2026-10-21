import "server-only";
import { getTodayAtCampus } from "@/lib/dates";
import { listProducts } from "@/lib/products";
import { applyDiscount, findBestActiveSale, getSaleStatus } from "@/lib/sale-rules";
import { listSales } from "@/lib/sales";
import type { Sale, StorefrontProduct } from "@/types/shop";

/**
 * What customers see: products with today's sale price applied.
 * Because this reads today's date every time, a sale scheduled on the calendar
 * starts and ends by itself, with no one pressing a button.
 */

export async function getStorefrontProducts(
  options: { includeHidden?: boolean } = {},
): Promise<StorefrontProduct[]> {
  const [products, sales] = await Promise.all([listProducts(), listSales()]);
  const today = getTodayAtCampus();

  return products
    .filter((product) => options.includeHidden || !product.isHidden)
    .map((product) => {
      const sale = findBestActiveSale(product, sales, today);

      return {
        ...product,
        currentPrice: sale ? applyDiscount(product.price, sale.discountPercent) : product.price,
        discountPercent: sale?.discountPercent ?? 0,
        saleName: sale?.name,
      };
    });
}

export async function getStorefrontProduct(slug: string): Promise<StorefrontProduct | undefined> {
  const products = await getStorefrontProducts();
  return products.find((product) => product.slug === slug);
}

export async function getActiveSales(): Promise<Sale[]> {
  const sales = await listSales();
  const today = getTodayAtCampus();

  return sales.filter((sale) => getSaleStatus(sale, today) === "active");
}
