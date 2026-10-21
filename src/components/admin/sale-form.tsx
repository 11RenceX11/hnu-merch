"use client";

import { useActionState, useState } from "react";
import { saveSale } from "@/actions/admin-sales";
import { FieldError } from "@/components/ui/field-error";
import { inputClass, labelClass, primaryButtonClass } from "@/components/ui/form-styles";
import type { Sale } from "@/types/shop";

type SaleFormProps = {
  /** The sale being edited. Leave empty to create a new one. */
  sale?: Sale;
  /** Pre-filled start date, for example when you click a day on the calendar. */
  defaultStartDate?: string;
  collections: { slug: string; name: string }[];
  products: { slug: string; name: string }[];
};

type ScopeType = "all" | "collection" | "products";

export function SaleForm({ sale, defaultStartDate, collections, products }: SaleFormProps) {
  const [state, formAction, isPending] = useActionState(saveSale, undefined);
  const [scopeType, setScopeType] = useState<ScopeType>(sale?.scope.type ?? "all");
  const errors = state?.errors;

  const selectedProductSlugs = sale?.scope.type === "products" ? sale.scope.productSlugs : [];
  const selectedCollectionSlug = sale?.scope.type === "collection" ? sale.scope.collectionSlug : "";

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {/* Empty when creating a new sale. */}
      <input type="hidden" name="saleId" value={sale?.id ?? ""} />

      <div>
        <label htmlFor="name" className={labelClass}>
          Event name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={sale?.name}
          placeholder="Foundation Day Sale"
          required
          className={inputClass}
        />
        <FieldError messages={errors?.name} />
      </div>

      <div>
        <label htmlFor="discountPercent" className={labelClass}>
          Discount (% off)
        </label>
        <input
          id="discountPercent"
          name="discountPercent"
          type="number"
          min={1}
          max={90}
          defaultValue={sale?.discountPercent ?? 20}
          required
          className={inputClass}
        />
        <FieldError messages={errors?.discountPercent} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className={labelClass}>
            Starts on
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={sale?.startDate ?? defaultStartDate}
            required
            className={inputClass}
          />
          <FieldError messages={errors?.startDate} />
        </div>

        <div>
          <label htmlFor="endDate" className={labelClass}>
            Ends on (included)
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={sale?.endDate ?? defaultStartDate}
            required
            className={inputClass}
          />
          <FieldError messages={errors?.endDate} />
        </div>
      </div>
      <p className="-mt-3 text-xs text-ink/60">
        The discount turns on by itself on the start date and off after the end date. No button needed.
        To stop a sale early, pause it from the sales page.
      </p>

      <fieldset>
        <legend className={labelClass}>What is on sale?</legend>

        {(
          [
            ["all", "Everything in the shop"],
            ["collection", "One collection"],
            ["products", "Selected products"],
          ] as const
        ).map(([value, label]) => (
          <label key={value} className="flex items-center gap-2 py-1">
            <input
              type="radio"
              name="scopeType"
              value={value}
              checked={scopeType === value}
              onChange={() => setScopeType(value)}
            />
            {label}
          </label>
        ))}

        {scopeType === "collection" && (
          <div className="mt-3">
            <select
              name="collectionSlug"
              defaultValue={selectedCollectionSlug}
              aria-label="Collection"
              className={`${inputClass} bg-paper`}
            >
              <option value="">Choose a collection</option>
              {collections.map((collection) => (
                <option key={collection.slug} value={collection.slug}>
                  {collection.name}
                </option>
              ))}
            </select>
            <FieldError messages={errors?.collectionSlug} />
          </div>
        )}

        {scopeType === "products" && (
          <div className="mt-3 max-h-64 overflow-y-auto border border-ink/20 p-3">
            {products.map((product) => (
              <label key={product.slug} className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  name="productSlugs"
                  value={product.slug}
                  defaultChecked={selectedProductSlugs.includes(product.slug)}
                />
                {product.name}
              </label>
            ))}
            <FieldError messages={errors?.productSlugs} />
          </div>
        )}
      </fieldset>

      {state?.message && (
        <p role="alert" className="text-sm font-semibold text-blood">
          {state.message}
        </p>
      )}

      <button type="submit" disabled={isPending} className={primaryButtonClass}>
        {isPending ? "Saving..." : sale ? "Save changes" : "Put on the calendar"}
      </button>
    </form>
  );
}
