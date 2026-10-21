import type { Metadata } from "next";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Help and support",
  description: "FAQ, pickup, refunds and privacy.",
};

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="font-display text-6xl uppercase">Help and support</h1>

      <section id="faq" className="mt-12 scroll-mt-28">
        <h2 className="font-display text-3xl uppercase">FAQ and contact</h2>
        <dl className="mt-4 space-y-4">
          <div>
            <dt className="font-bold">Do I need an account to buy?</dt>
            <dd className="text-ink/75">Yes. A collector account keeps your orders and shows which pieces you already own.</dd>
          </div>
          <div>
            <dt className="font-bold">Can I buy something I already own?</dt>
            <dd className="text-ink/75">Always. Owning a piece never stops you from buying another.</dd>
          </div>
          <div>
            <dt className="font-bold">How do sales work?</dt>
            <dd className="text-ink/75">Sales start and end on their own on the dates shown. The price you see is the price you pay.</dd>
          </div>
          <div>
            <dt className="font-bold">Questions?</dt>
            <dd className="text-ink/75">
              Email{" "}
              <a href={`mailto:${siteConfig.contactEmail}`} className="font-bold underline">
                {siteConfig.contactEmail}
              </a>
              .
            </dd>
          </div>
        </dl>
      </section>

      <section id="pickup" className="mt-12 scroll-mt-28">
        <h2 className="font-display text-3xl uppercase">Pickup</h2>
        <p className="mt-3 text-ink/75">
          {siteConfig.pickupNote}. After you pay, show your order reference (it starts with HNU-) to claim your items.
        </p>
      </section>

      <section id="refunds" className="mt-12 scroll-mt-28">
        <h2 className="font-display text-3xl uppercase">Refund policy</h2>
        <p className="mt-3 text-ink/75">
          Unworn items can be exchanged or refunded within 7 days of pickup. Bring your order reference.
          (Edit this text to match your real policy.)
        </p>
      </section>

      <section id="privacy" className="mt-12 scroll-mt-28">
        <h2 className="font-display text-3xl uppercase">Privacy</h2>
        <p className="mt-3 text-ink/75">
          We keep your name, email and orders only to run your account and your purchases. Payments are handled by
          PayMongo, so we never see or store your card details.
        </p>
      </section>
    </div>
  );
}
