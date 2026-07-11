/* Quiet echo of the landing hero's night sky — aurora wash, film grain, and a
   handful of stars — tuned way down so app content stays the focus. Pure CSS,
   safe to render from server components; gradient styling lives in globals.css. */

const stars = [
  { top: "5%", left: "12%", size: 2, delay: 0.4, duration: 4.6, max: 0.7 },
  { top: "9%", left: "34%", size: 1.5, delay: 1.8, duration: 3.8, max: 0.55 },
  { top: "4%", left: "55%", size: 2, delay: 0.9, duration: 5.2, max: 0.75 },
  { top: "12%", left: "72%", size: 1.5, delay: 2.4, duration: 4.2, max: 0.5 },
  { top: "7%", left: "88%", size: 2, delay: 1.2, duration: 4.8, max: 0.7 },
  { top: "18%", left: "20%", size: 1.5, delay: 3, duration: 5, max: 0.45 },
  { top: "22%", left: "48%", size: 1.5, delay: 0.6, duration: 4.4, max: 0.5 },
  { top: "16%", left: "63%", size: 2, delay: 2, duration: 5.4, max: 0.65 },
  { top: "26%", left: "82%", size: 1.5, delay: 1.5, duration: 4, max: 0.45 },
  { top: "32%", left: "8%", size: 1.5, delay: 2.8, duration: 5.6, max: 0.4 },
] as const;

export function AppAtmosphere() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="app-atmosphere-wash absolute inset-0" />
      <div className="app-atmosphere-aurora absolute -right-[12%] top-[-18%] h-[85%] w-[72%]" />
      <div className="app-atmosphere-glow absolute -left-[14%] top-[-10%] h-[65%] w-[48%]" />

      {/* Stars only come out in the dark. */}
      <div className="hidden dark:block">
        {stars.map((star, i) => (
          <span
            key={i}
            className="hero-star absolute rounded-full bg-wheat"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              boxShadow:
                star.size >= 2
                  ? "0 0 5px 1px rgb(244 235 217 / 0.3)"
                  : undefined,
              ["--star-delay" as string]: `${star.delay}s`,
              ["--star-duration" as string]: `${star.duration}s`,
              ["--star-max" as string]: star.max,
            }}
          />
        ))}
      </div>

      {/* Film grain keeps the gradients tactile, never smooth-plastic. */}
      <div className="hero-grain absolute inset-0 opacity-[0.04] mix-blend-overlay dark:opacity-[0.07]" />
    </div>
  );
}
