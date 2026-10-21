import type { Product } from "@/types/shop";

/**
 * Starter products. They are copied into .data/products.json the first time an
 * admin saves a change. After that, manage products from the admin area
 * (/admin/products) instead of editing this file.
 */

const APPAREL_SIZES = ["S", "M", "L", "XL", "2XL"];
const ONE_SIZE = ["One size"];

export const seedProducts: Product[] = [
  // ---------------------------------------------------------------
  // Collection 01: Campus Classics
  // ---------------------------------------------------------------
  {
    slug: "classic-hoodie",
    name: "HNU Heavyweight Hoodie",
    description: "450gsm brushed fleece, boxy fit, puff-print front and back. Runs oversized.",
    price: 1100,
    categorySlugs: ["hoodies-jackets"],
    sizes: APPAREL_SIZES,
    image: "/products/classic-hoodie/image.svg",
    pins: [],
    badge: "New drop",
    collectionSlug: "campus-classics",
  },
  {
    slug: "tee-black",
    name: "Campus Tee Black",
    description: "Washed black 240gsm tee with the class year printed on the back.",
    price: 450,
    categorySlugs: ["t-shirts"],
    sizes: APPAREL_SIZES,
    image: "/products/tee-black/image.svg",
    pins: [],
    badge: "Bestseller",
    collectionSlug: "campus-classics",
  },
  {
    slug: "tee-bone",
    name: "Campus Tee Bone",
    description: "The same campus tee in bone. Pre-shrunk with a drop shoulder.",
    price: 450,
    categorySlugs: ["t-shirts"],
    sizes: APPAREL_SIZES,
    image: "/products/tee-bone/image.svg",
    pins: [],
    collectionSlug: "campus-classics",
  },
  {
    slug: "long-sleeve",
    name: "Static Long Sleeve",
    description: "Heavy long sleeve with sleeve prints and a cracked front graphic.",
    price: 720,
    categorySlugs: ["t-shirts"],
    sizes: APPAREL_SIZES,
    image: "/products/long-sleeve/image.svg",
    pins: [],
    collectionSlug: "campus-classics",
  },

  // ---------------------------------------------------------------
  // Collection 02: Blood Red
  // ---------------------------------------------------------------
  {
    slug: "zip-hoodie",
    name: "Blood Red Zip Hoodie",
    description: "Full-zip hoodie in a deep red dye with an embroidered chest logo.",
    price: 1250,
    categorySlugs: ["hoodies-jackets"],
    sizes: APPAREL_SIZES,
    image: "/products/zip-hoodie/image.svg",
    pins: [],
    badge: "Limited",
    collectionSlug: "blood-red",
  },
  {
    slug: "beanie",
    name: "Cuffed Beanie",
    description: "Ribbed knit beanie with a stitched logo tab.",
    price: 320,
    categorySlugs: ["caps-hats"],
    sizes: ONE_SIZE,
    image: "/products/beanie/image.svg",
    pins: [],
    collectionSlug: "blood-red",
  },
  {
    slug: "trucker-cap",
    name: "Mesh Trucker Cap",
    description: "Five-panel trucker cap with a woven patch and an adjustable snapback.",
    price: 380,
    categorySlugs: ["caps-hats"],
    sizes: ONE_SIZE,
    image: "/products/trucker-cap/image.svg",
    pins: [],
    collectionSlug: "blood-red",
  },

  // ---------------------------------------------------------------
  // Student essentials (not collectible)
  // ---------------------------------------------------------------
  {
    slug: "keychain",
    name: "Campus Keychain",
    description: "Rubber keychain with a metal ring. Clips to a bag or your keys.",
    price: 80,
    categorySlugs: ["keychains"],
    sizes: ONE_SIZE,
    image: "/products/keychain/image.svg",
    pins: [],
  },
  {
    slug: "umbrella",
    name: "Auto-Open Umbrella",
    description: "Windproof ribbed frame that opens with one push and fits inside a school bag.",
    price: 420,
    categorySlugs: ["umbrellas"],
    sizes: ONE_SIZE,
    image: "/products/umbrella/image.svg",
    pins: [],
    badge: "Student essential",
  },
  {
    slug: "tumbler",
    name: "Steel Tumbler 600ml",
    description: "Insulated steel tumbler that keeps water cold through a full class day.",
    price: 550,
    categorySlugs: ["tumblers", "sports-essentials"],
    sizes: ONE_SIZE,
    image: "/products/tumbler/image.svg",
    pins: [],
  },
  {
    slug: "tote-bag",
    name: "Canvas Tote Bag",
    description: "Heavy canvas tote that fits a laptop, books and a folder.",
    price: 280,
    categorySlugs: ["bags"],
    sizes: ONE_SIZE,
    image: "/products/tote-bag/image.svg",
    pins: [],
  },
  {
    slug: "lanyard",
    name: "ID Lanyard",
    description: "Woven lanyard with a metal clip.",
    price: 120,
    categorySlugs: ["id-holders"],
    sizes: ONE_SIZE,
    image: "/products/lanyard/image.svg",
    pins: [],
  },
  {
    slug: "id-holder",
    name: "ID Holder",
    description: "Hard clear case that protects your school ID.",
    price: 90,
    categorySlugs: ["id-holders"],
    sizes: ONE_SIZE,
    image: "/products/id-holder/image.svg",
    pins: [],
  },
  {
    slug: "notebook-set",
    name: "Notebook Set (3)",
    description: "Three 80-leaf notebooks with a campus cover.",
    price: 150,
    categorySlugs: ["notebooks"],
    sizes: ONE_SIZE,
    image: "/products/notebook-set/image.svg",
    pins: [],
  },
  {
    slug: "pen-set",
    name: "Pen Set (5)",
    description: "Five black gel pens for exams and reviewers.",
    price: 99,
    categorySlugs: ["pens-cases"],
    sizes: ONE_SIZE,
    image: "/products/pen-set/image.svg",
    pins: [],
  },
  {
    slug: "pencil-case",
    name: "Pencil Case",
    description: "Zip pouch with room for pens, a calculator and highlighters.",
    price: 160,
    categorySlugs: ["pens-cases"],
    sizes: ONE_SIZE,
    image: "/products/pencil-case/image.svg",
    pins: [],
  },
];
