import Link from "next/link";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { HillsDivider } from "@/components/ui/hills-divider";
import { siteConfig } from "@/data/site";
import { isTestMode } from "@/lib/paymongo";

const HELP_LINKS = [
  { href: "/help#faq", label: "FAQ & Contact" },
  { href: "/help#pickup", label: "Pickup" },
  { href: "/help#refunds", label: "Refund policy" },
  { href: "/help#privacy", label: "Privacy" },
];

export function SiteFooter() {
  return (
    <footer className="mt-28">
      {/* Newsletter band. */}
      <section className="bg-gold">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-5 py-12">
          <div>
            <h2 className="font-display text-5xl leading-none md:text-6xl">Never miss a drop</h2>
            <p className="mt-2 max-w-sm font-medium">
              New collections sell out fast. Get the email the moment one goes live.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>

      <HillsDivider backgroundClass="bg-gold" />

      <div className="bg-brand text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-8 px-5 py-12 text-sm">
          <div>
            <p className="font-display text-4xl leading-none text-gold">Benedicite Nomini Eius</p>
            <p className="mt-2 text-white/80">Blessed be His name · Tagbilaran City, Bohol</p>
            <p className="mt-1 text-white/80">{siteConfig.pickupNote}.</p>
          </div>

          <nav aria-label="Help and support">
            <p className="font-bold uppercase">Help and support</p>
            <ul className="mt-2 space-y-1">
              {HELP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-gold">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="max-w-xs text-white/70">
            <p>
              © {new Date().getFullYear()} {siteConfig.name}
            </p>
            {isTestMode() && (
              <p className="mt-1">Demo shop: payments use PayMongo test mode. No real money is charged.</p>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
