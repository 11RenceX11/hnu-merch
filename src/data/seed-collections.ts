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
      { id: "cc-2", x: 72, y: 33, label: "Campus Tee Black", productSlug: "tee-black" },
      { id: "cc-3", x: 30, y: 72, label: "Campus Tee Bone", productSlug: "tee-bone" },
      { id: "cc-4", x: 70, y: 70, label: "Static Long Sleeve", productSlug: "long-sleeve" },
    ],
  },
  {
    slug: "blood-red",
    name: "Blood Red",
    label: "Collection 02",
    description: "One deep red dye lot. When it is gone, it is gone.",
    image: "/collections/blood-red/bundle.svg",
    pins: [
      { id: "br-1", x: 25, y: 50, label: "Blood Red Zip Hoodie", productSlug: "zip-hoodie" },
      { id: "br-2", x: 52, y: 50, label: "Cuffed Beanie", productSlug: "beanie" },
      { id: "br-3", x: 78, y: 50, label: "Mesh Trucker Cap", productSlug: "trucker-cap" },
    ],
  },
];
