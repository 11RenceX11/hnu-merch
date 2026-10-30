/**
 * A row of round hills, inspired by the Chocolate Hills of Bohol.
 * It is a decorative divider between page sections.
 */

const VIEWBOX_WIDTH = 1200;
const BASELINE = 80;

/** Width and height of each hill. The list repeats across the page. */
const BACK_HILLS: [number, number][] = [[110, 52], [160, 60], [90, 40], [140, 56]];
const FRONT_HILLS: [number, number][] = [[130, 40], [90, 28], [150, 46], [100, 32], [120, 38]];

/** Builds an SVG path of round hills that covers the full width. */
function buildHillsPath(hills: [number, number][], startX: number): string {
  let x = startX;
  let hillIndex = 0;
  let path = `M${startX} ${BASELINE}`;

  while (x < VIEWBOX_WIDTH + 40) {
    const [width, height] = hills[hillIndex % hills.length];

    // A curve from the ground up to the hilltop and back down.
    path += ` Q${x + width / 2} ${BASELINE - height * 2} ${x + width} ${BASELINE}`;

    x += width;
    hillIndex += 1;
  }

  return `${path} L${x} ${BASELINE} Z`;
}

const BACK_PATH = buildHillsPath(BACK_HILLS, -40);
const FRONT_PATH = buildHillsPath(FRONT_HILLS, -20);

/** @param backgroundClass The background colour of the section above, for example "bg-mist". */
export function HillsDivider({ backgroundClass }: { backgroundClass: string }) {
  return (
    <div className={backgroundClass}>
      <svg
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${BASELINE}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        className="block h-12 w-full md:h-20"
      >
        <path d={BACK_PATH} className="fill-leaf" />
        <path d={FRONT_PATH} className="fill-brand" />
      </svg>
    </div>
  );
}
