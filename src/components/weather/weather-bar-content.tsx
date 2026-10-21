"use client";

import Link from "next/link";
import { WeatherIcon } from "@/components/weather/weather-icon";
import { useLocalStorage } from "@/lib/use-local-storage";
import type { RainNotice, WeatherSnapshot } from "@/lib/weather";

type WeatherBarContentProps = {
  /** Null when the weather service could not be reached. */
  snapshot: WeatherSnapshot | null;
  /** True when the collector already bought an umbrella from the shop. */
  hasShopUmbrella: boolean;
};

function describeWhen(notice: RainNotice): string {
  if (notice.when === "today") return "today";
  if (notice.when === "tomorrow") return `tomorrow (${notice.dateLabel})`;
  return `this weekend (${notice.dateLabel})`;
}

export function WeatherBarContent({ snapshot, hasShopUmbrella }: WeatherBarContentProps) {
  const rainNotice = snapshot?.rainNotice ?? null;

  // The answer to "do you have an umbrella?" is remembered for that rainy day.
  // While the page hydrates the value is "loading", so the buttons never flash.
  const [answer, setAnswer] = useLocalStorage(`umbrella-answer-${rainNotice?.date ?? "none"}`, "", "loading");

  if (!snapshot) {
    return (
      <div role="status" className="bg-ink px-5 py-2 text-center text-xs text-paper/70">
        The weather forecast is not available right now.
      </div>
    );
  }

  const isAskingQuestion = rainNotice !== null && !hasShopUmbrella && answer === "";

  return (
    <div
      role="status"
      className={`border-b-2 border-ink ${isAskingQuestion ? "bg-sun text-ink" : "bg-ink text-paper"}`}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-1 px-5 py-2 text-sm">
        {/* What the weather is right now. */}
        <p className="flex items-center gap-2 font-semibold">
          <WeatherIcon kind={snapshot.conditionKind} />
          <span>
            HNU campus: {snapshot.temperatureNow}°C, {snapshot.conditionLabel} · {snapshot.todayRainChance}% rain today
          </span>
        </p>

        {/* What it means for the next days. */}
        <div className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-1">
          {!rainNotice && <p className="opacity-80">No rain expected today, tomorrow or this weekend.</p>}

          {rainNotice && (
            <p className="font-semibold">
              Rain reminder: rain is forecast {describeWhen(rainNotice)}, about {rainNotice.rainChance}% chance
              {rainNotice.examLabel ? `, during ${rainNotice.examLabel}` : ""}.
              {hasShopUmbrella && " You have your umbrella from the shop. Remember to bring it."}
              {isAskingQuestion && " Do you have an umbrella?"}
            </p>
          )}

          {isAskingQuestion && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAnswer("yes")}
                className="border-2 border-ink bg-ink px-3 py-0.5 text-xs font-bold text-paper"
              >
                I have one
              </button>
              <button
                type="button"
                onClick={() => setAnswer("no")}
                className="border-2 border-ink bg-paper px-3 py-0.5 text-xs font-bold text-ink"
              >
                Not yet
              </button>
            </div>
          )}

          {rainNotice && !hasShopUmbrella && answer === "yes" && <p>Great, you are ready for the rain.</p>}

          {rainNotice && !hasShopUmbrella && answer === "no" && (
            <p>
              Noted. Umbrellas are listed under{" "}
              <Link href="/shop?category=umbrellas" className="font-bold underline">
                Accessories
              </Link>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
