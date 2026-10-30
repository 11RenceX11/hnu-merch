import type { Metadata } from "next";
import { OrderStatus } from "@/components/checkout/order-status";
import { requireUser } from "@/lib/dal";

export const metadata: Metadata = { title: "Order status" };

const REFERENCE_PATTERN = /^HNU-[A-F0-9]{10}$/;

type SuccessPageProps = {
  // searchParams is a Promise in Next.js 15 and later.
  searchParams: Promise<{ reference?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  await requireUser("/account");

  const { reference } = await searchParams;

  if (!reference || !REFERENCE_PATTERN.test(reference)) {
    return <p className="px-5 py-32 text-center">We could not find that order.</p>;
  }

  return <OrderStatus reference={reference} />;
}
