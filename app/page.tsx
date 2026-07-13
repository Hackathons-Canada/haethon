import Link from "next/link";

import { HeroHeadline } from "@/components/hero-headline";
import { HeroAurora } from "@/components/hero-inuksuk";
import { HeroPolaroids } from "@/components/hero-polaroids";
import { HeroTypewriterSpan } from "@/components/hero-typewriter-span";
import { ShieldCheck, Rss, Users } from "lucide-react";

import {
  LazyDiscoverVisual,
  LazyLandingGlobe,
  LazyProfileVisual,
  LazyRemindersVisual,
  LazySearchSpotlight,
} from "@/components/landing-lazy-visuals";
import { LandingReveal } from "@/components/landing-reveal";
import { PolaroidFrame, mobilePolaroids } from "@/components/polaroid-frame";
import { PrimaryNav } from "@/components/primary-nav";

const features = [
  {
    id: "discover",
    eyebrow: "Discover",
    heading: "Every hackathon in one place",
    body: "Search hundreds of events across North America by name, city, date, and format — including beginner-friendly and travel-reimbursed options.",
    Visual: LazyDiscoverVisual,
  },
  {
    id: "reminders",
    eyebrow: "Reminders",
    heading: "Deadlines that find you",
    body: "Get email alerts when applications open or close, decisions land, and check-in starts — so you never scramble at the last minute.",
    Visual: LazyRemindersVisual,
  },
  {
    id: "profile",
    eyebrow: "Profile",
    heading: "A record of what you shipped",
    body: "Track your pipeline, verify attendance, pin wins, and build an activity history that shows where you've been and what you've built.",
    Visual: LazyProfileVisual,
  },
] as const;

const coveragePillars = [
  {
    Icon: Rss,
    title: "Sourced from everywhere",
    body: "We pull hackathons from dev posts, LinkedIn, Luma, and MLH — if an event is announced somewhere, it lands here.",
  },
  {
    Icon: Users,
    title: "Built by 5,000+ of us",
    body: "Our 5,000-strong community — from first-time hackers to seasoned organizers — can add their own hackathon with a simple form.",
  },
  {
    Icon: ShieldCheck,
    title: "Approved by admins",
    body: "Every hackathon is read over and approved by an admin before it's published, so a bad event never slips through.",
  },
];

const audiences = [
  {
    label: "Hackers",
    title: "Find and follow events",
    body: "Discover hackathons, save the ones you care about, and keep every deadline in one feed.",
  },
  {
    label: "Organizers",
    title: "Publish and grow",
    body: "List your event to reach more builders, and tap HNA's network for advice and reach.",
  },
  {
    label: "Hosts",
    title: "Run it with us",
    body: "Partner with HNA to host end to end — or use our playbooks to run your own.",
  },
];

