import type { Metadata } from "next";
import Link from "next/link";
import { getTodayAtCampus } from "@/lib/dates";
import { requireAdmin } from "@/lib/dal";
import { listAllOrders } from "@/lib/orders";
import { listProducts } from "@/lib/products";
import { getSaleStatus } from "@/lib/sale-rules";
import { listSales } from "@/lib/sales";
import { formatPeso } from "@/lib/format";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  const [products, sales, orders] = await Promise.all([listProducts(), listSales(), listAllOrders()]);
  const today = getTodayAtCampus();

  const paidOrders = orders.filter((order) => order.status === "paid");
  const revenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
  const activeSales = sales.filter((sale) => getSaleStatus(sale, today) === "active").length;
  const scheduledSales = sales.filter((sale) => getSaleStatus(sale, today) === "scheduled").length;

  const stats = [
    { label: "Products", value: products.length, href: "/admin/products" },
    { label: "Sales running now", value: activeSales, href: "/admin/sales" },
    { label: "Sales scheduled", value: scheduledSales, href: "/admin/sales" },
    { label: "Paid orders", value: paidOrders.length, href: "/admin/orders" },
    { label: "Demo revenue", value: formatPeso(revenue), href: "/admin/orders" },
  ];

  return (
    <>
      <h1 className="font-display text-5xl uppercase">Welcome, {admin.name}</h1>

      <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
        {stats.map((stat) => (
          <li key={stat.label}>
            <Link href={stat.href} className="block bg-mist p-4 hover:outline hover:outline-1 hover:outline-blood">
              <span className="block font-display text-3xl">{stat.value}</span>
              <span className="text-xs text-ink/60">{stat.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/admin/products/new" className="bg-blood px-5 py-3 font-semibold text-white">
          + Add a product
        </Link>
        <Link href="/admin/collections/new" className="border border-ink/40 px-5 py-3 font-semibold">
          + Add a collection
        </Link>
        <Link href="/admin/sales/new" className="border border-ink/40 px-5 py-3 font-semibold">
          + Schedule a sale
        </Link>
      </div>
    </>
  );
}
