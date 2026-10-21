import type { WeatherKind } from "@/lib/weather";

/** Small line icons for the weather bar. */
export function WeatherIcon({ kind }: { kind: WeatherKind }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === "clear" && (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </>
      )}

      {kind !== "clear" && <path d="M7 17a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17 7.5a4.5 4.5 0 0 1 0 9.5H7z" />}

      {kind === "rain" && <path d="M8 20l1-2M12 20l1-2M16 20l1-2" />}
      {kind === "storm" && <path d="M12.5 15l-2.5 4h3l-2 3.5" />}
    </svg>
  );
}
