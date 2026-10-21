import { campus } from "@/data/campus";

/**
 * Date helpers. Dates are plain "YYYY-MM-DD" strings in the campus time zone,
 * so a sale that starts "on the 24th" starts on the 24th in Bohol,
 * wherever the server runs. These strings sort correctly as text.
 */

/** Today's date at the campus, for example "2026-10-20". */
export function getTodayAtCampus(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: campus.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

/** "2026-10-24" -> "Oct 24, 2026" */
export function formatIsoDate(value: string): string {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Builds "YYYY-MM-DD" from numbers. `month` is 1 to 12. */
export function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * The calendar grid for one month: a list of weeks (Sunday first),
 * each with 7 cells. A cell is an ISO date, or null for the empty days
 * before the 1st and after the last day.
 */
export function getMonthGrid(year: number, month: number): (string | null)[][] {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay(); // 0 = Sunday
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const cells: (string | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => toIsoDate(year, month, index + 1)),
  ];

  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (string | null)[][] = [];
  for (let start = 0; start < cells.length; start += 7) {
    weeks.push(cells.slice(start, start + 7));
  }

  return weeks;
}

/** Moves a "YYYY-MM" month by `offset` months. */
export function shiftMonth(year: number, month: number, offset: number) {
  const date = new Date(Date.UTC(year, month - 1 + offset, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

export function formatMonthTitle(year: number, month: number): string {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
