"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

export function HeroMapScroll({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "start 0.3"],
  });

  const rotateX = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [28, 0]
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [1, 1] : [1.05, 1]
  );

  return (
    <div ref={containerRef} style={{ perspective: "1000px" }}>
      <motion.div
        style={{ rotateX, scale }}
        className="rounded border border-black/10 bg-white p-2 shadow-[0_22px_64px_rgba(0,0,0,0.12)] sm:p-4"
      >
        <div className="overflow-hidden rounded bg-white">{children}</div>
      </motion.div>
    </div>
  );
}
