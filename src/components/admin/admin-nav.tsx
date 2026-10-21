import Link from "next/link";

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/sales", label: "Sales calendar" },
  { href: "/admin/orders", label: "Orders" },
];

export function AdminNav() {
  return (
    <nav aria-label="Admin" className="flex flex-wrap gap-2 border-b border-ink/15 pb-4">
      {ADMIN_LINKS.map((link) => (
        <Link key={link.href} href={link.href} className="border border-ink/30 px-4 py-2 text-sm hover:border-blood">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
