import type { SaleStatus } from "@/types/shop";

const STATUS_STYLES: Record<SaleStatus, { label: string; className: string }> = {
  active: { label: "Active now", className: "bg-blood text-white" },
  scheduled: { label: "Scheduled", className: "border border-ink text-ink" },
  paused: { label: "Paused", className: "border border-ink/40 text-ink/60" },
  ended: { label: "Ended", className: "border border-ink/20 text-ink/40" },
};

export function SaleStatusBadge({ status }: { status: SaleStatus }) {
  const { label, className } = STATUS_STYLES[status];

  return <span className={`px-2 py-1 text-xs font-bold ${className}`}>{label}</span>;
}
