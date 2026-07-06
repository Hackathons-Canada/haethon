import type { CSSProperties } from "react";

type GeoPoint = {
  lat: number;
  lng: number;
  label?: string;
};

export type WorldMapDot = {
  start: GeoPoint;
  end: GeoPoint;
};

type ProjectedPoint = {
  x: number;
  y: number;
};

type WorldMapProps = {
  className?: string;
  dots: WorldMapDot[];
  markerColor?: string;
};

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 500;
const DOT_SPACING = 12;

type DotArea = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotation?: number;
};

type MapDot = ProjectedPoint & {
  opacity: number;
  radius: number;
};

type SymbolDot = MapDot & {
  color: string;
  label: string;
};

type DotStyle = CSSProperties & {
  "--beep-delay": string;
  "--beep-end": string;
  "--beep-start": string;
  "--dot-opacity": number;
};

type SymbolStyle = CSSProperties & {
  "--symbol-delay": string;
};

const landMassPaths = [
  "M58 121C87 78 154 57 215 76C239 83 240 104 214 116C177 133 131 141 98 174C74 197 37 164 58 121Z",
  "M313 65C351 45 412 52 429 82C443 107 405 122 366 116C329 110 287 90 313 65Z",
  "M142 146C167 105 220 83 278 97C311 105 322 130 360 135C387 139 413 156 408 184C402 214 361 203 337 220C313 237 303 267 266 273C230 279 220 242 183 245C148 248 116 225 112 190C109 171 126 162 142 146Z",
  "M279 242C298 246 316 260 327 281C302 282 282 272 272 255C269 250 272 244 279 242Z",
  "M329 273C367 282 392 318 385 360C381 388 361 410 354 441C348 467 326 473 311 449C300 431 306 405 291 382C274 357 266 330 279 304C288 286 309 269 329 273Z",
  "M512 142C558 113 643 110 706 133C747 148 774 137 820 154C870 173 921 184 941 220C956 247 924 269 882 258C842 248 816 268 777 276C730 286 702 259 677 235C647 207 611 222 581 242C551 262 511 248 515 216C518 191 478 194 464 177C450 160 477 145 512 142Z",
  "M548 233C586 213 636 229 657 267C682 311 655 357 640 393C629 421 598 420 579 392C559 362 523 345 520 304C517 273 528 244 548 233Z",
  "M668 356C679 371 674 398 659 414C647 396 651 372 668 356Z",
  "M784 341C827 326 878 337 905 366C923 386 900 412 861 414C817 417 772 399 759 371C753 358 763 348 784 341Z",
  "M905 224C919 233 920 251 907 264C895 250 893 235 905 224Z",
  "M448 174C458 166 472 168 480 178C469 187 453 186 448 174Z",
];

const landDotAreas: DotArea[] = [
  { cx: 118, cy: 131, rx: 54, ry: 34, rotation: -19 },
  { cx: 236, cy: 121, rx: 144, ry: 72, rotation: 2 },
  { cx: 214, cy: 198, rx: 92, ry: 64, rotation: 12 },
  { cx: 315, cy: 205, rx: 86, ry: 58, rotation: -8 },
  { cx: 253, cy: 260, rx: 78, ry: 27, rotation: 20 },
  { cx: 333, cy: 292, rx: 60, ry: 15, rotation: 18 },
  { cx: 369, cy: 78, rx: 62, ry: 35, rotation: -9 },
  { cx: 381, cy: 252, rx: 32, ry: 9, rotation: -5 },
  { cx: 391, cy: 322, rx: 67, ry: 60, rotation: -25 },
  { cx: 421, cy: 393, rx: 47, ry: 94, rotation: 2 },
  { cx: 493, cy: 158, rx: 19, ry: 22, rotation: -15 },
  { cx: 535, cy: 172, rx: 74, ry: 48, rotation: -8 },
  { cx: 554, cy: 108, rx: 40, ry: 52, rotation: 15 },
  { cx: 548, cy: 252, rx: 86, ry: 49, rotation: 5 },
  { cx: 586, cy: 322, rx: 81, ry: 91, rotation: -8 },
  { cx: 613, cy: 400, rx: 43, ry: 55, rotation: 12 },
  { cx: 680, cy: 398, rx: 12, ry: 32, rotation: -15 },
  { cx: 641, cy: 232, rx: 55, ry: 33, rotation: 15 },
  { cx: 704, cy: 168, rx: 166, ry: 70, rotation: 2 },
  { cx: 744, cy: 118, rx: 194, ry: 58, rotation: 2 },
  { cx: 700, cy: 282, rx: 45, ry: 55, rotation: -8 },
  { cx: 790, cy: 239, rx: 105, ry: 68, rotation: -4 },
  { cx: 818, cy: 306, rx: 82, ry: 35, rotation: 12 },
  { cx: 902, cy: 226, rx: 23, ry: 46, rotation: -28 },
  { cx: 844, cy: 354, rx: 116, ry: 19, rotation: 4 },
  { cx: 848, cy: 407, rx: 76, ry: 45, rotation: -8 },
  { cx: 933, cy: 438, rx: 24, ry: 11, rotation: -25 },
];

