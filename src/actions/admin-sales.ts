"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getFieldErrors, SaleFormSchema } from "@/lib/definitions";
import type { FormState } from "@/lib/definitions";
import { requireAdmin } from "@/lib/dal";
import { listCollections } from "@/lib/collections";
import { readText } from "@/lib/form-data";
import { listProducts } from "@/lib/products";
import { createSale, deleteSale, findSale, setSalePaused, updateSale } from "@/lib/sales";
import type { SaleScope } from "@/types/shop";

/**
 * Creates or updates a sale. Admin only.
 *
 * A sale has a start date and an end date. Putting it on the calendar is all
 * that is needed: the shop applies the discount automatically from the start
 * date and removes it after the end date.
 */
export async function saveSale(state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const saleId = readText(formData, "saleId"); // empty when creating

  const validatedFields = SaleFormSchema.safeParse({
    name: readText(formData, "name"),
    discountPercent: readText(formData, "discountPercent"),
    startDate: readText(formData, "startDate"),
    endDate: readText(formData, "endDate"),
    scopeType: readText(formData, "scopeType"),
    collectionSlug: readText(formData, "collectionSlug") || undefined,
    productSlugs: formData.getAll("productSlugs").map(String),
  });

  if (!validatedFields.success) {
    return { errors: getFieldErrors(validatedFields.error) };
  }

  const sale = validatedFields.data;

  // Build the scope and check that it points to real things.
  let scope: SaleScope;

  if (sale.scopeType === "collection") {
    const collections = await listCollections();
    if (!collections.some((collection) => collection.slug === sale.collectionSlug)) {
      return { errors: { collectionSlug: ["That collection does not exist."] } };
    }
    scope = { type: "collection", collectionSlug: sale.collectionSlug! };
  } else if (sale.scopeType === "products") {
    const productSlugs = (await listProducts()).map((product) => product.slug);
    const validSlugs = sale.productSlugs.filter((slug) => productSlugs.includes(slug));
    if (validSlugs.length === 0) {
      return { errors: { productSlugs: ["Pick at least one product."] } };
    }
    scope = { type: "products", productSlugs: validSlugs };
  } else {
    scope = { type: "all" };
  }

  const saleDetails = {
    name: sale.name,
    discountPercent: sale.discountPercent,
    startDate: sale.startDate,
    endDate: sale.endDate,
    scope,
  };

  if (saleId) {
    const exists = await findSale(saleId);
    if (!exists) return { message: "That sale no longer exists." };
    await updateSale(saleId, saleDetails);
  } else {
    await createSale(saleDetails);
  }

  revalidatePath("/", "layout");
  redirect("/admin/sales");
}

/** The manual switch. Pauses an active or scheduled sale, or resumes a paused one. */
export async function toggleSalePaused(formData: FormData): Promise<void> {
  await requireAdmin();

  const saleId = readText(formData, "saleId");
  const sale = await findSale(saleId);

  if (sale) {
    await setSalePaused(saleId, !sale.isPaused);
    revalidatePath("/", "layout");
  }
}

export async function removeSale(formData: FormData): Promise<void> {
  await requireAdmin();

  await deleteSale(readText(formData, "saleId"));
  revalidatePath("/", "layout");
}
