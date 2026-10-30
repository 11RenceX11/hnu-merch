import Link from "next/link";
import { logout } from "@/actions/auth";
import { CartButton } from "@/components/cart/cart-button";
import { siteConfig } from "@/data/site";
import { getSessionUser } from "@/lib/dal";

const navLinkClass = "link-grow text-sm font-bold uppercase tracking-wide hover:text-brand";

/** Server Component: it reads the login cookie, so it can show Log in or the account name. */
export async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-3">
        <Link href="/" className="group flex items-center gap-2" aria-label={`${siteConfig.name} home`}>
          <span className="inline-block -rotate-3 rounded-xl border-2 border-ink bg-brand px-2 py-0.5 font-display text-3xl leading-none text-white hard-shadow transition group-hover:rotate-0">
            HNU
          </span>
          <span className="font-display text-3xl leading-none">Merch</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href="/shop" className={navLinkClass}>
            Shop
          </Link>
          <Link href="/collections" className={navLinkClass}>
            Collections
          </Link>
          <Link href="/help" className={navLinkClass}>
            Help
          </Link>

          {user?.role === "admin" && (
            <Link href="/admin" className="sticker bg-gold text-xs">
              Admin
            </Link>
          )}

          {user ? (
            <>
              <Link href="/account" className={navLinkClass}>
                {user.name.split(" ")[0]}
              </Link>
              <form action={logout}>
                <button type="submit" className={navLinkClass}>
                  Log out
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className={navLinkClass}>
              Log in
            </Link>
          )}

          <CartButton />
        </nav>
      </div>
    </header>
  );
}
