"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { APPAREL_SIZES, ONE_SIZE } from "@/data/sizes";
import { getFieldErrors, PinsSchema, ProductFormSchema } from "@/lib/definitions";
import type { FormState } from "@/lib/definitions";
import { requireAdmin } from "@/lib/dal";
import { listCollections } from "@/lib/collections";
import { readText } from "@/lib/form-data";
import { SELF_PIN_TARGET } from "@/lib/pins";
import { createProduct, findProduct, listProducts, updateProduct } from "@/lib/products";
import { slugify } from "@/lib/slug";
import { saveUploadedImage } from "@/lib/uploads";
import type { Pin } from "@/types/shop";

/**
 * Creates or updates a product. Admin only.
 * Every Server Action is a public endpoint, so it checks the admin role itself,
 * even though the page that shows the form is also protected.
 */
export async function saveProduct(state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const originalSlug = readText(formData, "originalSlug"); // empty when creating
  const existingProduct = originalSlug ? await findProduct(originalSlug) : undefined;
  const isEditing = existingProduct !== undefined;

  // 1. Validate the text fields.
  const validatedFields = ProductFormSchema.safeParse({
    name: readText(formData, "name"),
    description: readText(formData, "description"),
    price: readText(formData, "price"),
    categorySlugs: formData.getAll("categorySlugs").map(String),
    collectionSlug: readText(formData, "collectionSlug") || undefined,
    sizeOption: readText(formData, "sizeOption"),
    badge: readText(formData, "badge") || undefined,
    isHidden: formData.get("isHidden") === "on",
  });

  if (!validatedFields.success) {
    return { errors: getFieldErrors(validatedFields.error) };
  }

  const fields = validatedFields.data;
  const errors: Record<string, string[]> = {};

  // 2. The collection must exist.
  if (fields.collectionSlug) {
    const collections = await listCollections();
    if (!collections.some((collection) => collection.slug === fields.collectionSlug)) {
      errors.collectionSlug = ["That collection does not exist."];
    }
  }

  // 3. The photo: required for a new product, optional when editing.
  let imagePath = existingProduct?.image;
  const uploadedFile = formData.get("image");

  if (uploadedFile instanceof File && uploadedFile.size > 0) {
    const upload = await saveUploadedImage(uploadedFile);

    if ("error" in upload) errors.image = [upload.error];
    else imagePath = upload.path;
  } else if (!imagePath) {
    errors.image = ["Please upload a photo of the product."];
  }

  // 4. The pins on the photo.
  const parsedPins = readPins(formData);
  if ("error" in parsedPins) errors.pins = [parsedPins.error];

  if (Object.keys(errors).length > 0 || "error" in parsedPins || !imagePath) {
    return { errors };
  }

  // 5. Every pin that links to a product must link to a real one.
  const existingSlugs = (await listProducts()).map((product) => product.slug);
  const hasBrokenPinLink = parsedPins.pins.some(
    (pin) =>
      pin.productSlug !== undefined &&
      pin.productSlug !== SELF_PIN_TARGET &&
      !existingSlugs.includes(pin.productSlug),
  );

  if (hasBrokenPinLink) {
    return { errors: { pins: ["A pin links to a product that does not exist."] } };
  }

  // 6. Save.
  const productDetails = {
    name: fields.name,
    description: fields.description,
    price: fields.price,
    categorySlugs: fields.categorySlugs,
    collectionSlug: fields.collectionSlug,
    sizes: fields.sizeOption === "apparel" ? APPAREL_SIZES : ONE_SIZE,
    badge: fields.badge,
    isHidden: fields.isHidden,
    image: imagePath,
  };

  if (isEditing) {
    await updateProduct(existingProduct.slug, {
      ...productDetails,
      pins: replaceSelfPins(parsedPins.pins, existingProduct.slug),
    });
  } else {
    const created = await createProduct({ ...productDetails, pins: [] }, slugify(fields.name));
    // Now that the slug exists, "this product" pins can point to it.
    await updateProduct(created.slug, {
      ...productDetails,
      pins: replaceSelfPins(parsedPins.pins, created.slug),
    });
  }

  revalidatePath("/", "layout");
  redirect("/admin/products");
}

function readPins(formData: FormData): { pins: Pin[] } | { error: string } {
  try {
    const rawPins: unknown = JSON.parse(readText(formData, "pins") || "[]");
    const validatedPins = PinsSchema.safeParse(rawPins);

    if (!validatedPins.success) {
      return { error: validatedPins.error.issues[0]?.message ?? "Check your pins." };
    }

    return { pins: validatedPins.data };
  } catch {
    return { error: "The pins could not be read. Please try again." };
  }
}

function replaceSelfPins(pins: Pin[], productSlug: string): Pin[] {
  return pins.map((pin) =>
    pin.productSlug === SELF_PIN_TARGET ? { ...pin, productSlug } : pin,
  );
}
