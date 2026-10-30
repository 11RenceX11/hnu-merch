import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { Suspense } from "react";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartProvider } from "@/components/cart/cart-provider";
import { SaleBanner } from "@/components/layout/sale-banner";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WeatherBar } from "@/components/weather/weather-bar";
import { siteConfig } from "@/data/site";
import { getStorefrontProducts } from "@/lib/catalog";
import { getSessionUser } from "@/lib/dal";
import { buildPriceList } from "@/lib/pricing";
import "./globals.css";

// next/font downloads the fonts at build time and serves them from our own domain.
// Bricolage Grotesque is a modern, friendly display font for headings.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, products] = await Promise.all([getSessionUser(), getStorefrontProducts()]);

  return (
    <html lang="en" className={`${bricolage.variable} ${inter.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <CartProvider catalog={buildPriceList(products)} isLoggedIn={user !== null}>
          {/* The weather loads on its own, so a slow forecast never delays the page. */}
          <Suspense fallback={<div className="h-10 bg-deep" />}>
            <WeatherBar />
          </Suspense>

          <Suspense fallback={null}>
            <SaleBanner />
          </Suspense>

          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
