"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CollectionFormSchema, getFieldErrors, PinsSchema } from "@/lib/definitions";
import type { FormState } from "@/lib/definitions";
import { requireAdmin } from "@/lib/dal";
import { createCollection, findCollection, updateCollection } from "@/lib/collections";
import { readText } from "@/lib/form-data";
import { listProducts } from "@/lib/products";
import { slugify } from "@/lib/slug";
import { saveUploadedImage } from "@/lib/uploads";

/** Creates or updates a collection (a bundle photo with pins). Admin only. */
export async function saveCollection(state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const originalSlug = readText(formData, "originalSlug"); // empty when creating
  const existingCollection = originalSlug ? await findCollection(originalSlug) : undefined;

  const validatedFields = CollectionFormSchema.safeParse({
    name: readText(formData, "name"),
    label: readText(formData, "label") || undefined,
    description: readText(formData, "description"),
  });

  if (!validatedFields.success) {
    return { errors: getFieldErrors(validatedFields.error) };
  }

  const errors: Record<string, string[]> = {};

  // The photo: required for a new collection, optional when editing.
  let imagePath = existingCollection?.image;
  const uploadedFile = formData.get("image");

  if (uploadedFile instanceof File && uploadedFile.size > 0) {
    const upload = await saveUploadedImage(uploadedFile);

    if ("error" in upload) errors.image = [upload.error];
    else imagePath = upload.path;
  } else if (!imagePath) {
    errors.image = ["Please upload a photo for the collection."];
  }

  // The pins.
  let rawPins: unknown = [];
  try {
    rawPins = JSON.parse(readText(formData, "pins") || "[]");
  } catch {
    errors.pins = ["The pins could not be read. Please try again."];
  }

  const validatedPins = PinsSchema.safeParse(rawPins);
  if (!validatedPins.success) {
    errors.pins = [validatedPins.error.issues[0]?.message ?? "Check your pins."];
  }

  if (Object.keys(errors).length > 0 || !validatedPins.success || !imagePath) {
    return { errors };
  }

  const productSlugs = (await listProducts()).map((product) => product.slug);
  const hasBrokenPinLink = validatedPins.data.some(
    (pin) => pin.productSlug !== undefined && !productSlugs.includes(pin.productSlug),
  );

  if (hasBrokenPinLink) {
    return { errors: { pins: ["A pin links to a product that does not exist."] } };
  }

  const collectionDetails = {
    name: validatedFields.data.name,
    label: validatedFields.data.label ?? "",
    description: validatedFields.data.description,
    image: imagePath,
    pins: validatedPins.data,
  };

  if (existingCollection) {
    await updateCollection(existingCollection.slug, collectionDetails);
  } else {
    await createCollection(collectionDetails, slugify(validatedFields.data.name));
  }

  revalidatePath("/", "layout");
  redirect("/admin/collections");
}
