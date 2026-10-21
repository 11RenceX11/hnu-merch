import type { Metadata } from "next";
import { requireAdmin } from "@/lib/dal";
import { formatPeso } from "@/lib/format";
import { listAllOrders } from "@/lib/orders";

export const metadata: Metadata = { title: "Admin: Orders" };

export default async function AdminOrdersPage() {
  await requireAdmin();

  const orders = await listAllOrders();

  return (
    <>
      <h1 className="font-display text-5xl uppercase">Orders</h1>

      {orders.length === 0 ? (
        <p className="mt-6 text-ink/70">No orders yet.</p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="text-ink/60">
              <tr>
                <th className="p-2">Reference</th>
                <th className="p-2">Customer</th>
                <th className="p-2">Items</th>
                <th className="p-2">Total</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.reference} className="border-t border-ink/15 align-top">
                  <td className="p-2 font-semibold">{order.reference}</td>
                  <td className="p-2">
                    {order.customerName}
                    <span className="block text-xs text-ink/60">{order.customerEmail}</span>
                  </td>
                  <td className="p-2 text-ink/70">
                    {order.items.map((item) => `${item.quantity}× ${item.productName} (${item.size})`).join(", ")}
                  </td>
                  <td className="p-2">{formatPeso(order.total)}</td>
                  <td className={`p-2 ${order.status === "paid" ? "text-blood" : "text-ink/60"}`}>
                    {order.status.replace("_", " ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
