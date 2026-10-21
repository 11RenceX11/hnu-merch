import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { requireUser } from "@/lib/dal";
import { isTestMode } from "@/lib/paymongo";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  // Only logged-in collectors can check out.
  const user = await requireUser("/checkout");

  return (
    <CheckoutForm customerName={user.name} customerEmail={user.email} isDemoPayment={isTestMode()} />
  );
}
