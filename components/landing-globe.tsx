"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";

/* Cities with an active hackathon scene — rendered as glowing markers so the
   globe reads "events everywhere", not just North America. */
const globeMarkers: { location: [number, number]; size: number }[] = [
  { location: [43.65, -79.38], size: 0.03 }, // Toronto
  { location: [37.77, -122.42], size: 0.03 }, // San Francisco
  { location: [40.71, -74.01], size: 0.025 }, // New York
  { location: [49.28, -123.12], size: 0.02 }, // Vancouver
  { location: [19.43, -99.13], size: 0.02 }, // Mexico City
  { location: [-23.55, -46.63], size: 0.025 }, // São Paulo
  { location: [51.5, -0.12], size: 0.025 }, // London
  { location: [52.52, 13.4], size: 0.025 }, // Berlin
  { location: [-1.29, 36.82], size: 0.02 }, // Nairobi
  { location: [12.97, 77.59], size: 0.025 }, // Bangalore
  { location: [1.35, 103.82], size: 0.025 }, // Singapore
  { location: [35.68, 139.69], size: 0.025 }, // Tokyo
  { location: [-33.87, 151.21], size: 0.02 }, // Sydney
];

export function LandingGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    let phi = 4.2; // Start over North America before drifting east.
    const width = canvas.offsetWidth;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width,
      height: width,
      phi,
      theta: 0.22,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 18000,
      mapBrightness: 5,
      baseColor: [0.42, 0.39, 0.35],
      markerColor: [0.7, 0.33, 0.12],
      glowColor: [0.09, 0.08, 0.07],
      markerElevation: 0,
      markers: globeMarkers,
    });

    /* cobe v2 only renders on update(), so drive the rotation with our own
       rAF loop (which the browser pauses when the tab is hidden). */
    let frame = 0;
    if (!reduceMotion) {
      const spin = () => {
        phi += 0.0028;
        globe.update({ phi });
        frame = requestAnimationFrame(spin);
      };
      frame = requestAnimationFrame(spin);
    }

    return () => {
      cancelAnimationFrame(frame);
      globe.destroy();
    };
  }, []);

  return (
    <div aria-hidden="true" className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className="h-full w-full [contain:layout_paint_size]"
      />

      <div className="absolute top-[38%] hidden w-56 rounded-xl border border-dashed border-rust/40 bg-white/85 p-4 backdrop-blur-sm lg:-left-44 lg:block dark:bg-[#141414]/85">
        <p className="text-sm font-semibold text-navy dark:text-wheat">
          Hundreds of hackathons
        </p>
        <p className="mt-1 text-[0.8rem] leading-relaxed text-navy/55 dark:text-wheat/55">
          Tracked live across every region and timezone.
        </p>
      </div>

      <div className="absolute top-[18%] hidden w-56 rounded-xl border border-dashed border-rust/40 bg-white/85 p-4 backdrop-blur-sm lg:-right-44 lg:block dark:bg-[#141414]/85">
        <p className="text-sm font-semibold text-navy dark:text-wheat">
          Zero bad listings
        </p>
        <p className="mt-1 text-[0.8rem] leading-relaxed text-navy/55 dark:text-wheat/55">
          Every event is reviewed by a human before it goes live.
        </p>
      </div>
    </div>
  );
}
