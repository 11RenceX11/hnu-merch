import Link from "next/link";
import { NewsletterForm } from "@/components/layout/newsletter-form";
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
      <section className="border-y-2 border-ink bg-sun">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-5 py-12">
          <div>
            <h2 className="font-display text-5xl uppercase leading-none md:text-6xl">Never miss a drop</h2>
            <p className="mt-2 max-w-sm font-medium">New collections sell out fast. Get the email the moment one goes live.</p>
          </div>
          <NewsletterForm />
        </div>
      </section>

      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-8 px-5 py-10 text-sm">
        <div>
          <p className="font-display text-3xl uppercase">{siteConfig.name}</p>
          <p className="mt-1 text-ink/60">{siteConfig.pickupNote}.</p>
        </div>

        <nav aria-label="Help and support">
          <p className="font-bold uppercase">Help and support</p>
          <ul className="mt-2 space-y-1">
            {HELP_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-blood">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="max-w-xs text-ink/60">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
          {isTestMode() && <p className="mt-1">Demo shop: payments use PayMongo test mode. No real money is charged.</p>}
        </div>
      </div>
    </footer>
  );
}
