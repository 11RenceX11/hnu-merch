import type { Metadata } from "next";
import Link from "next/link";
import { removeSale, toggleSalePaused } from "@/actions/admin-sales";
import { SaleStatusBadge } from "@/components/admin/sale-status-badge";
import { SalesCalendar } from "@/components/admin/sales-calendar";
import { listCollections } from "@/lib/collections";
import { requireAdmin } from "@/lib/dal";
import { formatIsoDate, getTodayAtCampus } from "@/lib/dates";
import { describeSaleScope, getSaleStatus } from "@/lib/sale-rules";
import { listSales } from "@/lib/sales";

export const metadata: Metadata = { title: "Admin: Sales calendar" };

type SalesPageProps = {
  // For example /admin/sales?month=2026-11
  searchParams: Promise<{ month?: string }>;
};

export default async function AdminSalesPage({ searchParams }: SalesPageProps) {
  await requireAdmin();

  const { month: monthParam } = await searchParams;
  const today = getTodayAtCampus();

  // Show the month from the address, or the current month.
  const isValidMonthParam = monthParam !== undefined && /^\d{4}-(0[1-9]|1[0-2])$/.test(monthParam);
  const [year, month] = (isValidMonthParam ? monthParam : today.slice(0, 7)).split("-").map(Number);

  const [sales, collections] = await Promise.all([listSales(), listCollections()]);
  const collectionNames = new Map(collections.map((collection) => [collection.slug, collection.name]));

  const sortedSales = [...sales].sort((a, b) => b.startDate.localeCompare(a.startDate));

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-5xl">Sales calendar</h1>
        <Link href="/admin/sales/new" className="rounded-xl bg-brand px-5 py-3 font-semibold text-white">
          + Schedule a sale
        </Link>
      </div>
      <p className="mb-8 mt-2 max-w-2xl text-ink/70">
        Put a sale on the calendar and it starts and ends by itself. Click a day to start a sale on
        that date. You can also pause a sale by hand at any time.
      </p>

      <SalesCalendar year={year} month={month} sales={sales} today={today} />

      <h2 className="mt-14 font-display text-3xl">All sales</h2>

      {sortedSales.length === 0 ? (
        <p className="mt-4 text-ink/70">No sales yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {sortedSales.map((sale) => {
            const status = getSaleStatus(sale, today);

            return (
              <li key={sale.id} className="flex flex-wrap items-center justify-between gap-3 bg-mist p-4">
                <div>
                  <p className="font-semibold">
                    {sale.name} · {sale.discountPercent}% off
                  </p>
                  <p className="text-sm text-ink/70">
                    {formatIsoDate(sale.startDate)} to {formatIsoDate(sale.endDate)} ·{" "}
                    {describeSaleScope(sale, collectionNames)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <SaleStatusBadge status={status} />

                  {/* The manual switch. */}
                  <form action={toggleSalePaused}>
                    <input type="hidden" name="saleId" value={sale.id} />
                    <button type="submit" className="border border-ink/40 px-3 py-1 text-sm">
                      {sale.isPaused ? "Resume" : "Pause"}
                    </button>
                  </form>

                  <Link href={`/admin/sales/${sale.id}/edit`} className="underline">
                    Edit
                  </Link>

                  <form action={removeSale}>
                    <input type="hidden" name="saleId" value={sale.id} />
                    <button type="submit" className="text-sm text-ink/60 underline">
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
