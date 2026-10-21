import type { Category, CategoryGroup } from "@/types/shop";

/**
 * Product categories, grouped. A product can be in more than one category,
 * for example a tumbler can be in "Tumblers" and in "Sports Essentials".
 * To add a category, add it to a group here and it appears in the shop filters
 * and in the admin product form.
 */
export const categoryGroups: CategoryGroup[] = [
  {
    slug: "clothing",
    name: "Clothing",
    categories: [
      { slug: "t-shirts", name: "T-Shirts" },
      { slug: "hoodies-jackets", name: "Hoodies & Jackets" },
      { slug: "caps-hats", name: "Caps & Hats" },
    ],
  },
  {
    slug: "accessories",
    name: "Accessories",
    categories: [
      { slug: "keychains", name: "Keychains" },
      { slug: "id-holders", name: "ID Holders & Lanyards" },
      { slug: "bags", name: "Bags" },
      { slug: "umbrellas", name: "Umbrellas" },
    ],
  },
  {
    slug: "drinkware",
    name: "Drinkware",
    categories: [{ slug: "tumblers", name: "Tumblers" }],
  },
  {
    slug: "school-supplies",
    name: "School Supplies",
    categories: [
      { slug: "notebooks", name: "Notebooks" },
      { slug: "pens-cases", name: "Pens & Cases" },
    ],
  },
  {
    slug: "sports",
    name: "Sports",
    categories: [{ slug: "sports-essentials", name: "Sports Essentials" }],
  },
];

export function getAllCategories(): Category[] {
  return categoryGroups.flatMap((group) => group.categories);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return getAllCategories().find((category) => category.slug === slug);
}

export function getGroupBySlug(slug: string): CategoryGroup | undefined {
  return categoryGroups.find((group) => group.slug === slug);
}

/** Slugs of every category inside a group. */
export function getCategorySlugsOfGroup(groupSlug: string): string[] {
  return getGroupBySlug(groupSlug)?.categories.map((category) => category.slug) ?? [];
}
