import "server-only";
import { seedProducts } from "@/data/seed-products";
import { JsonFileStore } from "@/lib/json-store";
import { makeUniqueSlug } from "@/lib/slug";
import type { Product } from "@/types/shop";

type ProductData = { products: Product[] };

const productStore = new JsonFileStore<ProductData>("products.json", () => ({
  products: structuredClone(seedProducts),
}));

export async function listProducts(): Promise<Product[]> {
  const { products } = await productStore.read();
  return products;
}

export async function findProduct(slug: string): Promise<Product | undefined> {
  const products = await listProducts();
  return products.find((product) => product.slug === slug);
}

/** Adds a product. The slug (its web address) is made unique automatically. */
export function createProduct(input: Omit<Product, "slug">, preferredSlug: string): Promise<Product> {
  return productStore.update(({ products }) => {
    const slug = makeUniqueSlug(
      preferredSlug,
      products.map((product) => product.slug),
    );

    const newProduct: Product = { ...input, slug };
    products.push(newProduct);
    return newProduct;
  });
}

/** Replaces a product's details. The slug never changes. Returns false if not found. */
export function updateProduct(slug: string, changes: Omit<Product, "slug">): Promise<boolean> {
  return productStore.update(({ products }) => {
    const index = products.findIndex((product) => product.slug === slug);
    if (index === -1) return false;

    products[index] = { ...changes, slug };
    return true;
  });
}
