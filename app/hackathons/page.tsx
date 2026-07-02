import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Code2,
  Heart,
  MapPin,
  Minus,
  Plus,
  Search,
  Sparkles,
  Star,
  Trophy,
  Users,
} from "lucide-react";

import { NavAuthLink } from "@/components/nav-auth-link";

export const metadata: Metadata = {
  title: "Hackathons | Hackathons North America",
  description: "Browse upcoming hackathons across North America.",
};

const navItems = [
  { label: "About", href: "/#about" },
  { label: "FQA", href: "/#fqa" },
  { label: "Submit", href: "/submit" },
  { label: "Hackathons", href: "/hackathons" },
];

const navLinkClassName =
  "decoration-[#660000] decoration-1 underline-offset-6 hover:text-[#660000] hover:underline focus-visible:text-[#660000] focus-visible:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#660000]";

const loginLinkClassName =
  "inline-flex min-h-9 items-center justify-center border border-[#660000] px-4 text-[#660000] transition-colors hover:bg-[#660000] hover:text-white focus-visible:bg-[#660000] focus-visible:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#660000]";

const locationSuggestions = [
  {
    city: "Toronto, Ontario",
    detail: "Strong university and startup scene",
  },
  {
    city: "New York, New York",
    detail: "Major in-person and hybrid events",
  },
  {
    city: "San Francisco, California",
    detail: "AI, infra, and developer tools",
  },
  {
    city: "Montreal, Quebec",
    detail: "Creative coding and applied research",
  },
  {
    city: "Austin, Texas",
    detail: "Builder weekends and sponsor tracks",
  },
];

const dateRangePills = [
  "Exact dates",
  "1 day",
  "+/- 1 day",
  "2 days",
  "+/- 2 days",
  "3 days",
  "+/- 3 days",
  "7 days",
];

const themes = [
  {
    icon: Sparkles,
    name: "AI and agents",
    detail: "Model apps, evals, automation",
  },
  {
    icon: Code2,
    name: "Developer tools",
    detail: "Infra, APIs, cloud, DX",
  },
  {
    icon: Trophy,
    name: "Social impact",
    detail: "Climate, civic tech, health",
  },
  {
    icon: Users,
    name: "Student friendly",
    detail: "Mentors, beginner tracks",
  },
];

const teamRows = [
  {
    label: "Participants",
    detail: "People on your team",
    value: "0",
  },
  {
    label: "Experience",
    detail: "Beginner to advanced",
    value: "Any",
  },
  {
    label: "Team size",
    detail: "Solo or group builds",
    value: "Any",
  },
];

