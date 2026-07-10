"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

import { MacbookScreenHackathons } from "@/components/ui/macbook-screen-hackathons";

// Pose of the machine. The lid settles almost parallel to the viewer's screen
// while the base folds toward the camera (positive rotateX, origin at the
// hinge), so the keyboard reads heavily foreshortened and flares slightly
// wider at the bottom — like looking at an open MacBook from just above the
// screen. Everything is sized proportionally to the component width so the
// same geometry holds from mobile to desktop.
const SCROLL_RANGE: [number, number] = [0, 420];
const LID_TILT: [number, number] = [9, 3];
const DECK_TILT: [number, number] = [69, 61];

type KeyDef = {
  main: string;
  top?: string;
  grow?: number;
  align?: "bl" | "br";
};

const letters = (chars: string): KeyDef[] =>
  chars.split("").map((main) => ({ main }));

const fnRow: KeyDef[] = [
  { main: "esc", grow: 1.4, align: "bl" },
  ...Array.from({ length: 12 }, (_, i) => ({ main: `F${i + 1}` })),
  { main: "" },
];

const numberRow: KeyDef[] = [
  { main: "`", top: "~" },
  { main: "1", top: "!" },
  { main: "2", top: "@" },
  { main: "3", top: "#" },
  { main: "4", top: "$" },
  { main: "5", top: "%" },
  { main: "6", top: "^" },
  { main: "7", top: "&" },
  { main: "8", top: "*" },
  { main: "9", top: "(" },
  { main: "0", top: ")" },
  { main: "-", top: "_" },
  { main: "=", top: "+" },
  { main: "delete", grow: 1.5, align: "br" },
];

const tabRow: KeyDef[] = [
  { main: "tab", grow: 1.5, align: "bl" },
  ...letters("QWERTYUIOP"),
  { main: "[", top: "{" },
  { main: "]", top: "}" },
  { main: "\\", top: "|" },
];

const homeRow: KeyDef[] = [
  { main: "caps lock", grow: 1.75, align: "bl" },
  ...letters("ASDFGHJKL"),
  { main: ";", top: ":" },
  { main: "'", top: "\"" },
  { main: "return", grow: 1.75, align: "br" },
];

// Only a clipped sliver of this row renders — the deck is cut off right
// below the ASDF line.
const bottomRow: KeyDef[] = [
  { main: "shift", grow: 2.3, align: "bl" },
  ...letters("ZXCVBNM"),
  { main: ",", top: "<" },
  { main: ".", top: ">" },
  { main: "/", top: "?" },
  { main: "shift", grow: 2.3, align: "br" },
];

const keyLabelClassName = "text-[clamp(4px,0.85vw,10px)]";

function KeyCap({ def }: { def: KeyDef }) {
  const alignment =
    def.align === "bl"
      ? "items-end justify-start pl-[8%] pb-[4%]"
      : def.align === "br"
        ? "items-end justify-end pr-[8%] pb-[4%]"
        : "items-center justify-center";

  return (
    <div
      style={{ flexGrow: def.grow ?? 1, flexBasis: 0 }}
      className={`flex h-full ${alignment} ${keyLabelClassName} rounded-[clamp(2px,0.4vw,5px)] bg-[#131318] font-medium leading-[1.15] text-neutral-400 shadow-[inset_0_-1px_2px_rgba(255,255,255,0.1),inset_0_2px_3px_rgba(0,0,0,0.7)]`}
    >
      {def.top ? (
        <span className="flex flex-col items-center">
          <span className="text-neutral-500">{def.top}</span>
          <span>{def.main}</span>
        </span>
      ) : (
        def.main
      )}
    </div>
  );
}

function KeyRow({
  keys,
  aspect = "aspect-[16/1]",
}: {
  keys: KeyDef[];
  aspect?: string;
}) {
  return (
    <div className={`flex w-full gap-[0.45%] ${aspect} mb-[0.4%]`}>
      {keys.map((def, i) => (
        <KeyCap key={`${def.main}-${i}`} def={def} />
      ))}
    </div>
  );
}

const speakerGridStyle: CSSProperties = {
  backgroundImage:
    "radial-gradient(circle, rgba(255,255,255,0.13) 0.5px, transparent 0.5px)",
  backgroundSize: "4px 4px",
};


