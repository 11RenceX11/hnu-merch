import Image from "next/image";
import type { Product } from "@/types/shop";

type ProductImageProps = {
  product: Pick<Product, "name" | "image">;
  /** Tells the browser how wide the image is, so it downloads the right size. */
  sizes: string;
  /** Set true for the main image at the top of a page (loads it first). */
  priority?: boolean;
};

/** A square product photo. */
export function ProductImage({ product, sizes, priority = false }: ProductImageProps) {
  return (
    <div className="relative aspect-square">
      <Image
        src={product.image}
        alt={product.name}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
