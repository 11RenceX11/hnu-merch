/** "Campus Tee Black!" -> "campus-tee-black" */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Returns `base`, or `base-2`, `base-3`... until it is not in `takenSlugs`. */
export function makeUniqueSlug(base: string, takenSlugs: string[]): string {
  const fallback = base || "item";
  let candidate = fallback;
  let counter = 2;

  while (takenSlugs.includes(candidate)) {
    candidate = `${fallback}-${counter}`;
    counter += 1;
  }

  return candidate;
}
