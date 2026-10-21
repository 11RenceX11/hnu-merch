import { campus } from "@/data/campus";

/**
 * Weather for the campus, using the Open-Meteo API
 * (free, no API key): https://open-meteo.com/en/docs
 *
 * We ask for the current conditions and the next 7 days, then look at the days
 * that matter to a student (today, tomorrow and the coming weekend) and report
 * the first rainy one.
 */

export type WeatherKind = "clear" | "cloudy" | "rain" | "storm";

export type RainWhen = "today" | "tomorrow" | "weekend";

export type RainNotice = {
  when: RainWhen;
  /** ISO date of the rainy day, for example "2026-10-24". */
  date: string;
  /** Readable date, for example "Saturday, Oct 24". */
  dateLabel: string;
  /** Chance of rain, in percent. */
  rainChance: number;
  rainMillimetres: number;
  /** Name of the exam period this day falls in, if any. */
  examLabel?: string;
};

export type WeatherSnapshot = {
  temperatureNow: number;
  conditionLabel: string;
  conditionKind: WeatherKind;
  /** Chance of rain today, in percent. */
  todayRainChance: number;
  /** The first rainy day among today, tomorrow and the weekend. Null when it stays dry. */
  rainNotice: RainNotice | null;
};

const FORECAST_DAYS = 7;
const SATURDAY = 6;
const SUNDAY = 0;

// A day counts as rainy when rain is likely AND a meaningful amount is expected.
const MIN_RAIN_CHANCE_PERCENT = 50;
const MIN_RAIN_MILLIMETRES = 1;

type OpenMeteoResponse = {
  current: { temperature_2m: number; weather_code: number };
  daily: {
    time: string[];
    precipitation_probability_max: (number | null)[];
    precipitation_sum: (number | null)[];
  };
};

/** Turns a WMO weather code (what Open-Meteo returns) into words. */
function describeWeatherCode(code: number): { label: string; kind: WeatherKind } {
  if (code === 0) return { label: "Clear sky", kind: "clear" };
  if (code === 1) return { label: "Mostly clear", kind: "clear" };
  if (code === 2) return { label: "Partly cloudy", kind: "cloudy" };
  if (code === 3) return { label: "Overcast", kind: "cloudy" };
  if (code === 45 || code === 48) return { label: "Foggy", kind: "cloudy" };
  if (code >= 51 && code <= 57) return { label: "Drizzle", kind: "rain" };
  if (code >= 61 && code <= 67) return { label: "Rain", kind: "rain" };
  if (code >= 80 && code <= 82) return { label: "Rain showers", kind: "rain" };
  if (code >= 95) return { label: "Thunderstorm", kind: "storm" };
  return { label: "Cloudy", kind: "cloudy" };
}

/** Returns the weather, or null when the weather service cannot be reached. */
export async function getWeatherSnapshot(): Promise<WeatherSnapshot | null> {
  const searchParams = new URLSearchParams({
    latitude: String(campus.latitude),
    longitude: String(campus.longitude),
    current: "temperature_2m,weather_code",
    daily: "precipitation_probability_max,precipitation_sum",
    timezone: campus.timezone,
    forecast_days: String(FORECAST_DAYS),
  });

  try {
    // Fetch results are not cached by default in Next.js. Cache this one for 30 minutes.
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${searchParams}`, {
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      console.error("Open-Meteo answered with status", response.status);
      return null;
    }

    const { current, daily }: OpenMeteoResponse = await response.json();
    const condition = describeWeatherCode(current.weather_code);

    return {
      temperatureNow: Math.round(current.temperature_2m),
      conditionLabel: condition.label,
      conditionKind: condition.kind,
      todayRainChance: daily.precipitation_probability_max[0] ?? 0,
      rainNotice: findRainNotice(daily),
    };
  } catch (error) {
    console.error("Could not load the weather", error);
    return null;
  }
}

/** Looks at today, tomorrow and weekend days, and returns the first rainy one. */
function findRainNotice(daily: OpenMeteoResponse["daily"]): RainNotice | null {
  for (let dayIndex = 0; dayIndex < daily.time.length; dayIndex++) {
    const date = daily.time[dayIndex];
    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay(); // 0 = Sunday

    const when: RainWhen | null =
      dayIndex === 0
        ? "today"
        : dayIndex === 1
          ? "tomorrow"
          : weekday === SATURDAY || weekday === SUNDAY
            ? "weekend"
            : null;

    if (!when) continue;

    const rainChance = daily.precipitation_probability_max[dayIndex] ?? 0;
    const rainMillimetres = daily.precipitation_sum[dayIndex] ?? 0;
    const isRainyDay = rainChance >= MIN_RAIN_CHANCE_PERCENT && rainMillimetres >= MIN_RAIN_MILLIMETRES;

    if (!isRainyDay) continue;

    return {
      when,
      date,
      dateLabel: new Date(`${date}T00:00:00Z`).toLocaleDateString("en-PH", {
        weekday: "long",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
      rainChance,
      rainMillimetres: Math.round(rainMillimetres),
      examLabel: campus.examPeriods.find((period) => date >= period.from && date <= period.to)?.label,
    };
  }

  return null;
}