const hackathons = [
  {
    name: "Hack the North",
    description: "Canada's flagship student hackathon for hardware, software, and ambitious weekend builds.",
    location: "Waterloo, ON",
    date: "Sep 13-15, 2026",
    rating: "5.0",
    reviews: "142",
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80",
    featured: true,
  },
  {
    name: "ETHGlobal New York",
    description: "A high-energy web3 builder weekend with protocol sponsors, workshops, and demo day.",
    location: "New York, NY",
    date: "Aug 21-23, 2026",
    rating: "4.98",
    reviews: "88",
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80",
    featured: true,
  },
  {
    name: "AI Builders Weekend",
    description: "Prototype agent workflows, eval harnesses, and product-ready AI features with mentors.",
    location: "San Francisco, CA",
    date: "Jul 24-26, 2026",
    rating: "4.96",
    reviews: "73",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80",
    featured: false,
  },
  {
    name: "Climate Code Sprint",
    description: "Build practical climate data tools for cities, nonprofits, and community organizers.",
    location: "Vancouver, BC",
    date: "Oct 3-4, 2026",
    rating: "4.92",
    reviews: "51",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80",
    featured: true,
  },
  {
    name: "HealthTech Jam",
    description: "A focused hackathon for patient tools, clinical workflow ideas, and responsible prototypes.",
    location: "Boston, MA",
    date: "Nov 7-8, 2026",
    rating: "4.89",
    reviews: "64",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80",
    featured: false,
  },
  {
    name: "Open Source Launchpad",
    description: "Contribute to maintained projects, ship pull requests, and learn with senior maintainers.",
    location: "Austin, TX",
    date: "Aug 8-9, 2026",
    rating: "4.94",
    reviews: "39",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80",
    featured: false,
  },
  {
    name: "Fintech Forge",
    description: "Teams build secure payment, budgeting, and risk analysis products for real-world use cases.",
    location: "Chicago, IL",
    date: "Sep 26-27, 2026",
    rating: "4.87",
    reviews: "46",
    image:
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=900&q=80",
    featured: true,
  },
  {
    name: "GameDev Night Market",
    description: "A playful weekend for indie game prototypes, custom controllers, and local multiplayer demos.",
    location: "Montreal, QC",
    date: "Jul 31-Aug 2, 2026",
    rating: "4.91",
    reviews: "58",
    image:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=900&q=80",
    featured: false,
  },
  {
    name: "Civic Data Hack",
    description: "Create transparent data tools for housing, transit, public budgets, and community services.",
    location: "Washington, DC",
    date: "Oct 17-18, 2026",
    rating: "4.85",
    reviews: "33",
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=80",
    featured: false,
  },
  {
    name: "Robotics Sprint",
    description: "Prototype robotics software, sensing workflows, and human-in-the-loop interfaces.",
    location: "Pittsburgh, PA",
    date: "Sep 5-7, 2026",
    rating: "4.93",
    reviews: "44",
    image:
      "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=900&q=80",
    featured: true,
  },
  {
    name: "Design Systems Hack",
    description: "Build UI libraries, accessibility tooling, and polished product surfaces in a fast sprint.",
    location: "Seattle, WA",
    date: "Nov 14-15, 2026",
    rating: "4.9",
    reviews: "27",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80",
    featured: false,
  },
  {
    name: "Student Startup Weekend",
    description: "A founder-focused hackathon for MVPs, customer discovery, pitch coaching, and demos.",
    location: "Atlanta, GA",
    date: "Aug 29-30, 2026",
    rating: "4.88",
    reviews: "61",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    featured: false,
  },
  {
    name: "Data Viz Derby",
    description: "Turn public datasets into clear visual stories, dashboards, and interactive reporting tools.",
    location: "Denver, CO",
    date: "Oct 24-25, 2026",
    rating: "4.86",
    reviews: "29",
    image:
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=900&q=80",
    featured: true,
  },
  {
    name: "Secure by Design",
    description: "A security-first event for threat modeling, privacy tooling, and safer developer workflows.",
    location: "Portland, OR",
    date: "Dec 5-6, 2026",
    rating: "4.95",
    reviews: "35",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80",
    featured: false,
  },
  {
    name: "Hardware House",
    description: "Weekend builds around sensors, embedded systems, rapid prototyping, and physical computing.",
    location: "San Jose, CA",
    date: "Sep 19-20, 2026",
    rating: "4.84",
    reviews: "48",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
    featured: false,
  },
  {
    name: "Education Apps Lab",
    description: "Build learning tools, classroom workflows, and student support products with educators.",
    location: "Philadelphia, PA",
    date: "Nov 21-22, 2026",
    rating: "4.82",
    reviews: "31",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
    featured: false,
  },
  {
    name: "Cloud Native Challenge",
    description: "Ship scalable services, observability dashboards, and deployment automation in teams.",
    location: "Raleigh, NC",
    date: "Oct 10-11, 2026",
    rating: "4.9",
    reviews: "52",
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80",
    featured: true,
  },
  {
    name: "Creative Coding Camp",
    description: "A mixed media hackathon for interactive visuals, audio tools, generative art, and web demos.",
    location: "Los Angeles, CA",
    date: "Dec 12-13, 2026",
    rating: "4.87",
    reviews: "42",
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=80",
    featured: false,
  },
];

type SearchFieldProps = {
  children: React.ReactNode;
  label: string;
  panelClassName?: string;
  value: string;
};

function SearchField({
  children,
  label,
  panelClassName = "",
  value,
}: SearchFieldProps) {
  return (
    <details className="group relative min-w-0 flex-1" name="hackathon-search">
      <summary className="flex h-full min-h-[4.2rem] cursor-pointer list-none flex-col justify-center rounded-[2rem] px-6 py-3 text-left outline-none hover:bg-[#F7F7F4] focus-visible:bg-[#F7F7F4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#660000]/35 group-open:bg-[#F7F7F4] [&::-webkit-details-marker]:hidden">
        <span className="text-xs font-semibold leading-5 text-black">
          {label}
        </span>
        <span className="truncate text-sm leading-5 text-[#706F6B]">
          {value}
        </span>
      </summary>
      <div
        className={`z-50 mt-3 hidden rounded-[2rem] border border-black/10 bg-white p-4 text-black shadow-[0_18px_60px_rgba(0,0,0,0.18)] group-open:block md:absolute md:top-full ${panelClassName}`}
      >
        {children}
      </div>
    </details>
  );
}

