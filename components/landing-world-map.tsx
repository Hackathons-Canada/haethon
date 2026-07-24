"use client";

import { useMemo } from "react";

import DottedMap from "dotted-map";

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

const markers = Array.from(
  new Map(
    routes
      .flatMap(({ start, end }) => [start, end])
      .map((point) => [point.label, point]),
  ).values(),
);

/*
 * Dots are the site ink (#1b1917) blended onto paper (#fbf7f0) at ~22% and
 * pre-flattened to a solid value: 8-digit hex alpha is unevenly supported in
 * an SVG `fill` attribute, so a flat color renders reliably over the paper
 * background instead.
 */
const DOT_COLOR = "#cac6c0";

// The dotted map is generated in its own pixel space (roughly 159x60). We
// normalise every coordinate into an 800-wide overlay so stroke widths and
// marker radii read at natural, Aceternity-like values regardless of the
// generated grid size.
const OVERLAY_WIDTH = 800;

export function LandingWorldMap() {
  const { svgMap, viewBoxHeight, projectedMarkers } = useMemo(
    () => {
      const map = new DottedMap({
        height: 60,
        grid: "diagonal",
        projection: { name: "equirectangular" },
      });

      const svg = map.getSVG({
        radius: 0.22,
        color: DOT_COLOR,
        shape: "circle",
        backgroundColor: "transparent",
      });

      const { width, height, region } = map.image;
      const scale = OVERLAY_WIDTH / width;

      // Snap each city to its nearest generated dot for pixel-perfect
      // alignment; fall back to a plain equirectangular projection if the
      // point sits outside the rendered grid.
      const project = (point: MapPoint) => {
        const pin = map.getPin({ lat: point.lat, lng: point.lng });
        const px =
          pin?.x ??
          ((point.lng - region.lng.min) /
            (region.lng.max - region.lng.min)) *
            width;
        const py =
          pin?.y ??
          ((region.lat.max - point.lat) /
            (region.lat.max - region.lat.min)) *
            height;

        return { x: px * scale, y: py * scale };
      };

      return {
        svgMap: svg,
        viewBoxHeight: height * scale,
        projectedMarkers: markers.map((marker) => ({
          label: marker.label,
          ...project(marker),
        })),
      };
    },
    [],
  );

  return (
    <figure
      aria-label="World map showing active hackathon cities"
      className="relative w-full"
      style={{ aspectRatio: `${OVERLAY_WIDTH} / ${viewBoxHeight}` }}
    >
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none h-full w-full select-none [mask-image:linear-gradient(to_bottom,transparent,#000_14%,#000_82%,transparent)]"
      />

      <svg
        aria-hidden="true"
        viewBox={`0 0 ${OVERLAY_WIDTH} ${viewBoxHeight}`}
        preserveAspectRatio="xMidYMid meet"
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
      >
        <g>
          {projectedMarkers.map((marker, index) => (
            <g
              key={marker.label}
              transform={`translate(${marker.x} ${marker.y})`}
            >
              <circle
                className="motion-reduce:hidden"
                r="2.4"
                fill="var(--color-moss)"
                opacity="0.5"
              >
                <animate
                  attributeName="r"
                  begin={`${index * -0.3}s`}
                  dur="2.4s"
                  from="2.4"
                  to="9"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  begin={`${index * -0.3}s`}
                  dur="2.4s"
                  from="0.5"
                  to="0"
                  repeatCount="indefinite"
                />
              </circle>
              <circle r="2.4" fill="var(--color-pine)" />
            </g>
          ))}
        </g>
      </svg>

      <figcaption className="sr-only">
        Active hackathon cities include Toronto, San Francisco, New York, São
        Paulo, London, Berlin, Nairobi, Bangalore, Singapore, Tokyo, and Sydney.
      </figcaption>
    </figure>
  );
}
