"use client";

import dynamic from "next/dynamic";

import { LazyMount } from "@/components/lazy-mount";

/* Heavy below-fold landing visuals. Each is split into its own chunk
   (next/dynamic, no SSR) and only mounted once scrolled near the viewport via
   LazyMount, so cobe's WebGL globe and the motion-driven feature mocks stay
   off the landing page's critical path. Placeholder sizing approximates each
   visual's rendered height to avoid layout shift. */
const LandingGlobe = dynamic(
  () => import("@/components/landing-globe").then((mod) => mod.LandingGlobe),
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

export function LazyLandingGlobe() {
  return (
    /* The globe canvas renders as a square, so the placeholder matches. */
    <LazyMount className="mx-auto aspect-square w-full max-w-[560px]">
      <LandingGlobe />
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