function WhereDropdown() {
  return (
    <div className="w-full md:w-[360px]">
      <p className="px-2 pb-3 text-sm font-semibold">Suggested locations</p>
      <div className="space-y-1">
        {locationSuggestions.map((suggestion) => (
          <button
            className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left hover:bg-[#F7F7F4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#660000]/35"
            key={suggestion.city}
            type="button"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-[#F7F7F4] text-[#660000]">
              <MapPin aria-hidden="true" className="size-5" strokeWidth={2} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                {suggestion.city}
              </span>
              <span className="block truncate text-sm text-[#706F6B]">
                {suggestion.detail}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MonthGrid({
  days,
  month,
  offset,
}: {
  days: number;
  month: string;
  offset: number;
}) {
  return (
    <div>
      <h3 className="mb-4 text-center text-sm font-semibold">{month}</h3>
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-[#706F6B]">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
          <span className="py-2" key={`${month}-${day}-${index}`}>
            {day}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-sm">
        {Array.from({ length: offset }).map((_, index) => (
          <span aria-hidden="true" key={`${month}-blank-${index}`} />
        ))}
        {Array.from({ length: days }).map((_, index) => {
          const day = index + 1;
          const isHighlighted =
            (month === "July 2026" && day >= 24 && day <= 26) ||
            (month === "August 2026" && day >= 21 && day <= 23);

          return (
            <button
              className={`mx-auto grid size-9 place-items-center rounded-full hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#660000]/35 ${
                isHighlighted ? "bg-black text-white" : "text-black"
              }`}
              key={`${month}-${day}`}
              type="button"
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WhenDropdown() {
  return (
    <div className="w-full md:w-[680px]">
      <div className="mx-auto mb-5 grid w-fit grid-cols-2 rounded-full bg-[#F7F7F4] p-1 text-sm font-semibold">
        <button className="rounded-full bg-white px-8 py-2 shadow-sm" type="button">
          Dates
        </button>
        <button className="rounded-full px-8 py-2 text-[#706F6B]" type="button">
          Flexible
        </button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <MonthGrid days={31} month="July 2026" offset={3} />
        <MonthGrid days={31} month="August 2026" offset={6} />
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {dateRangePills.map((range, index) => (
          <button
            className={`shrink-0 rounded-full border px-4 py-2 text-sm ${
              index === 0
                ? "border-black bg-black text-white"
                : "border-black/15 text-black hover:border-black"
            }`}
            key={range}
            type="button"
          >
            {range}
          </button>
        ))}
      </div>
    </div>
  );
}

function ThemeDropdown() {
  return (
    <div className="w-full md:w-[420px]">
      <p className="px-2 pb-3 text-sm font-semibold">Browse by track</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {themes.map((theme) => (
          <button
            className="rounded-2xl border border-black/10 p-4 text-left hover:border-black hover:bg-[#F7F7F4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#660000]/35"
            key={theme.name}
            type="button"
          >
            <theme.icon
              aria-hidden="true"
              className="mb-4 size-5 text-[#660000]"
              strokeWidth={2}
            />
            <span className="block text-sm font-semibold">{theme.name}</span>
            <span className="mt-1 block text-sm leading-5 text-[#706F6B]">
              {theme.detail}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TeamDropdown() {
  return (
    <div className="w-full md:w-[420px]">
      {teamRows.map((row, index) => (
        <div
          className={`flex items-center justify-between gap-6 py-4 ${
            index === 0 ? "" : "border-t border-black/10"
          }`}
          key={row.label}
        >
          <div>
            <h3 className="text-sm font-semibold">{row.label}</h3>
            <p className="mt-1 text-sm text-[#706F6B]">{row.detail}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              aria-label={`Decrease ${row.label}`}
              className="grid size-8 place-items-center rounded-full border border-black/20 text-[#706F6B]"
              type="button"
            >
              <Minus aria-hidden="true" className="size-3.5" />
            </button>
            <span className="min-w-8 text-center text-sm">{row.value}</span>
            <button
              aria-label={`Increase ${row.label}`}
              className="grid size-8 place-items-center rounded-full border border-black text-black"
              type="button"
            >
              <Plus aria-hidden="true" className="size-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchNavigation() {
  return (
    <section aria-label="Hackathon filters" className="bg-white px-5 py-5">
      <div className="mx-auto max-w-[1080px]">
        <div className="relative z-30 flex flex-col rounded-[2.35rem] border border-black/10 bg-white p-2 shadow-[0_10px_36px_rgba(0,0,0,0.14)] md:flex-row md:items-stretch md:divide-x md:divide-black/10">
          <SearchField
            label="Where"
            panelClassName="md:left-0"
            value="Search destinations"
          >
            <WhereDropdown />
          </SearchField>

          <SearchField
            label="When"
            panelClassName="md:left-1/2 md:-translate-x-1/2"
            value="Add dates"
          >
            <WhenDropdown />
          </SearchField>

          <SearchField
            label="Theme"
            panelClassName="md:left-1/2 md:-translate-x-1/2"
            value="Choose a track"
          >
            <ThemeDropdown />
          </SearchField>

          <SearchField
            label="Team"
            panelClassName="md:right-0"
            value="Add builders"
          >
            <TeamDropdown />
          </SearchField>

          <div className="flex items-center px-2 py-2 md:px-3">
            <button
              aria-label="Search hackathons"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#D9043D] px-5 text-sm font-semibold text-white hover:bg-[#B80033] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#660000]/35 md:size-12 md:min-h-0 md:px-0"
              type="button"
            >
              <Search aria-hidden="true" className="size-5" strokeWidth={2.5} />
              <span className="md:sr-only">Search</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function HackathonCard({
  hackathon,
  index,
}: {
  hackathon: (typeof hackathons)[number];
  index: number;
}) {
  return (
    <article className="group min-w-0">
      <div className="relative aspect-[1.08] overflow-hidden rounded-[1.35rem] bg-[#F7F7F4]">
        <Image
          alt={`${hackathon.name} venue preview`}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          fill
          priority={index < 3}
          sizes="(min-width: 1024px) 347px, (min-width: 640px) 50vw, 100vw"
          src={hackathon.image}
        />
        {hackathon.featured ? (
          <div className="absolute left-3 top-3 inline-flex max-w-[calc(100%-4.75rem)] items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-black shadow-sm">
            <Trophy
              aria-hidden="true"
              className="size-4 shrink-0 text-[#B8860B]"
              strokeWidth={2.25}
            />
            <span className="truncate">Hacker favourite</span>
          </div>
        ) : null}
        <button
          aria-label={`Save ${hackathon.name}`}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.45)] hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          type="button"
        >
          <Heart
            aria-hidden="true"
            className="size-6 fill-black/15"
            strokeWidth={2.25}
          />
        </button>
        <div
          aria-hidden="true"
          className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5"
        >
          <span className="size-1.5 rounded-full bg-white" />
          <span className="size-1.5 rounded-full bg-white/70" />
          <span className="size-1.5 rounded-full bg-white/70" />
        </div>
      </div>

      <div className="mt-3 space-y-1 text-[15px] leading-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="min-w-0 truncate font-semibold text-black">
            {hackathon.name}
          </h2>
          <div className="flex shrink-0 items-center gap-1 text-sm text-black">
            <Star aria-hidden="true" className="size-3 fill-black" />
            <span>
              {hackathon.rating} ({hackathon.reviews})
            </span>
          </div>
        </div>
        <p className="line-clamp-2 text-[#706F6B]">{hackathon.description}</p>
        <p className="text-[#706F6B]">48 hours · mentors · demo day</p>
        <p className="pt-1 font-semibold text-black underline underline-offset-2">
          {hackathon.location} · {hackathon.date}
        </p>
      </div>
    </article>
  );
}

export default function HackathonsPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-white">
        <nav
          aria-label="Primary navigation"
          className="px-8 font-mono text-xs font-medium uppercase tracking-[0.14em] text-[#706F6B] sm:px-14 lg:px-20"
        >
          <div className="mx-auto flex min-h-20 max-w-[1120px] flex-col items-start justify-center gap-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-0">
            <Link
              className={`${navLinkClassName} font-serif text-xl font-semibold normal-case leading-none tracking-normal text-black sm:text-2xl`}
              href="/"
            >
              Hackathons North America
            </Link>

            <div className="flex flex-wrap items-center justify-start gap-x-5 gap-y-3 sm:justify-end sm:gap-x-8">
              {navItems.map((item) => (
                <Link
                  aria-current={item.href === "/hackathons" ? "page" : undefined}
                  className={`${navLinkClassName} ${
                    item.href === "/hackathons" ? "text-[#660000] underline" : ""
                  }`}
                  href={item.href}
                  key={item.label}
                >
                  {item.label}
                </Link>
              ))}
              <NavAuthLink className={loginLinkClassName} />
            </div>
          </div>
        </nav>

        <SearchNavigation />
      </header>

      <section className="px-5 pb-16 pt-9 sm:px-8 sm:pb-20 lg:px-12">
        <div className="mx-auto max-w-[1120px]">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-[#706F6B]">
                Upcoming hackathons
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-normal text-black sm:text-3xl">
                Browse events
              </h1>
            </div>
            <p className="hidden text-sm text-[#706F6B] sm:block">
              {hackathons.length} test events
            </p>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {hackathons.map((hackathon, index) => (
              <HackathonCard
                hackathon={hackathon}
                index={index}
                key={`${hackathon.name}-${hackathon.date}`}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
