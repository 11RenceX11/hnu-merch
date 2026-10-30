/**
 * Generates simple placeholder images so the site works before you have real photos.
 *
 *   npm run placeholders
 *
 * Output:
 *   public/products/<slug>/image.svg
 *   public/collections/<slug>/bundle.svg
 *
 * When you have real photos, just put them in the same folders and update the
 * paths in the admin area. This script is
 * only for placeholders, so you can delete it afterwards.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const BACKGROUND = "#f6f2e6";

// Outlines drawn on a 200 x 200 canvas.
const SHAPES = {
  tee: "M72 30c10 12 46 12 56 0l42 20 12 48-26 8-4-22v90H48v-90l-4 22-26-8 12-48z",
  hoodie: "M70 28c10 14 50 14 60 0l40 22 14 56-26 8-6-26v94H54v-94l-6 26-26-8 14-56z",
  hat: "M44 116c0-40 20-62 56-62s56 22 56 62z M26 120h148v10H26z",
  tumbler: "M62 40h76l-10 130a8 8 0 0 1-8 7H80a8 8 0 0 1-8-7z",
  tote: "M48 82h104l8 96H40z",
  card: "M44 56h112a10 10 0 0 1 10 10v68a10 10 0 0 1-10 10H44a10 10 0 0 1-10-10V66a10 10 0 0 1 10-10z",
  umbrella:
    "M18 110C18 56 64 28 100 28s82 28 82 82c-14-12-27-12-41 0-14-12-27-12-41 0-14-12-27-12-41 0-14-12-27-12-41 0z",
};

// slug, outline, garment colour, print colour, has a back photo?
const PRODUCTS = [
  { slug: "classic-hoodie", shape: "hoodie", color: "#0e6b3c", ink: "#f5b82e" },
  { slug: "tee-navy", shape: "tee", color: "#10244a", ink: "#f5b82e" },
  { slug: "tee-cream", shape: "tee", color: "#f7e6bb", ink: "#0e6b3c" },
  { slug: "long-sleeve", shape: "tee", color: "#f5b82e", ink: "#10244a" },
  { slug: "zip-hoodie", shape: "hoodie", color: "#0a4f2d", ink: "#f5b82e" },
  { slug: "beanie", shape: "hat", color: "#f5b82e", ink: "#10244a" },
  { slug: "trucker-cap", shape: "hat", color: "#10244a", ink: "#ffffff" },
  { slug: "keychain", shape: "card", color: "#f5b82e", ink: "#10244a" },
  { slug: "umbrella", shape: "umbrella", color: "#0e6b3c", ink: "#f5b82e" },
  { slug: "tumbler", shape: "tumbler", color: "#10244a", ink: "#f5b82e" },
  { slug: "tote-bag", shape: "tote", color: "#f7e6bb", ink: "#0e6b3c" },
  { slug: "lanyard", shape: "card", color: "#0e6b3c", ink: "#f5b82e" },
  { slug: "id-holder", shape: "card", color: "#10244a", ink: "#ffffff" },
  { slug: "notebook-set", shape: "card", color: "#ffffff", ink: "#0e6b3c" },
  { slug: "pen-set", shape: "card", color: "#d3e2fb", ink: "#10244a" },
  { slug: "pencil-case", shape: "card", color: "#0a4f2d", ink: "#ffffff" },
];

// Where each item sits on the bundle photo, in percent.
// Keep these in sync with the pins in src/data/seed-collections.ts.
const BUNDLES = [
  {
    slug: "campus-classics",
    items: [
      { slug: "classic-hoodie", x: 28, y: 35 },
      { slug: "tee-navy", x: 72, y: 33 },
      { slug: "tee-cream", x: 30, y: 72 },
      { slug: "long-sleeve", x: 70, y: 70 },
    ],
  },
  {
    slug: "benedicite",
    items: [
      { slug: "zip-hoodie", x: 25, y: 50 },
      { slug: "beanie", x: 52, y: 50 },
      { slug: "trucker-cap", x: 78, y: 50 },
    ],
  },
];

/** Draws one item as SVG elements on a 200 x 200 canvas. */
function drawItem(product, side) {
  const lines = [`<path d="${SHAPES[product.shape]}" fill="${product.color}" stroke="#10244a33" stroke-width="1.5"/>`];

  if (product.shape === "umbrella") {
    lines.push(`<path d="M100 110v52a13 13 0 0 1-26 0" fill="none" stroke="${product.ink}" stroke-width="7" stroke-linecap="round"/>`);
    return lines.join("");
  }

  const label = side === "back" ? "HNU MERCH" : "HNU";
  const fontSize = side === "back" ? 16 : 28;
  const y = product.shape === "hat" ? 100 : 112;

  lines.push(
    `<text x="100" y="${y}" text-anchor="middle" font-family="Impact, Arial Black, sans-serif" font-size="${fontSize}" fill="${product.ink}" letter-spacing="2">${label}</text>`,
  );

  return lines.join("");
}

function writeFile(relativePath, contents) {
  const filePath = path.join("public", relativePath);
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, contents);
}

function productSvg(product, side) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="${BACKGROUND}"/>${drawItem(product, side)}</svg>`;
}

for (const product of PRODUCTS) {
  writeFile(`products/${product.slug}/image.svg`, productSvg(product, "front"));
}

const BUNDLE_WIDTH = 800;
const BUNDLE_HEIGHT = 600;
const ITEM_SCALE = 0.95; // 200 x 0.95 = 190 pixels wide

for (const bundle of BUNDLES) {
  const items = bundle.items
    .map((item) => {
      const product = PRODUCTS.find((entry) => entry.slug === item.slug);
      const centerX = (item.x / 100) * BUNDLE_WIDTH;
      const centerY = (item.y / 100) * BUNDLE_HEIGHT;
      const offset = (200 * ITEM_SCALE) / 2;
      return `<g transform="translate(${centerX - offset} ${centerY - offset}) scale(${ITEM_SCALE})">${drawItem(product, "front")}</g>`;
    })
    .join("");

  writeFile(
    `collections/${bundle.slug}/bundle.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BUNDLE_WIDTH} ${BUNDLE_HEIGHT}"><rect width="${BUNDLE_WIDTH}" height="${BUNDLE_HEIGHT}" fill="${BACKGROUND}"/>${items}</svg>`,
  );
}

console.log("Placeholder images created in /public.");
