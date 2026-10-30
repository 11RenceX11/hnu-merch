/**
 * Product photos are square. Collection photos are wide (4:3).
 * The viewer and the pin editor use the same shape, so a pin the admin places
 * lands on exactly the same spot of the photo that customers see.
 */
export type PhotoAspect = "square" | "wide";

export const PHOTO_ASPECT_CLASS: Record<PhotoAspect, string> = {
  square: "aspect-square",
  wide: "aspect-[4/3]",
};
