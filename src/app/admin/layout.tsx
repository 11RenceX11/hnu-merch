import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/dal";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Layouts do not re-render on every navigation, so every admin page and
  // Server Action also calls requireAdmin() itself.
  await requireAdmin();

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <AdminNav />
      <div className="pt-8">{children}</div>
    </div>
  );
}
