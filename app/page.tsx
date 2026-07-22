import Link from "next/link";

import { HeroHeadline } from "@/components/hero-headline";
import { HeroAurora } from "@/components/hero-inuksuk";
import { HeroPolaroids } from "@/components/hero-polaroids";
import { AudienceCards } from "@/components/audience-cards";
import { ShieldCheck, Rss, Users } from "lucide-react";

import {
  LazyLandingGlobe,
  LazyPipelineSpotlight,
  LazySearchSpotlight,
} from "@/components/landing-lazy-visuals";
import { LandingReveal } from "@/components/landing-reveal";
import { PolaroidFrame, mobilePolaroids } from "@/components/polaroid-frame";
import { PrimaryNav } from "@/components/primary-nav";

const coveragePillars = [
  {
    Icon: Rss,
    title: "Sourced from everywhere",
    body: "We pull hackathons from dev posts, LinkedIn, Luma, and MLH. If an event is announced somewhere, it lands here.",
  },
  {
    Icon: Users,
    title: "Built by 5,000+ of us",
    body: "Our 5,000 strong community, from first time hackers to seasoned organizers, can add their own hackathon with a simple form.",
  },
  {
    Icon: ShieldCheck,
    title: "Approved by admins",
    body: "Every hackathon is read over and approved by an admin before it's published, so a bad event never slips through.",
  },
];

