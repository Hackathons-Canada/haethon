type MapPoint = {
  label: string;
  lat: number;
  lng: number;
};

type MapRoute = {
  start: MapPoint;
  end: MapPoint;
};

const cities = {
  toronto: { label: "Toronto", lat: 43.65, lng: -79.38 },
  sanFrancisco: { label: "San Francisco", lat: 37.77, lng: -122.42 },
  newYork: { label: "New York", lat: 40.71, lng: -74.01 },
  saoPaulo: { label: "São Paulo", lat: -23.55, lng: -46.63 },
  london: { label: "London", lat: 51.5, lng: -0.12 },
  berlin: { label: "Berlin", lat: 52.52, lng: 13.4 },
  nairobi: { label: "Nairobi", lat: -1.29, lng: 36.82 },
  bangalore: { label: "Bangalore", lat: 12.97, lng: 77.59 },
  singapore: { label: "Singapore", lat: 1.35, lng: 103.82 },
  tokyo: { label: "Tokyo", lat: 35.68, lng: 139.69 },
  sydney: { label: "Sydney", lat: -33.87, lng: 151.21 },
} satisfies Record<string, MapPoint>;

const routes: MapRoute[] = [
  { start: cities.toronto, end: cities.sanFrancisco },
  { start: cities.toronto, end: cities.newYork },
  { start: cities.toronto, end: cities.london },
  { start: cities.newYork, end: cities.saoPaulo },
  { start: cities.london, end: cities.berlin },
  { start: cities.london, end: cities.nairobi },
  { start: cities.berlin, end: cities.bangalore },
  { start: cities.bangalore, end: cities.singapore },
  { start: cities.singapore, end: cities.tokyo },
  { start: cities.tokyo, end: cities.sydney },
];

/*
 * A deliberately simplified, hand-drawn equirectangular world silhouette.
 * Keeping the geometry here makes the visual self-contained: there is no map
 * package, tile service, runtime data request, or third-party component.
 */
const landShapes = [
  // North America
  "M37 112C45 91 64 82 83 80L97 66L125 57L151 62L164 72L188 69L213 78L239 94L253 111L247 126L230 134L225 151L211 157L207 177L195 183L185 172L167 172L149 162L132 164L116 153L94 149L78 136L61 134L48 124Z",
  // Alaska and the Aleutian chain
  "M35 106L20 99L29 89L52 82L68 88L60 101Z M21 105L10 109L18 113L31 110Z",
  // Central America and the Caribbean
  "M206 176L218 180L229 191L244 198L252 211L246 217L235 207L223 204L215 191L202 185Z M252 180L272 178L286 183L272 188Z",
  // Greenland
  "M244 55L270 37L302 43L319 62L310 87L289 105L261 96L248 76Z",
  // South America
  "M258 207L278 201L302 207L329 222L344 244L340 267L329 285L324 305L309 326L295 350L281 338L275 313L260 292L253 266L242 247L245 225Z",
  // Europe and Asia
  "M350 126L365 108L389 105L406 92L434 88L456 75L489 72L515 76L538 69L567 76L593 73L620 83L648 85L672 95L702 98L729 111L747 128L738 143L716 147L705 160L685 161L674 175L648 178L632 192L608 188L592 201L572 199L557 184L539 180L523 164L505 166L489 153L471 157L452 146L432 149L415 141L398 147L382 139L365 143Z",
  // The Indian and Southeast Asian peninsulas
  "M539 178L558 183L570 205L566 230L554 245L545 221L533 204Z M613 193L631 198L641 216L655 225L648 235L632 228L623 212Z",
  // Japan, the Philippines, and Indonesia
  "M704 157L712 166L708 181L700 173Z M657 225L665 236L661 249L654 240Z M634 249L655 247L676 253L694 250L709 258L697 266L675 262L654 266L635 259Z",
  // Africa
  "M389 164L414 153L450 155L480 172L503 198L497 226L484 248L472 277L451 304L433 297L421 274L405 256L399 231L385 211L374 184Z",
  // Madagascar
  "M500 264L509 272L506 296L496 310L490 295Z",
  // United Kingdom and Ireland
  "M370 110L377 99L384 108L380 120Z M361 112L366 106L367 117Z",
  // Australia
  "M649 273L671 256L704 253L730 265L750 286L743 309L722 324L692 320L670 309L652 293Z",
  // New Zealand
  "M763 315L770 323L765 337L758 330Z M751 301L757 307L754 315L748 309Z",
];

