import "server-only";
import { JsonStore } from "@/lib/json-store";
import type { Sale } from "@/types/shop";

type SaleData = { sales: Sale[] };

const saleStore = new JsonStore<SaleData>("sales.json", () => ({ sales: [] }));

export async function listSales(): Promise<Sale[]> {
  const { sales } = await saleStore.read();
  return sales;
}

export async function findSale(id: string): Promise<Sale | undefined> {
  const sales = await listSales();
  return sales.find((sale) => sale.id === id);
}

export function createSale(input: Omit<Sale, "id" | "createdAt" | "isPaused">): Promise<Sale> {
  return saleStore.update(({ sales }) => {
    const newSale: Sale = {
      ...input,
      id: crypto.randomUUID(),
      isPaused: false,
      createdAt: new Date().toISOString(),
    };

    sales.push(newSale);
    return newSale;
  });
}

export function updateSale(
  id: string,
  changes: Omit<Sale, "id" | "createdAt" | "isPaused">,
): Promise<boolean> {
  return saleStore.update(({ sales }) => {
    const sale = sales.find((item) => item.id === id);
    if (!sale) return false;

    Object.assign(sale, changes);
    return true;
  });
}

/** The manual switch: pause a sale or resume it. */
export function setSalePaused(id: string, isPaused: boolean): Promise<boolean> {
  return saleStore.update(({ sales }) => {
    const sale = sales.find((item) => item.id === id);
    if (!sale) return false;

    sale.isPaused = isPaused;
    return true;
  });
}

export function deleteSale(id: string): Promise<void> {
  return saleStore.update((data) => {
    data.sales = data.sales.filter((sale) => sale.id !== id);
  });
}