export default function Home() {
  // Signed-in visitors are redirected into the app by the middleware, keeping
  // this page fully static.
  return (
    // The landing page is always night-sky dark, whatever the app theme.
    <main className="dark min-h-screen overflow-x-clip bg-[#141414] text-wheat">
      <PrimaryNav />

      <section className="relative isolate overflow-hidden pb-16 pt-24 sm:min-h-[min(110svh,980px)] sm:pb-32 sm:pt-32">
        <HeroAurora />

        <HeroPolaroids />

        <div className="relative z-10 mx-auto flex max-w-[640px] flex-col items-center px-5 text-center sm:px-8 lg:max-w-[700px]">
          <HeroHeadline />

          <LandingReveal delay={0.55}>
            <p className="mt-6 max-w-[34rem] text-pretty text-base leading-relaxed text-navy/60 sm:text-lg dark:text-wheat/65">
              Search hundreds of upcoming hackathons, build your profile, and
              never miss another application deadline.
            </p>
          </LandingReveal>

          <LandingReveal delay={0.7}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/hackathons"
                className="group relative inline-flex min-h-11 items-center justify-center gap-2 overflow-hidden rounded-full bg-cabernet px-6 text-sm font-semibold text-wheat shadow-[0_12px_32px_-12px_rgba(114,28,36,0.6)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#5c151c] hover:shadow-[0_18px_40px_-12px_rgba(114,28,36,0.7)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cabernet active:translate-y-0 dark:bg-wheat dark:text-[#141414] dark:shadow-[0_12px_32px_-12px_rgba(244,235,217,0.35)] dark:hover:bg-white dark:hover:shadow-[0_18px_44px_-12px_rgba(134,227,190,0.4)] dark:focus-visible:outline-wheat"
              >
                {/* Sheen that sweeps across the pill on hover. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -translate-x-[130%] bg-[linear-gradient(105deg,transparent_30%,rgba(255,255,255,0.45)_50%,transparent_70%)] transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[130%] motion-reduce:hidden"
                />
                Open App
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
              <Link
                href="/about"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-navy/15 bg-white/70 px-6 text-sm font-semibold text-navy backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_28px_-14px_rgba(29,42,68,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy/30 active:translate-y-0 dark:border-white/15 dark:bg-white/5 dark:text-wheat dark:hover:border-white/25 dark:hover:bg-white/10 dark:hover:shadow-[0_12px_28px_-14px_rgba(0,0,0,0.6)] dark:focus-visible:outline-wheat"
              >
                About HNA
              </Link>
            </div>
            <p className="mt-4 text-[0.75rem] text-navy/40 dark:text-wheat/40">
              Free for hackers <span aria-hidden="true">·</span> Built for
              North America
            </p>
          </LandingReveal>
        </div>

        {/* Scroll cue — a drip of light running down toward the map. */}
        <LandingReveal
          className="absolute inset-x-0 bottom-8 z-10 hidden justify-center sm:flex"
          delay={1.2}
        >
          <a
            href="#coverage"
            className="group flex flex-col items-center gap-2.5 font-mono text-[0.6rem] font-medium uppercase tracking-[0.24em] text-wheat/35 transition-colors duration-300 hover:text-wheat/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wheat"
          >
            Scroll
            <span className="block h-10 w-px overflow-hidden rounded-full bg-white/10">
              <span className="block h-full w-full animate-scroll-drip bg-gradient-to-b from-transparent via-wheat/70 to-transparent motion-reduce:animate-none" />
            </span>
          </a>
        </LandingReveal>

        <div className="relative z-10 mx-auto mt-14 grid max-w-[360px] grid-cols-2 gap-3 px-6 sm:hidden">
          {mobilePolaroids.map((shot, i) => (
            <PolaroidFrame
              key={`mobile-${shot.src}`}
              src={shot.src}
              alt={shot.alt}
              caption={shot.caption}
              className={`w-full ${
                [
                  "rotate-[-4deg] translate-y-1",
                  "rotate-[3deg] -translate-y-1",
                  "rotate-[4deg]",
                  "rotate-[-3deg] translate-y-1",
                ][i]
              }`}
              width={shot.width}
              height={shot.height}
              sticker={shot.sticker}
              lift={shot.lift}
              tape={shot.tape}
            />
          ))}
        </div>

      </section>

      <section
        id="coverage"
        aria-labelledby="coverage-heading"
        className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20 lg:px-12"
      >
        <div className="mx-auto max-w-[1100px]">
          <div className="max-w-[36rem]">
            <h2
              id="coverage-heading"
              className="font-serif text-2xl font-semibold leading-[1.15] tracking-[-0.02em] text-navy sm:text-3xl lg:text-4xl dark:text-wheat"
            >
              Hackathons across the globe
            </h2>
            <p className="mt-4 max-w-[32rem] text-base leading-relaxed text-navy/55 dark:text-wheat/55">
              One home for every event: sourced from across the web, submitted
              by the community, and vetted by real people.
            </p>
          </div>

          <div className="mt-10 sm:mt-12">
            <LazyLandingGlobe />
          </div>

          <div className="mt-10 grid divide-y divide-navy/10 border-t border-navy/10 sm:mt-12 sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-white/10 dark:border-white/10">
            {coveragePillars.map(({ Icon, title, body }) => (
              <div key={title} className="px-1 py-7 sm:px-7 sm:py-8">
                <Icon
                  aria-hidden="true"
                  className="size-6 text-rust"
                  strokeWidth={1.75}
                />
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-navy dark:text-wheat">
                  {title}
                </h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-navy/55 dark:text-wheat/55">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="search-spotlight-heading"
        className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12"
      >
        <div className="mx-auto max-w-[1100px]">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
            <h2
              id="search-spotlight-heading"
              className="max-w-[22rem] font-serif text-2xl font-semibold leading-[1.15] tracking-[-0.02em] text-navy sm:text-3xl lg:text-4xl dark:text-wheat"
            >
              Find the ones worth going to
            </h2>
            <div>
              <p className="max-w-[32rem] text-base leading-relaxed text-navy/55 dark:text-wheat/55 sm:text-lg">
                Search hackathons by country, filter by date and format, and
                surface the events that reimburse your travel. Find the
                hackathon you actually want to attend in your area, and never
                miss a single one.
              </p>
              <Link
                href="/hackathons"
                className="mt-8 inline-flex items-center gap-3 font-mono text-sm text-navy/40 transition-colors hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy/30 dark:text-wheat/40 dark:hover:text-wheat dark:focus-visible:outline-wheat"
              >
                1.0
                <span className="text-navy/70 dark:text-wheat/70">
                  Search{" "}
                  <span aria-hidden="true" className="ml-1">
                    →
                  </span>
                </span>
              </Link>
            </div>
          </div>

          <div className="mt-14 sm:mt-16 lg:mt-20">
            <LazySearchSpotlight />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="pipeline-spotlight-heading"
        className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12"
      >
        <div className="mx-auto max-w-[1100px]">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
            <h2
              id="pipeline-spotlight-heading"
              className="max-w-[22rem] font-serif text-2xl font-semibold leading-[1.15] tracking-[-0.02em] text-navy sm:text-3xl lg:text-4xl dark:text-wheat"
            >
              Get reminders and keep track of them all
            </h2>
            <div>
              <p className="max-w-[32rem] text-base leading-relaxed text-navy/55 dark:text-wheat/55 sm:text-lg">
                Choose email reminders that land a week before applications
                open, a day before they open, and a day before the hackathon
                starts. Then follow the status of every hackathon you&apos;ve
                applied to (interested, applied, accepted) on one board.
              </p>
              <Link
                href="/my"
                className="mt-8 inline-flex items-center gap-3 font-mono text-sm text-navy/40 transition-colors hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy/30 dark:text-wheat/40 dark:hover:text-wheat dark:focus-visible:outline-wheat"
              >
                2.0
                <span className="text-navy/70 dark:text-wheat/70">
                  Track{" "}
                  <span aria-hidden="true" className="ml-1">
                    →
                  </span>
                </span>
              </Link>
            </div>
          </div>

          <div className="mt-14 sm:mt-16 lg:mt-20">
            <LazyPipelineSpotlight />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="audiences-heading"
        className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12"
      >
        <div className="mx-auto max-w-[1100px]">
          <div className="mx-auto max-w-[26rem] text-center">
            <p className="text-[0.7rem] font-medium tracking-[0.04em] text-rust">
              Who it&apos;s for
            </p>
            <h2
              id="audiences-heading"
              className="mt-3 font-serif text-2xl font-semibold leading-[1.15] tracking-[-0.02em] text-navy sm:text-3xl lg:text-4xl dark:text-wheat"
            >
              One platform, three jobs
            </h2>
          </div>

          <AudienceCards />
        </div>
      </section>

    </main>
  );
}
