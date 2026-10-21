import { WeatherBarContent } from "@/components/weather/weather-bar-content";
import { getSessionUser } from "@/lib/dal";
import { getPurchasedProductSlugs } from "@/lib/orders";
import { listProducts } from "@/lib/products";
import { getWeatherSnapshot } from "@/lib/weather";

/**
 * Server Component. It loads the real forecast and shows it in a bar at the top
 * of every page. When rain is expected today, tomorrow or this weekend, the bar
 * turns into a friendly umbrella reminder. If the logged-in collector already
 * bought an umbrella from the shop, the reminder says so instead of asking.
 */
export async function WeatherBar() {
  const snapshot = await getWeatherSnapshot();

  let hasShopUmbrella = false;

  if (snapshot?.rainNotice) {
    const user = await getSessionUser();

    if (user) {
      const [purchasedSlugs, products] = await Promise.all([
        getPurchasedProductSlugs(user.id),
        listProducts(),
      ]);

      hasShopUmbrella = products.some(
        (product) => purchasedSlugs.has(product.slug) && product.categorySlugs.includes("umbrellas"),
      );
    }
  }

  return <WeatherBarContent snapshot={snapshot} hasShopUmbrella={hasShopUmbrella} />;
}
