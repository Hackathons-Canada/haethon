"use client";

import dynamic from "next/dynamic";

import { LazyMount } from "@/components/lazy-mount";

/* Heavy below-fold landing visuals. Each is split into its own chunk
   (next/dynamic, no SSR) and only mounted once scrolled near the viewport via
   LazyMount, so dotted-map and the motion-driven feature mocks stay off the
   landing page's critical path. Placeholder sizing approximates each visual's
   rendered height to avoid layout shift. */
const LandingMap = dynamic(
  () => import("@/components/landing-map").then((mod) => mod.LandingMap),
  { ssr: false },
);

const DiscoverVisual = dynamic(
  () =>
    import("@/components/landing-feature-visuals").then((mod) => mod.DiscoverVisual),
  { ssr: false },
);

const RemindersVisual = dynamic(
  () =>
    import("@/components/landing-feature-visuals").then((mod) => mod.RemindersVisual),
  { ssr: false },
);

const ProfileVisual = dynamic(
  () =>
    import("@/components/landing-feature-visuals").then((mod) => mod.ProfileVisual),
  { ssr: false },
);

export function LazyLandingMap() {
  return (
    /* WorldMap renders at aspect-[2/1], so the placeholder matches exactly. */
    <LazyMount className="aspect-[2/1] w-full">
      <LandingMap />
    </LazyMount>
  );
}

export function LazyDiscoverVisual() {
  return (
    <LazyMount className="min-h-[24rem]">
      <DiscoverVisual />
    </LazyMount>
  );
}

export function LazyRemindersVisual() {
  return (
    <LazyMount className="min-h-[22rem]">
      <RemindersVisual />
    </LazyMount>
  );
}

export function LazyProfileVisual() {
  return (
    <LazyMount className="min-h-[23rem]">
      <ProfileVisual />
    </LazyMount>
  );
}
