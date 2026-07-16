"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const easeOut = [0.22, 1, 0.36, 1] as const;

type RevealWordProps = {
  index: number;
  still: boolean;
  children: ReactNode;
  className?: string;
};

function RevealWord({ index, still, children, className }: RevealWordProps) {
  return (
    <motion.span
      className={`inline-block ${className ?? ""}`}
      initial={still ? false : { opacity: 0, y: "0.35em" }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.07, duration: 0.7, ease: easeOut }}
    >
      {children}
    </motion.span>
  );
}

export function HeroHeadline() {
  const prefersReducedMotion = useReducedMotion();
  const still = prefersReducedMotion ?? false;

  return (
    <h1 className="relative mt-7 font-serif text-[clamp(2.75rem,8vw,5.5rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-navy dark:text-wheat">
      <RevealWord index={0} still={still}>
        Where
      </RevealWord>{" "}
      <RevealWord
        index={1}
        still={still}
        className="bg-[linear-gradient(180deg,#abdcc0_0%,#7cc7ab_55%,#5da78e_100%)] bg-clip-text text-transparent"
      >
        hackers
      </RevealWord>{" "}
      <RevealWord index={2} still={still}>
        find
      </RevealWord>{" "}
      <RevealWord index={3} still={still}>
        their
      </RevealWord>{" "}
      <RevealWord index={4} still={still}>
        next
      </RevealWord>{" "}
      <RevealWord index={5} still={still} className="italic">
        weekend.
      </RevealWord>
    </h1>
  );
}