const waterCutouts: DotArea[] = [
  { cx: 275, cy: 151, rx: 43, ry: 33, rotation: -8 },
  { cx: 314, cy: 246, rx: 38, ry: 21, rotation: -12 },
  { cx: 221, cy: 158, rx: 28, ry: 20, rotation: 18 },
  { cx: 579, cy: 210, rx: 50, ry: 10, rotation: 2 },
  { cx: 659, cy: 186, rx: 45, ry: 18, rotation: -4 },
  { cx: 733, cy: 205, rx: 48, ry: 17, rotation: 7 },
  { cx: 752, cy: 316, rx: 30, ry: 18, rotation: -18 },
  { cx: 885, cy: 310, rx: 36, ry: 18, rotation: 5 },
];

function projectPoint(point: GeoPoint): ProjectedPoint {
  return {
    x: ((point.lng + 180) / 360) * MAP_WIDTH,
    y: ((90 - point.lat) / 180) * MAP_HEIGHT,
  };
}

function getMarkerKey(point: GeoPoint) {
  return `${point.lat.toFixed(4)},${point.lng.toFixed(4)}`;
}

function isInArea(x: number, y: number, area: DotArea) {
  const rotation = ((area.rotation ?? 0) * Math.PI) / 180;
  const dx = x - area.cx;
  const dy = y - area.cy;
  const rotatedX = dx * Math.cos(rotation) + dy * Math.sin(rotation);
  const rotatedY = -dx * Math.sin(rotation) + dy * Math.cos(rotation);

  return (
    (rotatedX * rotatedX) / (area.rx * area.rx) +
      (rotatedY * rotatedY) / (area.ry * area.ry) <=
    1
  );
}

function createLandDots(): MapDot[] {
  const mapDots: MapDot[] = [];

  for (let y = 50; y <= 452; y += DOT_SPACING) {
    for (let x = 58; x <= 946; x += DOT_SPACING) {
      const onLand = landDotAreas.some((area) => isInArea(x, y, area));
      const onWater = waterCutouts.some((area) => isInArea(x, y, area));

      if (!onLand || onWater) {
        continue;
      }

      const seed = (x * 13 + y * 7) % 17;

      mapDots.push({
        opacity: 0.22 + (seed % 4) * 0.025,
        radius: seed % 5 === 0 ? 1.85 : 1.6,
        x,
        y,
      });
    }
  }

  return mapDots;
}

const landDots = createLandDots();

const symbolLabels = ["AI", "API", "ML", "UX", "3D", "{ }", "</>", "DB"];
const symbolColors = ["#660000", "#B45309", "#2563EB", "#047857", "#7C3AED"];

const symbolDots: SymbolDot[] = landDots
  .filter((dot, index) => {
    const clusteredHotspot =
      (dot.x > 150 && dot.x < 275 && dot.y > 150 && dot.y < 235) ||
      (dot.x > 510 && dot.x < 630 && dot.y > 145 && dot.y < 245) ||
      (dot.x > 735 && dot.x < 860 && dot.y > 160 && dot.y < 265) ||
      (dot.x > 770 && dot.x < 900 && dot.y > 350 && dot.y < 425);

    return clusteredHotspot ? index % 17 === 0 : index % 113 === 0;
  })
  .slice(0, 42)
  .map((dot, index) => ({
    ...dot,
    color: symbolColors[index % symbolColors.length],
    label: symbolLabels[index % symbolLabels.length],
  }));

function createDotStyle(dot: MapDot, index: number): DotStyle {
  const sweep = Math.round(((dot.x / MAP_WIDTH) * 42 + (dot.y / MAP_HEIGHT) * 18) % 54);

  return {
    "--beep-delay": `${(index % 90) * 18}ms`,
    "--beep-end": `${Math.min(sweep + 22, 76)}%`,
    "--beep-start": `${Math.max(sweep - 6, 0)}%`,
    "--dot-opacity": dot.opacity,
  };
}

