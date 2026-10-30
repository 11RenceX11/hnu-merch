import Link from "next/link";
import { formatMonthTitle, getMonthGrid, shiftMonth } from "@/lib/dates";
import { getSaleStatus } from "@/lib/sale-rules";
import type { Sale } from "@/types/shop";

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_SALES_SHOWN_PER_DAY = 3;

type SalesCalendarProps = {
  year: number;
  /** 1 to 12. */
  month: number;
  sales: Sale[];
  /** Today's date at the campus, "YYYY-MM-DD". */
  today: string;
};

/**
 * A month calendar. Each sale appears on every day it runs.
 * Click a day to start a new sale on that date. Click a sale to edit it.
 */
export function SalesCalendar({ year, month, sales, today }: SalesCalendarProps) {
  const weeks = getMonthGrid(year, month);
  const previous = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);

  const toMonthParam = (value: { year: number; month: number }) =>
    `/admin/sales?month=${value.year}-${String(value.month).padStart(2, "0")}`;

  return (
    <section aria-label="Sales calendar">
      <div className="mb-4 flex items-center justify-between">
        <Link href={toMonthParam(previous)} className="border border-ink/30 px-3 py-1">
          ← Previous
        </Link>
        <h2 className="font-display text-3xl">{formatMonthTitle(year, month)}</h2>
        <Link href={toMonthParam(next)} className="border border-ink/30 px-3 py-1">
          Next →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[44rem] grid-cols-7 gap-px bg-ink/15">
          {WEEKDAY_NAMES.map((name) => (
            <div key={name} className="bg-paper p-2 text-center text-xs text-ink/60">
              {name}
            </div>
          ))}

          {weeks.flat().map((date, index) => {
            if (!date) return <div key={`empty-${index}`} className="min-h-24 bg-mist/60" />;

            const salesOnThisDay = sales.filter((sale) => date >= sale.startDate && date <= sale.endDate);

            return (
              <div
                key={date}
                className={`min-h-24 bg-paper p-1 ${date === today ? "outline outline-2 -outline-offset-2 outline-brand" : ""}`}
              >
                <Link
                  href={`/admin/sales/new?start=${date}`}
                  aria-label={`Start a sale on ${date}`}
                  className="block text-xs text-ink/60 hover:text-brand"
                >
                  {Number(date.slice(8))} +
                </Link>

                <ul className="mt-1 space-y-1">
                  {salesOnThisDay.slice(0, MAX_SALES_SHOWN_PER_DAY).map((sale) => {
                    const status = getSaleStatus(sale, today);

                    return (
                      <li key={sale.id}>
                        <Link
                          href={`/admin/sales/${sale.id}/edit`}
                          className={`block truncate px-1 py-0.5 text-xs ${
                            status === "active"
                              ? "rounded-xl bg-brand text-white"
                              : status === "scheduled"
                                ? "border border-ink"
                                : "border border-ink/20 text-ink/50"
                          }`}
                        >
                          {sale.name} −{sale.discountPercent}%
                        </Link>
                      </li>
                    );
                  })}

                  {salesOnThisDay.length > MAX_SALES_SHOWN_PER_DAY && (
                    <li className="text-xs text-ink/50">
                      +{salesOnThisDay.length - MAX_SALES_SHOWN_PER_DAY} more
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-3 text-xs text-ink/60">
        Red = running now. Outlined = scheduled. Faded = paused or ended.
      </p>
    </section>
  );
}
