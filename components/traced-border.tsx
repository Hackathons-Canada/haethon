// A pill-shaped SVG border that traces itself in when the parent button is
// hovered. Pure CSS (no JS), so it works inside server components: the outline
// is a single rounded <rect> whose stroke is normalized to a length of 1 via
// `pathLength`, then hidden with a full dash offset and revealed to 0 on
// group-hover — the browser tweens the offset, drawing the border stroke by
// stroke around the pill.
//
// Usage: the parent must be `relative` (for the absolute fill) and carry the
// `group` class (so `group-hover` reaches this nested rect).
export function TracedBorder({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      // Inset by ~1.5px so the centered stroke sits just inside the button box
      // instead of being clipped at the edge. Sized with calc() so it adapts to
      // whatever width/height the button ends up being.
      className={`pointer-events-none absolute left-[1.5px] top-[1.5px] overflow-visible text-moss ${className ?? ""}`}
      style={{ width: "calc(100% - 3px)", height: "calc(100% - 3px)" }}
    >
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        rx="999"
        ry="999"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        pathLength={1}
        className="[stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-500 ease-out group-hover:[stroke-dashoffset:0] motion-reduce:transition-none"
      />
    </svg>
  );
}