function createSymbolStyle(index: number): SymbolStyle {
  return {
    "--symbol-delay": `${(index % 14) * 0.28}s`,
  };
}

export default function WorldMap({
  className = "",
  dots,
  markerColor = "#660000",
}: WorldMapProps) {
  const markers = Array.from(
    new Map(
      dots.flatMap((dot) =>
        [dot.start, dot.end].map((point) => [getMarkerKey(point), projectPoint(point)])
      )
    ).values()
  );

  return (
    <div
      className={`world-map-image relative aspect-[2/1] w-full overflow-hidden ${className}`}
    >
      <div className="absolute inset-x-[10%] top-[10%] h-[34%] rounded-full bg-[#660000]/[0.08] blur-3xl" />
      <svg
        aria-label="Flat dotted world map with changing hackathon symbols and animated location points"
        className="relative z-10 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      >
        <defs>
          <mask id="world-map-land-mask">
            <rect fill="black" height={MAP_HEIGHT} width={MAP_WIDTH} />
            {landMassPaths.map((path) => (
              <path d={path} fill="white" key={path} />
            ))}
          </mask>
        </defs>

        <ellipse
          cx="500"
          cy="250"
          fill="#F8F8F4"
          fillOpacity="0.66"
          rx="468"
          ry="213"
        />
        <ellipse
          cx="500"
          cy="250"
          fill="none"
          rx="468"
          ry="213"
          stroke="#3F3E3B"
          strokeOpacity="0.08"
          strokeWidth="1.5"
        />
        <path
          d="M70 250H930"
          stroke="#3F3E3B"
          strokeDasharray="4 14"
          strokeLinecap="round"
          strokeOpacity="0.09"
        />
        <path
          d="M112 185C298 218 704 218 888 185"
          fill="none"
          stroke="#3F3E3B"
          strokeDasharray="4 14"
          strokeLinecap="round"
          strokeOpacity="0.08"
        />
        <path
          d="M112 315C298 282 704 282 888 315"
          fill="none"
          stroke="#3F3E3B"
          strokeDasharray="4 14"
          strokeLinecap="round"
          strokeOpacity="0.08"
        />

        <g aria-hidden="true" mask="url(#world-map-land-mask)">
          {landMassPaths.map((path) => (
            <path
              d={path}
              fill="#3F3E3B"
              fillOpacity="0.018"
              key={`shadow-${path}`}
            />
          ))}
        </g>

        <g aria-hidden="true">
          {landDots.map((dot, index) => (
            <circle
              className="world-map-land-dot"
              cx={dot.x}
              cy={dot.y}
              fill="#3F3E3B"
              key={`${dot.x}-${dot.y}`}
              r={dot.radius}
              style={createDotStyle(dot, index)}
            />
          ))}
        </g>

        <g aria-hidden="true">
          {symbolDots.map((dot, index) => (
            <g
              className="world-map-symbol-dot"
              key={`symbol-${dot.x}-${dot.y}`}
              style={createSymbolStyle(index)}
            >
              <circle
                cx={dot.x}
                cy={dot.y}
                fill="#FFFFFF"
                r="9.5"
                stroke={dot.color}
                strokeOpacity="0.24"
                strokeWidth="1.5"
              />
              <circle cx={dot.x} cy={dot.y} fill={dot.color} r="2.1" />
              <text
                aria-hidden="true"
                dominantBaseline="middle"
                fill={dot.color}
                fontFamily="var(--font-plex-mono), monospace"
                fontSize="8.5"
                fontWeight="700"
                textAnchor="middle"
                x={dot.x}
                y={dot.y + 0.3}
              >
                {dot.label}
              </text>
            </g>
          ))}
        </g>

        {markers.map((marker, index) => (
          <g key={`${marker.x}-${marker.y}`}>
            <circle
              className="world-map-location-ring"
              cx={marker.x}
              cy={marker.y}
              fill="none"
              r="8"
              stroke={markerColor}
              strokeOpacity="0.34"
              strokeWidth="2"
              style={{ animationDelay: `${index * 0.16}s` }}
            />
            <circle
              className="world-map-location-dot"
              cx={marker.x}
              cy={marker.y}
              fill="#F8F8F4"
              r="5"
              stroke={markerColor}
              strokeWidth="2.2"
              style={{ animationDelay: `${index * 0.16}s` }}
            />
            <circle
              className="world-map-location-core"
              cx={marker.x}
              cy={marker.y}
              fill={markerColor}
              r="2.4"
              style={{ animationDelay: `${index * 0.16}s` }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
