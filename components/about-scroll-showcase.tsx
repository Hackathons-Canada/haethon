"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const companies = [
  {
    id: "hack-canada",
    name: "HC25",
  },
  {
    id: "hackathons-north-america",
    name: "HNA",
  },
  {
    id: "corporate",
    name: "Corporate",
  },
] as const;

// Height of a single name row in the centered scrolling list.
const NAME_ROW = "8rem";

function SideFigure({ activeIndex }: { activeIndex: number }) {
  return (
    <figure className="flex w-full flex-col items-center">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl">
        {companies.map((company, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl border border-navy/10 bg-navy/[0.04] transition-[opacity,transform,visibility] duration-[600ms] ease-out motion-reduce:transition-none dark:border-wheat/10 dark:bg-wheat/[0.06] ${
                isActive
                  ? "visible scale-100 opacity-100"
                  : "invisible scale-[1.03] opacity-0"
              }`}
              key={company.id}
            >
              <span className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.16em] text-navy/40 dark:text-wheat/40">
                Placeholder image
              </span>
              <span className="px-4 text-center font-serif text-lg text-navy/55 dark:text-wheat/55">
                {company.name}
              </span>
            </div>
          );
        })}
      </div>

    </figure>
  );
}

// The side cards stay hidden until the names have scrolled roughly to
// center, then fade in over this progress window (matches the YC reveal).
const REVEAL_START = 0.12;
const REVEAL_END = 0.28;

export function AboutScrollShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reveal, setReveal] = useState(0);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let frame = 0;

    const updateActiveIndex = () => {
      frame = 0;
      const wrapper = wrapperRef.current;

      if (!wrapper) {
        return;
      }

      const rect = wrapper.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;

      if (scrollable <= 0) {
        return;
      }

      const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);
      const nextIndex = Math.min(
        companies.length - 1,
        Math.floor(progress * companies.length)
      );

      setActiveIndex((currentIndex) =>
        currentIndex === nextIndex ? currentIndex : nextIndex
      );

      const nextReveal = Math.min(
        Math.max((progress - REVEAL_START) / (REVEAL_END - REVEAL_START), 0),
        1
      );
      const roundedReveal = Math.round(nextReveal * 100) / 100;

      setReveal((currentReveal) =>
        currentReveal === roundedReveal ? currentReveal : roundedReveal
      );
    };

    const requestUpdate = () => {
      if (!frame) {
        frame = requestAnimationFrame(updateActiveIndex);
      }
    };

    updateActiveIndex();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  const scrollToSection = (index: number) => {
    const wrapper = wrapperRef.current;

    if (!wrapper) {
      return;
    }

    const rect = wrapper.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    const target =
      window.scrollY +
      rect.top +
      ((index + 0.5) / companies.length) * scrollable;

    setActiveIndex(index);
    window.scrollTo({ top: target, behavior: "smooth" });
  };

  const activeSection = companies[activeIndex];

  return (
    <section
      aria-labelledby="about-showcase-heading"
      className="px-5 sm:px-8 lg:px-12"
    >
      <h2 id="about-showcase-heading" className="sr-only">
        What we&apos;ve built
      </h2>

      <div
        className="relative"
        ref={wrapperRef}
        style={{ height: `${companies.length * 100}vh` }}
      >
        <div
          className="sticky top-0 h-screen overflow-hidden"
          data-about-stage
          data-active-section={activeSection.id}
        >
          <div className="relative mx-auto grid h-full max-w-[1300px] grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-10">
            {/* Left image */}
            <div
              className="order-2 lg:order-1"
              style={{
                opacity: reveal,
                transform: `translateY(${(1 - reveal) * 24}px)`,
              }}
            >
              <SideFigure activeIndex={activeIndex} />
            </div>

            {/* Center — scrolling list of names + scroll hint */}
            <div className="pointer-events-none relative order-1 col-span-2 h-[24rem] lg:order-2 lg:col-span-1 lg:h-full">
              {activeIndex === 0 && (
                <ChevronDown
                  aria-hidden="true"
                  className="absolute left-1/2 -translate-x-1/2 text-navy/30 dark:text-wheat/30"
                  data-about-scroll-hint
                  size={26}
                  strokeWidth={1.5}
                  style={{ top: "calc(50% - 5rem)" }}
                />
              )}

              <nav
                aria-label="About sections"
                className="pointer-events-auto absolute inset-0"
              >
                <ul
                  className="absolute inset-x-0 top-1/2 transition-transform duration-500 ease-out motion-reduce:transition-none"
                  style={{
                    transform: `translateY(calc(${-(activeIndex + 0.5)} * ${NAME_ROW}))`,
                  }}
                >
                  {companies.map((company, index) => {
                    const isActive = index === activeIndex;
                    const distance = Math.abs(index - activeIndex);

                    return (
                      <li
                        className="flex items-center justify-center"
                        key={company.id}
                        style={{ height: NAME_ROW }}
                      >
                        <button
                          aria-current={isActive ? "true" : undefined}
                          className="px-4 text-center font-serif text-3xl font-medium leading-tight tracking-tight text-navy transition-opacity duration-300 ease-out motion-reduce:transition-none sm:text-4xl lg:text-6xl dark:text-wheat"
                          onClick={() => scrollToSection(index)}
                          style={{
                            opacity: isActive ? 1 : distance === 1 ? 0.25 : 0.12,
                          }}
                          type="button"
                        >
                          {company.name}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            {/* Right image */}
            <div
              className="order-3"
              style={{
                opacity: reveal,
                transform: `translateY(${(1 - reveal) * 24}px)`,
              }}
            >
              <SideFigure activeIndex={activeIndex} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
