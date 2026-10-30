import type { Collection } from "@/types/shop";

/**
 * Starter collections. They are copied into .data/collections.json the first
 * time an admin saves a change. After that, manage collections from the admin
 * area (/admin/collections), where you can upload a photo and pin labels on it.
 */
export const seedCollections: Collection[] = [
  {
    slug: "campus-classics",
    name: "Campus Classics",
    label: "Collection 01",
    description: "The everyday set: heavyweight hoodie, two tees and a long sleeve.",
    image: "/collections/campus-classics/bundle.svg",
    pins: [
      { id: "cc-1", x: 28, y: 35, label: "HNU Heavyweight Hoodie", productSlug: "classic-hoodie" },
      { id: "cc-2", x: 72, y: 33, label: "Campus Tee Navy", productSlug: "tee-navy" },
      { id: "cc-3", x: 30, y: 72, label: "Campus Tee Cream", productSlug: "tee-cream" },
      { id: "cc-4", x: 70, y: 70, label: "Static Long Sleeve", productSlug: "long-sleeve" },
    ],
  },
  {
    slug: "benedicite",
    name: "Benedicite",
    label: "Collection 02",
    description: "Named after the university motto, Benedicite Nomini Eius. Deep green, gold and navy.",
    image: "/collections/benedicite/bundle.svg",
    pins: [
      { id: "br-1", x: 25, y: 50, label: "Benedicite Zip Hoodie", productSlug: "zip-hoodie" },
      { id: "br-2", x: 52, y: 50, label: "Cuffed Beanie", productSlug: "beanie" },
      { id: "br-3", x: 78, y: 50, label: "Mesh Trucker Cap", productSlug: "trucker-cap" },
    ],
  },
];
