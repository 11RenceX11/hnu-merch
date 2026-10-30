"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { priceCart } from "@/lib/pricing";
import { useLocalStorage } from "@/lib/use-local-storage";
import type { CartLine, PriceListEntry, Quote } from "@/types/shop";

const MAX_QUANTITY_PER_LINE = 10;

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  quote: Quote;
  isLoggedIn: boolean;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isOpen: boolean) => void;
  addToCart: (productSlug: string, size: string) => void;
  changeQuantity: (productSlug: string, size: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside <CartProvider>.");
  }

  return context;
}

function parseStoredCart(json: string): CartLine[] {
  try {
    const parsed: unknown = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as CartLine[]) : [];
  } catch {
    return [];
  }
}

type CartProviderProps = {
  children: React.ReactNode;
  /** Current prices, sent from the server (with any sale already applied). */
  catalog: PriceListEntry[];
  isLoggedIn: boolean;
};

export function CartProvider({ children, catalog, isLoggedIn }: CartProviderProps) {
  // The cart lives in localStorage so it survives a page refresh.
  const [storedCart, setStoredCart] = useLocalStorage("hnu-cart", "[]");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const lines = useMemo(() => parseStoredCart(storedCart), [storedCart]);
  const priceList = useMemo(() => new Map(catalog.map((entry) => [entry.slug, entry])), [catalog]);
  const quote = useMemo(() => priceCart(lines, priceList), [lines, priceList]);

  function saveLines(nextLines: CartLine[]) {
    setStoredCart(JSON.stringify(nextLines));
  }

  function addToCart(productSlug: string, size: string) {
    const existingLine = lines.find(
      (line) => line.productSlug === productSlug && line.size === size,
    );

    if (existingLine) {
      saveLines(
        lines.map((line) =>
          line === existingLine
            ? { ...line, quantity: Math.min(MAX_QUANTITY_PER_LINE, line.quantity + 1) }
            : line,
        ),
      );
    } else {
      saveLines([...lines, { productSlug, size, quantity: 1 }]);
    }

    setIsDrawerOpen(true);
  }

  function changeQuantity(productSlug: string, size: string, quantity: number) {
    const nextLines = lines
      .map((line) =>
        line.productSlug === productSlug && line.size === size
          ? { ...line, quantity: Math.min(MAX_QUANTITY_PER_LINE, quantity) }
          : line,
      )
      .filter((line) => line.quantity > 0);

    saveLines(nextLines);
  }

  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        lines,
        itemCount,
        quote,
        isLoggedIn,
        isDrawerOpen,
        setIsDrawerOpen,
        addToCart,
        changeQuantity,
        clearCart: () => saveLines([]),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
