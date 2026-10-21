/**
 * Shared types for the shop.
 * Prices are whole Philippine pesos in our code and are converted to
 * centavos only when talking to PayMongo.
 */

// ---------------------------------------------------------------
// Categories
// ---------------------------------------------------------------

export type Category = {
  slug: string;
  name: string;
};

/** A group of related categories, for example "Clothing" > T-Shirts, Caps. */
export type CategoryGroup = {
  slug: string;
  name: string;
  categories: Category[];
};

// ---------------------------------------------------------------
// Photos with pins
// ---------------------------------------------------------------

/** A label pinned on a photo. Hover shows the label, click opens the linked product. */
export type Pin = {
  id: string;
  /** Horizontal position, 0 to 100 (percent from the left of the photo). */
  x: number;
  /** Vertical position, 0 to 100 (percent from the top of the photo). */
  y: number;
  /** Text shown on hover, for example "Black cap". */
  label: string;
  /** The product this pin opens. Leave empty for a label-only pin. */
  productSlug?: string;
};

// ---------------------------------------------------------------
// Products and collections
// ---------------------------------------------------------------

export type Product = {
  slug: string;
  name: string;
  description: string;
  /** Regular price in whole pesos (before any sale). */
  price: number;
  /** One or more category slugs, for example ["tumblers", "sports-essentials"]. */
  categorySlugs: string[];
  sizes: string[];
  /** "/products/..." for files in /public, or "/uploads/..." for admin uploads. */
  image: string;
  /** Pins on the product photo, for example a model wearing a tee and a cap. */
  pins: Pin[];
  /** Small label shown on the product card, for example "New". */
  badge?: string;
  /** The collection (bundle) this product belongs to, if any. */
  collectionSlug?: string;
  /** Hidden products are not shown in the shop but are kept for old orders. */
  isHidden?: boolean;
};

export type Collection = {
  slug: string;
  name: string;
  /** Short line above the name, for example "Collection 01". */
  label: string;
  description: string;
  /** Photo of the whole collection laid out (or worn) together. */
  image: string;
  pins: Pin[];
};

// ---------------------------------------------------------------
// Sales
// ---------------------------------------------------------------

/** What a sale applies to. */
export type SaleScope =
  | { type: "all" }
  | { type: "collection"; collectionSlug: string }
  | { type: "products"; productSlugs: string[] };

export type Sale = {
  id: string;
  /** Event name, for example "Foundation Day Sale". */
  name: string;
  /** 1 to 90. */
  discountPercent: number;
  /** First day of the sale, "YYYY-MM-DD" (campus time zone). */
  startDate: string;
  /** Last day of the sale, "YYYY-MM-DD", included. */
  endDate: string;
  scope: SaleScope;
  /** Manual switch. A paused sale never applies, even inside its dates. */
  isPaused: boolean;
  createdAt: string;
};

export type SaleStatus = "active" | "scheduled" | "ended" | "paused";

/** A product together with the price a customer pays right now. */
export type StorefrontProduct = Product & {
  currentPrice: number;
  /** 0 when there is no sale. */
  discountPercent: number;
  saleName?: string;
};

// ---------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------

export type UserRole = "collector" | "admin";

/** A fixed account used by the demo shop. */
export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

/** The safe version of a user that can be passed to components. */
export type SessionUser = Pick<User, "id" | "name" | "email" | "role">;

// ---------------------------------------------------------------
// Cart and orders
// ---------------------------------------------------------------

/** One product as the cart needs it. Built on the server and sent to the cart. */
export type PriceListEntry = {
  slug: string;
  name: string;
  image: string;
  sizes: string[];
  /** The price right now, with any active sale applied. */
  unitPrice: number;
};

export type CartLine = {
  productSlug: string;
  size: string;
  quantity: number;
};

export type QuotedLine = CartLine & {
  productName: string;
  productImage: string;
  unitPrice: number;
  subtotal: number;
};

export type Quote = {
  lines: QuotedLine[];
  total: number;
};

export type OrderStatus = "pending" | "paid" | "failed" | "needs_review";

export type OrderItem = {
  productSlug: string;
  productName: string;
  size: string;
  quantity: number;
  /** The price actually charged (the sale price if a sale was active). */
  unitPrice: number;
};

export type Order = {
  reference: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  checkoutSessionId?: string;
  createdAt: string;
  paidAt?: string;
};
