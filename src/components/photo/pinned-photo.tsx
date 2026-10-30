"use client";

import Image from "next/image";
import Link from "next/link";
import { PHOTO_ASPECT_CLASS, type PhotoAspect } from "@/components/photo/photo-aspect";
import type { Pin } from "@/types/shop";

type PinnedPhotoProps = {
  image: string;
  alt: string;
  aspect: PhotoAspect;
  pins: Pin[];
  priority?: boolean;
  sizes: string;
  /** The product that is currently open (its pin is highlighted). */
  selectedProductSlug?: string | null;
  /**
   * When given, clicking a pin calls this instead of opening the product page.
   * The collection page uses it to show the product next to the photo.
   */
  onSelectProduct?: (productSlug: string) => void;
};

/**
 * A photo with labelled pins.
 * - Hover (or keyboard focus) a pin: its label appears.
 * - Click a pin: the linked product opens.
 */
export function PinnedPhoto({
  image,
  alt,
  aspect,
  pins,
  priority = false,
  sizes,
  selectedProductSlug,
  onSelectProduct,
}: PinnedPhotoProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border-2 border-ink bg-mist ${PHOTO_ASPECT_CLASS[aspect]}`}>
      <Image
        src={image}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover"
      />

      {pins.map((pin) => {
        const position = { left: `${pin.x}%`, top: `${pin.y}%` };
        const markerClass = "group absolute -translate-x-1/2 -translate-y-1/2";
        const isSelected = pin.productSlug !== undefined && pin.productSlug === selectedProductSlug;

        const marker = (
          <>
            <span
              className={`hotspot-dot block h-8 w-8 rounded-full border-2 border-white ${
                isSelected ? "bg-ink" : "bg-brand"
              }`}
            />
            {/* The label shows on hover or keyboard focus. */}
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xl border-2 border-ink bg-gold px-3 py-1 text-sm font-bold text-ink opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              {pin.label}
            </span>
          </>
        );

        // A pin that selects a product on this page.
        if (pin.productSlug && onSelectProduct) {
          const productSlug = pin.productSlug;

          return (
            <button
              key={pin.id}
              type="button"
              aria-label={pin.label}
              aria-pressed={isSelected}
              onClick={() => onSelectProduct(productSlug)}
              style={position}
              className={markerClass}
            >
              {marker}
            </button>
          );
        }

        // A pin that opens the product page.
        if (pin.productSlug) {
          return (
            <Link
              key={pin.id}
              href={`/products/${pin.productSlug}`}
              aria-label={pin.label}
              style={position}
              className={markerClass}
            >
              {marker}
            </Link>
          );
        }

        // A label-only pin.
        return (
          <span key={pin.id} tabIndex={0} aria-label={pin.label} style={position} className={markerClass}>
            {marker}
          </span>
        );
      })}
    </div>
  );
}