export function MacbookHero({ children }: { children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollY } = useScroll();
  const lidTilt = useTransform(scrollY, SCROLL_RANGE, LID_TILT);
  const deckTilt = useTransform(scrollY, SCROLL_RANGE, DECK_TILT);
  // The deck's projected height grows as it opens toward its final pose, so
  // the shadow rides up under the cutoff edge instead of sitting at a fixed
  // offset. Percentages keep it proportional at every width.
  const shadowY = useTransform(scrollY, SCROLL_RANGE, ["-28%", "0%"]);
  const shadowOpacity = useTransform(scrollY, SCROLL_RANGE, [0.7, 1]);

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[1080px]">
      {/* Lid */}
      <motion.div
        style={{
          rotateX: prefersReducedMotion ? LID_TILT[1] : lidTilt,
          transformPerspective: 2000,
        }}
        className="relative z-10 origin-bottom"
      >
        {/* shell rim, outside in: white edge → light gray line → large dark bezel.
            The rim only wraps the top and sides — the lid's bottom edge slides
            behind the deck, so no rim or corner rounding down there. */}
        <div className="rounded-t-[clamp(1.1rem,2.6vw,2.4rem)] bg-white px-[0.3%] pt-[0.3%] shadow-[0_60px_120px_-40px_rgba(0,0,0,0.5)]">
          <div className="rounded-t-[clamp(1rem,2.45vw,2.25rem)] bg-[#c9c9ce] px-[0.3%] pt-[0.3%]">
            <div className="relative rounded-t-[clamp(0.9rem,2.3vw,2.1rem)] bg-[#0a0a0c] p-[1.6%] pb-[2.9%]">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[clamp(0.55rem,1.3vw,1.2rem)] bg-white">
                {/* rectangular camera dock (notch) hanging into the screen */}
                <div
                  aria-hidden="true"
                  className="absolute left-1/2 top-0 z-10 h-[3.2%] w-[11%] -translate-x-1/2 rounded-b-[clamp(3px,0.45vw,7px)] bg-[#0a0a0c]"
                />
                {children ?? <MacbookScreenHackathons />}
              </div>
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-[0.85%] text-center text-[clamp(3px,0.65vw,8px)] font-medium tracking-[0.08em] text-neutral-500"
              >
                Hackathons North America
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Base — folded toward the viewer around the hinge. The wrapper only
          reserves the projected (foreshortened) height. */}
      <div className="relative aspect-[13/2]">
        <motion.div
          aria-hidden="true"
          style={{
            rotateX: prefersReducedMotion ? DECK_TILT[1] : deckTilt,
            transformPerspective: 1800,
          }}
          className="absolute inset-x-0 top-0 origin-top border-x border-[#26272c] bg-[#141418] px-[1.4%] pt-[0.5%] shadow-[inset_0_1px_0_rgba(70,70,78,0.6)]"
        >
          {/* hinge vent */}
          <div className="mx-auto mb-[0.5%] w-[30%] rounded-b-md bg-[#0a0a0c] py-[0.35%]" />
          <div className="flex gap-[0.8%]">
            <div className="w-[5.5%] rounded-md bg-[#1b1b20]" style={speakerGridStyle} />
            <div className="min-w-0 flex-1 rounded-lg bg-[#0b0b0e] p-[0.7%]">
              <KeyRow keys={fnRow} aspect="aspect-[32/1]" />
              <KeyRow keys={numberRow} />
              <KeyRow keys={tabRow} />
              <KeyRow keys={homeRow} />
              {/* abrupt cutoff mid-key below the ASDF line */}
              <div className="w-full overflow-hidden aspect-[40/1]">
                <KeyRow keys={bottomRow} />
              </div>
            </div>
            <div className="w-[5.5%] rounded-md bg-[#1b1b20]" style={speakerGridStyle} />
          </div>
        </motion.div>
      </div>

      {/* Gradient shadow falling away below the cutoff line. It overlays
          whatever section follows instead of reserving layout height, so the
          page background can switch color exactly at the cut line and the
          shadow reads as cast onto that surface. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-full"
      >
        <motion.div
          style={
            prefersReducedMotion
              ? undefined
              : { y: shadowY, opacity: shadowOpacity }
          }
          className="relative left-1/2 -mt-[1.5%] aspect-[1000/190] w-[112%] -translate-x-1/2"
        >
          {/* tight contact shadow hugging the cut line */}
          <div className="absolute inset-x-[3%] top-0 h-[38%] bg-gradient-to-b from-black/90 via-black/50 to-transparent blur-[5px] [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]" />
          {/* long falloff */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/30 to-transparent blur-[8px] [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]" />
        </motion.div>
      </div>
    </div>
  );
}
