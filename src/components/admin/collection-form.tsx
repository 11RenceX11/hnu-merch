"use client";

import { useActionState } from "react";
import { saveCollection } from "@/actions/admin-collections";
import { PinEditor } from "@/components/photo/pin-editor";
import { FieldError } from "@/components/ui/field-error";
import { inputClass, labelClass, primaryButtonClass } from "@/components/ui/form-styles";
import type { Collection } from "@/types/shop";

type CollectionFormProps = {
  /** The collection being edited. Leave empty to create a new one. */
  collection?: Collection;
  productOptions: { slug: string; name: string }[];
};

export function CollectionForm({ collection, productOptions }: CollectionFormProps) {
  const [state, formAction, isPending] = useActionState(saveCollection, undefined);
  const errors = state?.errors;

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      <input type="hidden" name="originalSlug" value={collection?.slug ?? ""} />

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            Collection name
          </label>
          <input id="name" name="name" defaultValue={collection?.name} required className={inputClass} />
          <FieldError messages={errors?.name} />
        </div>

        <div>
          <label htmlFor="label" className={labelClass}>
            Small label (optional)
          </label>
          <input
            id="label"
            name="label"
            defaultValue={collection?.label}
            placeholder="Collection 03"
            className={inputClass}
          />
          <FieldError messages={errors?.label} />
        </div>
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={collection?.description}
          rows={3}
          required
          className={inputClass}
        />
        <FieldError messages={errors?.description} />
      </div>

      <PinEditor
        aspect="wide"
        initialImage={collection?.image}
        initialPins={collection?.pins ?? []}
        productOptions={productOptions}
        imageErrors={errors?.image}
        pinErrors={errors?.pins}
      />

      {state?.message && (
        <p role="alert" className="text-sm font-semibold text-danger">
          {state.message}
        </p>
      )}

      <button type="submit" disabled={isPending} className={primaryButtonClass}>
        {isPending ? "Saving..." : collection ? "Save changes" : "Add collection"}
      </button>
    </form>
  );
}
