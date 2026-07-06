"use client";

import { useEffect, useRef } from "react";

type Dot = {
  x: number;
  y: number;
  size: number;
  color: string;
  phase: number;
  pulse: number;
};

const skyDot = "rgba(255, 255, 255, 0.58)";
const paleSkyDot = "rgba(238, 245, 250, 0.52)";
const mountainPalette = [
  "#080808",
  "#660000",
  "#fbbf24",
  "#f7f3ea",
  "#b6d322",
  "#f97316",
  "#7f8b96",
];

function ridgeFromPoints(points: Array<[number, number]>, x: number) {
  for (let index = 0; index < points.length - 1; index += 1) {
    const [x1, y1] = points[index];
    const [x2, y2] = points[index + 1];

    if (x >= x1 && x <= x2) {
      const progress = (x - x1) / (x2 - x1);
      const eased = progress * progress * (3 - 2 * progress);

      return y1 + (y2 - y1) * eased;
    }
  }

  return points[points.length - 1][1];
}

function seededNoise(x: number, y: number) {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;

  return value - Math.floor(value);
}

function buildDots(width: number, height: number) {
  const dots: Dot[] = [];
  const skyStep = width < 640 ? 10 : 8;
  const mountainStep = width < 640 ? 7 : 6;

  for (let y = 0; y < height; y += skyStep) {
    for (let x = 0; x < width; x += skyStep) {
      const noise = seededNoise(x, y);

      if (noise > 0.15) {
        dots.push({
          x: x + noise * 1.8,
          y: y + seededNoise(y, x) * 1.8,
          size: noise > 0.76 ? 1.7 : 1.05,
          color: noise > 0.54 ? skyDot : paleSkyDot,
          phase: noise * Math.PI * 2,
          pulse: 0.24,
        });
      }
    }
  }

  const rearRidge = [
    [0, height * 0.8],
    [0.2, height * 0.74],
    [0.36, height * 0.56],
    [0.5, height * 0.77],
    [0.66, height * 0.62],
    [0.82, height * 0.73],
    [1, height * 0.57],
  ] as Array<[number, number]>;
  const frontRidge = [
    [0, height * 0.88],
    [0.11, height * 0.7],
    [0.24, height * 0.84],
    [0.39, height * 0.63],
    [0.56, height * 0.81],
    [0.72, height * 0.69],
    [0.84, height * 0.76],
    [1, height * 0.58],
  ] as Array<[number, number]>;

  for (let y = height * 0.48; y < height + mountainStep; y += mountainStep) {
    for (let x = 0; x < width; x += mountainStep) {
      const progressX = x / width;
      const rearTop =
        ridgeFromPoints(rearRidge, progressX) +
        Math.sin(progressX * 62) * 8 +
        Math.sin(progressX * 141) * 4;
      const frontTop =
        ridgeFromPoints(frontRidge, progressX) +
        Math.sin(progressX * 74) * 12 +
        Math.sin(progressX * 189) * 5;
      const noise = seededNoise(x * 0.6, y * 0.7);
      const isRear = y > rearTop && y < frontTop + height * 0.07;
      const isFront = y > frontTop;

      if (!isRear && !isFront) {
        continue;
      }

      const depth = isFront ? (y - frontTop) / (height - frontTop) : 0.24;
      const colorRoll = seededNoise(x + 17, y + 31);
      const color =
        colorRoll > 0.88
          ? mountainPalette[4]
          : colorRoll > 0.72
            ? mountainPalette[2]
            : colorRoll > 0.55
              ? mountainPalette[5]
              : colorRoll > 0.38
                ? mountainPalette[1]
                : colorRoll > 0.12
                  ? mountainPalette[0]
                  : isFront
                    ? mountainPalette[3]
                    : mountainPalette[6];

      dots.push({
        x: x + noise * 2.2,
        y: y + seededNoise(y + 7, x + 11) * 2.2,
        size: isFront ? 2.25 + depth * 0.85 : 1.85,
        color,
        phase: noise * Math.PI * 2,
        pulse: isFront ? 0.42 : 0.28,
      });
    }
  }

  return dots;
}

export function HeroEtchTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ active: false, x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;

    if (!canvas || !wrapper) {
      return;
    }

    const context = canvas.getContext("2d", { alpha: true });

    if (!context) {
      return;
    }

    let animationFrame = 0;
    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const resize = () => {
      const rect = wrapper.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);

      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      dots = buildDots(width, height);
      draw(performance.now());
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#cbd8e6";
      context.fillRect(0, 0, width, height);

      const pointer = pointerRef.current;
      const radius = Math.min(width, height) * 0.22;

      for (const dot of dots) {
        const dx = dot.x - pointer.x;
        const dy = dot.y - pointer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const influence =
          pointer.active && distance < radius ? 1 - distance / radius : 0;
        const shimmer = prefersReducedMotion
          ? 0
          : Math.sin(time * 0.0014 + dot.phase) * dot.pulse;
        const lift = influence * 2.4;

        context.fillStyle = influence > 0.05 ? "#38bdf8" : dot.color;
        context.fillRect(
          dot.x - lift * dx * 0.014,
          dot.y - lift * dy * 0.014,
          dot.size + influence * 2.1 + shimmer,
          dot.size + influence * 2.1 + shimmer
        );
      }

      animationFrame = 0;
    };

    const scheduleDraw = () => {
      if (animationFrame) {
        return;
      }

      animationFrame = window.requestAnimationFrame(draw);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = wrapper.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      pointerRef.current = {
        active: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height,
        x,
        y,
      };

      scheduleDraw();
    };

    const handlePointerLeave = () => {
      pointerRef.current = { active: false, x: 0, y: 0 };
      scheduleDraw();
    };

    const observer = new ResizeObserver(resize);

    observer.observe(wrapper);
    resize();
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="hero-etch-trail pointer-events-none absolute inset-0"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