export default function Home() {
  // Signed-in visitors are redirected into the app by the middleware, keeping
  // this page fully static.
  return (
    // The landing page is always night-sky dark, whatever the app theme.
    <main className="dark min-h-screen overflow-x-clip bg-[#141414] text-wheat">
      <PrimaryNav />

      <section className="relative isolate min-h-[min(110svh,980px)] overflow-hidden pb-28 pt-28 sm:pb-32 sm:pt-32">
        <HeroAurora />

        <HeroPolaroids />

        <div className="relative z-10 mx-auto flex max-w-[640px] flex-col items-center px-5 text-center sm:px-8 lg:max-w-[700px]">
          <HeroHeadline />

          <LandingReveal delay={0.45}>
            <p
              aria-label="Search hundreds of upcoming hackathons, build your profile, and never miss another application deadline."
              className="mt-6 max-w-[34rem] text-base leading-relaxed text-navy/60 sm:text-lg dark:text-wheat/65"
            >
              Search hundreds of upcoming hackathons, build your profile, and{" "}
              <HeroTypewriterSpan className="text-rust" />
            </p>
          </LandingReveal>

          <LandingReveal delay={0.6}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/hackathons"
                className="group relative inline-flex min-h-11 items-center justify-center gap-2 overflow-hidden rounded-full bg-cabernet px-6 text-sm font-semibold text-wheat shadow-[0_12px_32px_-12px_rgba(114,28,36,0.6)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#5c151c] hover:shadow-[0_18px_40px_-12px_rgba(114,28,36,0.7)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cabernet active:translate-y-0 after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(115deg,transparent_32%,rgb(255_255_255_/_0.32)_48%,rgb(255_255_255_/_0.08)_54%,transparent_68%)] after:content-[''] after:translate-x-[-130%] after:transition-transform after:duration-[750ms] after:ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:after:translate-x-[130%] group-focus-visible:after:translate-x-[130%] dark:bg-wheat dark:text-[#141414] dark:shadow-[0_12px_32px_-12px_rgba(244,235,217,0.35)] dark:hover:bg-white dark:hover:shadow-[0_18px_40px_-12px_rgba(244,235,217,0.45)] dark:focus-visible:outline-wheat motion-reduce:after:hidden"
              >
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
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-navy/15 bg-white/70 px-6 text-sm font-semibold text-navy backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_28px_-14px_rgba(29,42,68,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy/30 active:translate-y-0 dark:border-white/15 dark:bg-white/5 dark:text-wheat dark:hover:bg-white/10 dark:hover:shadow-[0_12px_28px_-14px_rgba(0,0,0,0.6)] dark:focus-visible:outline-wheat"
              >
                About HNA
              </Link>
            </div>
            <p className="mt-4 text-[0.75rem] text-navy/40 dark:text-wheat/40">
              Free for hackers. Built for North America.
            </p>
          </LandingReveal>
        </div>

        <div className="relative z-10 mx-auto mt-12 grid max-w-[360px] grid-cols-2 gap-2 sm:mt-14 sm:hidden">
          {mobilePolaroids.map((shot, i) => (
            <PolaroidFrame
              key={`mobile-${shot.src}`}
              src={shot.src}
              alt={shot.alt}
              caption={shot.caption}
              className={`w-full ${
                [
                  "rotate-[-8deg] translate-y-1",
                  "rotate-[7deg] -translate-y-2",
                  "rotate-[10deg] -translate-x-1",
                  "rotate-[-6deg] translate-y-2",
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
        aria-labelledby="coverage-heading"
        className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12"
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
              One home for every event — sourced from across the web, submitted
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
                hackathon you actually want to attend in your area — and never
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
        aria-labelledby="features-heading"
        className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12"
      >
        <div className="mx-auto max-w-[1100px]">
          <div className="mx-auto max-w-[28rem] text-center">
            <p className="text-[0.7rem] font-medium tracking-[0.04em] text-rust">
              Product
            </p>
            <h2
              id="features-heading"
              className="mt-3 font-serif text-2xl font-semibold leading-[1.15] tracking-[-0.02em] text-navy sm:text-3xl lg:text-4xl dark:text-wheat"
            >
              Built for the full hackathon cycle
            </h2>
          </div>

          <div className="mt-12 space-y-5 sm:mt-14 sm:space-y-6">
            {features.map((feature, index) => {
              const Visual = feature.Visual;
              const mirrored = index % 2 === 1;

              return (
                <div
                  key={feature.id}
                  className="grid items-center gap-8 rounded-[1.75rem] border border-navy/10 bg-navy/[0.03] p-5 sm:rounded-[2rem] sm:p-7 lg:grid-cols-2 lg:gap-12 lg:p-8 dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <div className={mirrored ? "lg:order-2" : undefined}>
                    <p className="text-[0.7rem] font-medium tracking-[0.04em] text-rust">
                      {feature.eyebrow}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold leading-[1.2] tracking-[-0.02em] text-navy sm:text-2xl dark:text-wheat">
                      {feature.heading}
                    </h3>
                    <p className="mt-3 max-w-[30rem] text-base leading-relaxed text-navy/55 dark:text-wheat/55">
                      {feature.body}
                    </p>
                  </div>

                  <div
                    className={`overflow-hidden rounded-2xl border border-navy/10 dark:border-white/10 ${
                      mirrored ? "lg:order-1" : ""
                    }`}
                  >
                    <Visual />
                  </div>
                </div>
              );
            })}
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

          <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-3 sm:gap-5">
            {audiences.map((audience, i) => (
              <div
                key={audience.label}
                className={`rounded-[1.5rem] border border-navy/10 bg-navy/[0.03] p-6 sm:rounded-[1.75rem] sm:p-7 dark:border-white/10 dark:bg-white/[0.04] ${
                  i === 1 ? "sm:-rotate-1" : i === 2 ? "sm:rotate-1" : ""
                }`}
              >
                <p className="text-[0.7rem] font-medium tracking-[0.04em] text-rust">
                  {audience.label}
                </p>
                <h3 className="mt-3 text-lg font-semibold tracking-tight text-navy sm:text-xl dark:text-wheat">
                  {audience.title}
                </h3>
                <p className="mt-2.5 text-[0.95rem] leading-relaxed text-navy/55 dark:text-wheat/55">
                  {audience.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
