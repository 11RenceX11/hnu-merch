import { z } from "zod";
import { getAllCategories } from "@/data/categories";
import { isIsoDate } from "@/lib/dates";

/**
 * Validation rules (Zod schemas) for every form and Server Action.
 * Server Actions are public endpoints, so we never trust what the browser sends.
 * Next.js docs: https://nextjs.org/docs/app/guides/authentication#validate-form-fields-on-the-server
 */

// ---------------------------------------------------------------
// Form state returned by Server Actions to useActionState
// ---------------------------------------------------------------

export type FormState =
  | {
      /** Error messages per form field. */
      errors?: Record<string, string[]>;
      /** A general message for the whole form. */
      message?: string;
      /** A friendly "it worked" message. */
      success?: string;
    }
  | undefined;

/** Turns a Zod error into { fieldName: ["message", ...] }. */
export function getFieldErrors(error: z.ZodError): Record<string, string[]> {
  return z.flattenError(error).fieldErrors as Record<string, string[]>;
}

// ---------------------------------------------------------------
// Newsletter
// ---------------------------------------------------------------

export const SubscribeSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Please enter a valid email.")),
});

// ---------------------------------------------------------------
// Photo pins
// ---------------------------------------------------------------

export const PinsSchema = z
  .array(
    z.object({
      id: z.string().min(1).max(60),
      x: z.number().min(0).max(100),
      y: z.number().min(0).max(100),
      label: z.string().trim().min(1, "Every pin needs a label.").max(40),
      productSlug: z.string().min(1).optional(),
    }),
  )
  .max(12, "Use at most 12 pins per photo.");

// ---------------------------------------------------------------
// Admin: products
// ---------------------------------------------------------------

const knownCategorySlugs = getAllCategories().map((category) => category.slug);

export const ProductFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
  description: z.string().trim().min(1, "Please add a description.").max(600),
  // FormData values are strings, so coerce converts "450" to 450.
  price: z.coerce.number("Enter a price.").int("Use whole pesos.").min(1).max(100000),
  categorySlugs: z
    .array(z.string())
    .min(1, "Pick at least one category.")
    .refine((slugs) => slugs.every((slug) => knownCategorySlugs.includes(slug)), "Unknown category."),
  collectionSlug: z.string().optional(),
  sizeOption: z.enum(["apparel", "one-size"]),
  badge: z.string().trim().max(24, "Keep the badge under 24 characters.").optional(),
  isHidden: z.boolean(),
});

// ---------------------------------------------------------------
// Admin: collections
// ---------------------------------------------------------------

export const CollectionFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(60),
  label: z.string().trim().max(30).optional(),
  description: z.string().trim().min(1, "Please add a description.").max(400),
});

// ---------------------------------------------------------------
// Admin: sales
// ---------------------------------------------------------------

const IsoDateSchema = z.string().refine(isIsoDate, "Choose a valid date.");

export const SaleFormSchema = z
  .object({
    name: z.string().trim().min(2, "Name the event, for example Foundation Day Sale.").max(80),
    discountPercent: z.coerce.number("Enter a percentage.").int().min(1).max(90, "Maximum is 90%."),
    startDate: IsoDateSchema,
    endDate: IsoDateSchema,
    scopeType: z.enum(["all", "collection", "products"]),
    collectionSlug: z.string().optional(),
    productSlugs: z.array(z.string()),
  })
  .superRefine((sale, context) => {
    if (sale.startDate && sale.endDate && sale.endDate < sale.startDate) {
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "The end date cannot be before the start date.",
      });
    }

    if (sale.scopeType === "collection" && !sale.collectionSlug) {
      context.addIssue({ code: "custom", path: ["collectionSlug"], message: "Choose a collection." });
    }

    if (sale.scopeType === "products" && sale.productSlugs.length === 0) {
      context.addIssue({ code: "custom", path: ["productSlugs"], message: "Pick at least one product." });
    }
  });

// ---------------------------------------------------------------
// Cart
// ---------------------------------------------------------------

export const CartLinesSchema = z
  .array(
    z.object({
      productSlug: z.string().min(1).max(80),
      size: z.string().min(1).max(20),
      quantity: z.number().int().min(1).max(10),
    }),
  )
  .min(1, "Your cart is empty.")
  .max(20);

/** Only allow redirects to pages on this site (prevents "open redirect" attacks). */
export function getSafeRedirectPath(value: unknown, fallback: string): string {
  const isLocalPath =
    typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\");

  return isLocalPath ? value : fallback;
}
