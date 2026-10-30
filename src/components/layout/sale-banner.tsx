import { formatIsoDate } from "@/lib/dates";
import { listCollections } from "@/lib/collections";
import { getActiveSales } from "@/lib/catalog";
import { describeSaleScope } from "@/lib/sale-rules";

/** Shows every sale that is running today. Hidden when there is none. */
export async function SaleBanner() {
  const [sales, collections] = await Promise.all([getActiveSales(), listCollections()]);

  if (sales.length === 0) return null;

  const collectionNames = new Map(collections.map((collection) => [collection.slug, collection.name]));

  return (
    <div className="border-b-2 border-ink bg-brand text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-8 gap-y-1 px-5 py-2 text-sm font-bold uppercase tracking-wide">
        {sales.map((sale) => (
          <p key={sale.id}>
            {sale.name}: {sale.discountPercent}% off · {describeSaleScope(sale, collectionNames)} · until{" "}
            {formatIsoDate(sale.endDate)}
          </p>
        ))}
      </div>
    </div>
  );
}
