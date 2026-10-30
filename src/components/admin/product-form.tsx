"use client";

import { useActionState } from "react";
import { saveProduct } from "@/actions/admin-products";
import { PinEditor } from "@/components/photo/pin-editor";
import { FieldError } from "@/components/ui/field-error";
import { inputClass, labelClass, primaryButtonClass } from "@/components/ui/form-styles";
import { categoryGroups } from "@/data/categories";
import type { Product } from "@/types/shop";

type ProductFormProps = {
  /** The product being edited. Leave empty to create a new one. */
  product?: Product;
  collections: { slug: string; name: string }[];
  /** Products a pin can link to. */
  productOptions: { slug: string; name: string }[];
};

export function ProductForm({ product, collections, productOptions }: ProductFormProps) {
  const [state, formAction, isPending] = useActionState(saveProduct, undefined);
  const errors = state?.errors;

  const defaultSizeOption = product && product.sizes.length === 1 ? "one-size" : "apparel";

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {/* Empty when creating a new product. */}
      <input type="hidden" name="originalSlug" value={product?.slug ?? ""} />

      <div>
        <label htmlFor="name" className={labelClass}>
          Product name
        </label>
        <input id="name" name="name" defaultValue={product?.name} required className={inputClass} />
        <FieldError messages={errors?.name} />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={product?.description}
          rows={3}
          required
          className={inputClass}
        />
        <FieldError messages={errors?.description} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className={labelClass}>
            Regular price (₱)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={1}
            step={1}
            defaultValue={product?.price}
            required
            className={inputClass}
          />
          <FieldError messages={errors?.price} />
        </div>

        <div>
          <label htmlFor="badge" className={labelClass}>
            Badge (optional)
          </label>
          <input
            id="badge"
            name="badge"
            defaultValue={product?.badge}
            placeholder="New, Limited..."
            className={inputClass}
          />
          <FieldError messages={errors?.badge} />
        </div>
      </div>

      <fieldset>
        <legend className={labelClass}>Categories</legend>
        <p className="mb-3 text-xs text-ink/60">Pick every category that fits. A tumbler can be in both Tumblers and Sports.</p>

        <div className="grid gap-4 sm:grid-cols-2">
          {categoryGroups.map((group) => (
            <div key={group.slug}>
              <p className="mb-1 text-sm text-ink/60">{group.name}</p>
              {group.categories.map((category) => (
                <label key={category.slug} className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    name="categorySlugs"
                    value={category.slug}
                    defaultChecked={product?.categorySlugs.includes(category.slug)}
                  />
                  {category.name}
                </label>
              ))}
            </div>
          ))}
        </div>
        <FieldError messages={errors?.categorySlugs} />
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="collectionSlug" className={labelClass}>
            Collection (bundle)
          </label>
          <select
            id="collectionSlug"
            name="collectionSlug"
            defaultValue={product?.collectionSlug ?? ""}
            className={`${inputClass} bg-paper`}
          >
            <option value="">None</option>
            {collections.map((collection) => (
              <option key={collection.slug} value={collection.slug}>
                {collection.name}
              </option>
            ))}
          </select>
          <FieldError messages={errors?.collectionSlug} />
        </div>

        <div>
          <label htmlFor="sizeOption" className={labelClass}>
            Sizes
          </label>
          <select
            id="sizeOption"
            name="sizeOption"
            defaultValue={defaultSizeOption}
            className={`${inputClass} bg-paper`}
          >
            <option value="apparel">S, M, L, XL, 2XL</option>
            <option value="one-size">One size</option>
          </select>
        </div>
      </div>

      <PinEditor
        aspect="square"
        initialImage={product?.image}
        initialPins={product?.pins ?? []}
        productOptions={productOptions}
        allowSelfLink
        imageErrors={errors?.image}
        pinErrors={errors?.pins}
      />

      <label className="flex items-center gap-2">
        <input type="checkbox" name="isHidden" defaultChecked={product?.isHidden} />
        Hide this product from the shop
      </label>

      {state?.message && (
        <p role="alert" className="text-sm font-semibold text-danger">
          {state.message}
        </p>
      )}

      <button type="submit" disabled={isPending} className={primaryButtonClass}>
        {isPending ? "Saving..." : product ? "Save changes" : "Add product"}
      </button>
    </form>
  );
}
