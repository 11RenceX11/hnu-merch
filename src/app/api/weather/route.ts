import { NextResponse } from "next/server";
import { getWeatherSnapshot } from "@/lib/weather";

/**
 * Shows the exact weather data the shop uses, so anyone can check it against
 * another weather app. Open http://localhost:3000/api/weather in the browser.
 *
 * The data comes live from the Open-Meteo forecast API (https://open-meteo.com).
 * Nothing here is hard coded except the campus location in src/data/campus.ts.
 */
export async function GET() {
  const snapshot = await getWeatherSnapshot();

  if (!snapshot) {
    return NextResponse.json({ error: "The weather service could not be reached." }, { status: 502 });
  }

  return NextResponse.json({ source: "Open-Meteo", ...snapshot });
}