function project(point: MapPoint) {
  return {
    x: ((point.lng + 180) / 360) * 800,
    y: ((90 - point.lat) / 180) * 400,
  };
}

function curvedPath(start: MapPoint, end: MapPoint) {
  const from = project(start);
  const to = project(end);
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const lift = Math.min(68, Math.max(22, distance * 0.22));
  const controlX = (from.x + to.x) / 2;
  const controlY = Math.max(18, Math.min(from.y, to.y) - lift);

  return `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;
}

const markers = Array.from(
  new Map(
    routes
      .flatMap(({ start, end }) => [start, end])
      .map((point) => [point.label, point]),
  ).values(),
);

export function LandingWorldMap() {
  return (
    <figure
      aria-label="World map showing active hackathon connections between cities"
      className="relative h-full w-full overflow-hidden rounded-[1.75rem] border border-ink/10 bg-white/35"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-[8%] top-[16%] h-1/2 rounded-full bg-pine/5 blur-3xl"
      />

      <svg
        aria-hidden="true"
        className="relative h-full w-full"
        viewBox="0 0 800 400"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern
            id="landing-map-dots"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="1.5"
              cy="1.5"
              r="1.05"
              fill="var(--color-ink)"
              fillOpacity="0.22"
            />
          </pattern>

          <linearGradient
            id="landing-map-route"
            x1="0"
            x2="1"
            y1="0"
            y2="0"
          >
            <stop offset="0" stopColor="var(--color-pine)" />
            <stop offset="1" stopColor="var(--color-moss)" />
          </linearGradient>

          <linearGradient
            id="landing-map-fade"
            x1="0"
            x2="0"
            y1="0"
            y2="1"
          >
            <stop offset="72%" stopColor="white" />
            <stop offset="100%" stopColor="black" />
          </linearGradient>

          <mask id="landing-map-bottom-fade">
            <rect width="800" height="400" fill="url(#landing-map-fade)" />
          </mask>
        </defs>

        <g mask="url(#landing-map-bottom-fade)">
          {landShapes.map((path) => (
            <path
              key={path}
              d={path}
              fill="url(#landing-map-dots)"
              fillRule="evenodd"
            />
          ))}
        </g>

        <g fill="none" strokeLinecap="round">
          {routes.map((route, index) => {
            const path = curvedPath(route.start, route.end);
            const routeKey = `${route.start.label}-${route.end.label}`;

            return (
              <g key={routeKey}>
                <path
                  d={path}
                  pathLength="1"
                  stroke="var(--color-pine)"
                  strokeOpacity="0.17"
                  strokeWidth="1.15"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  className="motion-reduce:hidden"
                  d={path}
                  pathLength="1"
                  stroke="url(#landing-map-route)"
                  strokeDasharray="0.14 0.86"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    begin={`${index * -0.42}s`}
                    dur={`${3.2 + (index % 3) * 0.45}s`}
                    from="1"
                    repeatCount="indefinite"
                    to="0"
                  />
                </path>
              </g>
            );
          })}
        </g>

        <g>
          {markers.map((marker, index) => {
            const point = project(marker);

            return (
              <g key={marker.label} transform={`translate(${point.x} ${point.y})`}>
                <circle
                  className="motion-reduce:hidden"
                  r="3.5"
                  fill="var(--color-moss)"
                  opacity="0.28"
                >
                  <animate
                    attributeName="r"
                    begin={`${index * -0.3}s`}
                    dur="2.4s"
                    repeatCount="indefinite"
                    values="3.5;8;3.5"
                  />
                  <animate
                    attributeName="opacity"
                    begin={`${index * -0.3}s`}
                    dur="2.4s"
                    repeatCount="indefinite"
                    values="0.35;0;0.35"
                  />
                </circle>
                <circle
                  r="2.8"
                  fill="var(--color-paper)"
                  stroke="var(--color-pine)"
                  strokeWidth="1.8"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            );
          })}
        </g>
      </svg>

      <figcaption className="sr-only">
        Animated routes connect Toronto, San Francisco, New York, São Paulo,
        London, Berlin, Nairobi, Bangalore, Singapore, Tokyo, and Sydney.
      </figcaption>
    </figure>
  );
}
