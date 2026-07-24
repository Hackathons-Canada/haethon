"use client";

import dynamic from "next/dynamic";

import { LazyMount } from "@/components/lazy-mount";

/* Below-fold landing visuals. Each is split into its own chunk (next/dynamic,
   no SSR) and only mounted once scrolled near the viewport via LazyMount.
   Placeholder sizing approximates each visual's rendered height to avoid
   layout shift. */
const LandingWorldMap = dynamic(
  () =>
    import("@/components/landing-world-map").then(
      (mod) => mod.LandingWorldMap,
    ),
  { ssr: false },
);

const PipelineSpotlightVisual = dynamic(
  () =>
    import("@/components/landing-pipeline-spotlight").then(
      (mod) => mod.PipelineSpotlightVisual,
    ),
  { ssr: false },
);

const SearchSpotlightVisual = dynamic(
  () =>
    import("@/components/landing-search-spotlight").then(
      (mod) => mod.SearchSpotlightVisual,
    ),
  { ssr: false },
);

export function LazyLandingWorldMap() {
  return (
    // Aspect matches the dotted map's generated ratio (~159/60) so the
    // placeholder reserves the right height and avoids layout shift.
    <LazyMount className="aspect-[159/60] w-full">
      <LandingWorldMap />
    </LazyMount>
  );
}

export function LazySearchSpotlight() {
  return (
    /* Mobile shows just the spotlight card; md+ adds the tall backdrop grid. */
    <LazyMount className="min-h-[34rem] md:min-h-[64rem]">
      <SearchSpotlightVisual />
    </LazyMount>
  );
}

export function LazyPipelineSpotlight() {
  return (
    /* Mobile shows just the spotlight card; md+ adds the backdrop board. */
    <LazyMount className="min-h-[30rem] md:min-h-[36rem]">
      <PipelineSpotlightVisual />
    </LazyMount>
  );
}
