"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { PHOTO_ASPECT_CLASS, type PhotoAspect } from "@/components/photo/photo-aspect";
import { FieldError } from "@/components/ui/field-error";
import { inputClass, labelClass, secondaryButtonClass } from "@/components/ui/form-styles";
import { SELF_PIN_TARGET } from "@/lib/pins";
import type { Pin } from "@/types/shop";

type PinEditorProps = {
  aspect: PhotoAspect;
  /** The photo that is already saved (when editing). */
  initialImage?: string;
  initialPins: Pin[];
  /** Products a pin can link to. */
  productOptions: { slug: string; name: string }[];
  /** Adds a "This product" choice. Used when the product itself is being created. */
  allowSelfLink?: boolean;
  imageErrors?: string[];
  pinErrors?: string[];
};

/** What the next click on the photo will do. */
type ClickMode = { type: "none" } | { type: "add" } | { type: "move"; pinId: string };

/**
 * Upload a photo, then place as many labelled pins on it as you like.
 * The form sends the photo as the field "image" and the pins as a JSON text field "pins".
 */
export function PinEditor({
  aspect,
  initialImage,
  initialPins,
  productOptions,
  allowSelfLink = false,
  imageErrors,
  pinErrors,
}: PinEditorProps) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(initialImage);
  const [pins, setPins] = useState<Pin[]>(initialPins);
  const [clickMode, setClickMode] = useState<ClickMode>({ type: "none" });
  const previewObjectUrl = useRef<string | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Free the memory of the previous preview before making a new one.
    if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);

    previewObjectUrl.current = URL.createObjectURL(file);
    setPreviewUrl(previewObjectUrl.current);
  }

  function handlePhotoClick(event: React.MouseEvent<HTMLDivElement>) {
    if (clickMode.type === "none") return;

    // Turn the click position into a percentage of the photo.
    const photoBox = event.currentTarget.getBoundingClientRect();
    const x = clamp(((event.clientX - photoBox.left) / photoBox.width) * 100);
    const y = clamp(((event.clientY - photoBox.top) / photoBox.height) * 100);

    if (clickMode.type === "add") {
      setPins([...pins, { id: crypto.randomUUID(), x, y, label: "" }]);
    } else {
      setPins(pins.map((pin) => (pin.id === clickMode.pinId ? { ...pin, x, y } : pin)));
    }

    setClickMode({ type: "none" });
  }

  function updatePin(pinId: string, changes: Partial<Pin>) {
    setPins(pins.map((pin) => (pin.id === pinId ? { ...pin, ...changes } : pin)));
  }

  function removePin(pinId: string) {
    setPins(pins.filter((pin) => pin.id !== pinId));
  }

  const isPlacing = clickMode.type !== "none";

  return (
    <div>
      <label htmlFor="image" className={labelClass}>
        Photo
      </label>
      <input
        id="image"
        name="image"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        required={!initialImage}
        onChange={handleFileChange}
        className={inputClass}
      />
      <p className="mt-1 text-xs text-ink/60">
        JPG, PNG or WebP, up to 3 MB. {aspect === "square" ? "Square (1:1)" : "Wide (4:3)"} photos fit best.
      </p>
      <FieldError messages={imageErrors} />

      {previewUrl && (
        <div className="mt-5">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setClickMode(clickMode.type === "add" ? { type: "none" } : { type: "add" })}
              className={secondaryButtonClass}
            >
              {clickMode.type === "add" ? "Cancel" : "+ Add a pin"}
            </button>
            <p className="text-sm text-ink/70">
              {clickMode.type === "add" && "Now click the photo where the pin should go."}
              {clickMode.type === "move" && "Now click the photo where this pin should move to."}
              {clickMode.type === "none" &&
                "Pin each item in the photo (for example the cap and the t-shirt). Customers see the label when they hover a pin."}
            </p>
          </div>

          <div
            onClick={handlePhotoClick}
            className={`relative mt-3 overflow-hidden bg-mist ${PHOTO_ASPECT_CLASS[aspect]} ${
              isPlacing ? "cursor-crosshair outline outline-2 outline-brand" : ""
            }`}
          >
            <Image src={previewUrl} alt="Photo preview" fill unoptimized className="object-cover" />

            {pins.map((pin, index) => (
              <span
                key={pin.id}
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                className="pointer-events-none absolute grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full rounded-2xl border border-ink/15 bg-gold text-xs font-bold text-ink"
              >
                {index + 1}
              </span>
            ))}
          </div>

          <ul className="mt-4 space-y-3">
            {pins.map((pin, index) => (
              <li key={pin.id} className="grid gap-2 bg-mist p-3 sm:grid-cols-[2rem_1fr_1fr_auto_auto] sm:items-center">
                <span className="font-display text-xl">{index + 1}</span>

                <input
                  value={pin.label}
                  onChange={(event) => updatePin(pin.id, { label: event.target.value })}
                  placeholder="Label, for example Black cap"
                  maxLength={40}
                  aria-label={`Label for pin ${index + 1}`}
                  className={inputClass}
                />

                <select
                  value={pin.productSlug ?? ""}
                  onChange={(event) =>
                    updatePin(pin.id, { productSlug: event.target.value || undefined })
                  }
                  aria-label={`Product for pin ${index + 1}`}
                  className={`${inputClass} bg-paper`}
                >
                  <option value="">No link (label only)</option>
                  {allowSelfLink && <option value={SELF_PIN_TARGET}>This product</option>}
                  {productOptions.map((option) => (
                    <option key={option.slug} value={option.slug}>
                      {option.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setClickMode({ type: "move", pinId: pin.id })}
                  className={secondaryButtonClass}
                >
                  Move
                </button>
                <button type="button" onClick={() => removePin(pin.id)} className={secondaryButtonClass}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <FieldError messages={pinErrors} />

      {/* The pins are sent with the form as JSON text. */}
      <input type="hidden" name="pins" value={JSON.stringify(pins)} />
    </div>
  );
}

function clamp(percent: number): number {
  return Math.round(Math.min(100, Math.max(0, percent)) * 10) / 10;
}
