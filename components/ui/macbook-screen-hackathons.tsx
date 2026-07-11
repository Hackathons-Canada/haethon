"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  CircleUser,
  Compass,
  Globe2,
  LayoutDashboard,
  MapPin,
  PlusSquare,
  Search,
  Settings2,
  ShieldCheck,
  Settings,
} from "lucide-react";

import { HackathonCard, type HackathonCardData } from "@/components/hackathon-card";
import { regionPresets } from "@/lib/hackathons/region-presets";

// The /hackathons screen re-rendered on a fixed desktop canvas and scaled to
// fit the MacBook display. It mirrors AppSidebar and HackathonSearch at their
// desktop breakpoints (hardcoded — viewport breakpoints don't apply inside
// the scaled canvas) and reuses the real HackathonCard in preview mode.
const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 800;
// Content renders slightly under full size and is centered, leaving a white
// margin between the app and the screen's rounded corners.
const CONTENT_SCALE = 0.95;

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { active: true, icon: Compass, label: "Hackathons DB" },
  { icon: CalendarDays, label: "My Hackathons" },
  { icon: CircleUser, label: "Hacker Profile" },
  { icon: Settings, label: "Account Settings" },
  { icon: ShieldCheck, label: "Admin" },
];

const sampleHackathons: HackathonCardData[] = [
  {
    date: "Mar 30-Jul 18, 2026",
    description: "Preview card",
    duration: "Online event",
    id: "preview-hoobit-hacks",
    isSaved: true,
    location: "Online",
    name: "Hoobit Hacks 2026",
    userVote: 0,
    voteScore: 0,
  },
  {
    date: "May 4-Aug 1, 2026",
    description: "Preview card",
    duration: "Online event",
    id: "preview-assistive-innovation",
    isSaved: false,
    location: "Online",
    name: "Assistive Innovation Challenge 2026",
    userVote: 1,
    voteScore: 1,
  },
  {
    date: "May 19-Aug 17, 2026",
    description: "Preview card",
    duration: "Online event",
    id: "preview-build-with-gemini",
    isSaved: false,
    location: "Online",
    name: "Build with Gemini XPRIZE",
    userVote: 0,
    voteScore: 0,
  },
  {
    date: "May 20-Jul 13, 2026",
    description: "Preview card",
    duration: "Online event",
    id: "preview-slack-agent-builder",
    isSaved: false,
    location: "Online",
    name: "Slack Agent Builder Challenge",
    userVote: 0,
    voteScore: 0,
  },
  {
    date: "May 22-Sep 5, 2026",
    description: "Preview card",
    duration: "Online event",
    id: "preview-volthacks",
    isSaved: false,
    location: "Online",
    name: "VoltHacks",
    userVote: 0,
    voteScore: 0,
  },
  {
    date: "Jun 4-Aug 14, 2026",
    description: "Preview card",
    duration: "Online event",
    id: "preview-arm-create",
    isSaved: false,
    location: "Online",
    name: "Arm Create: AI Optimization Challenge",
    userVote: 0,
    voteScore: 0,
  },
];

const filterCellClassName =
  "flex min-h-[4.2rem] min-w-0 flex-col justify-start rounded-[2rem] px-6 py-3 text-left";

function FilterCellLabel({
  children,
  icon: Icon,
}: {
  children: string;
  icon?: typeof Globe2;
}) {
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold leading-5 text-navy">
      {Icon ? <Icon aria-hidden="true" className="size-3.5" /> : null}
      {children}
    </span>
  );
}

function AppFrame() {
  return (
    <div className="flex h-full w-full overflow-hidden bg-white text-left text-navy">
      <aside className="w-64 shrink-0 border-r border-navy/10 bg-white">
        <div className="px-5 pt-5">
          <span className="font-serif text-2xl font-semibold leading-none text-navy">
            HNA
          </span>
        </div>
        <nav className="mt-6 flex flex-col gap-1 px-3">
          {sidebarItems.map(({ active, icon: Icon, label }) => (
            <span
              className={`inline-flex min-h-10 shrink-0 items-center gap-3 rounded-lg px-3 text-sm font-semibold ${
                active ? "bg-cabernet text-wheat" : "text-navy/70"
              }`}
              key={label}
            >
              <Icon aria-hidden="true" className="size-4" />
              {label}
            </span>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <section className="bg-white px-5 pb-4 pt-8">
          <div className="mx-auto max-w-[1120px]">
            <div className="relative mb-5 flex items-center justify-center">
              <div className="flex items-end gap-12">
                {regionPresets.map((preset) => (
                  <span
                    className="flex flex-col items-center gap-1.5 pb-2"
                    key={preset.id}
                  >
                    <span aria-hidden="true" className="text-2xl leading-none">
                      {preset.emoji}
                    </span>
                    <span className="text-sm text-navy/55">{preset.label}</span>
                    <span className="h-0.5 w-full rounded-full bg-transparent" />
                  </span>
                ))}
              </div>
              <span className="absolute right-0 inline-flex min-h-10 items-center gap-2 rounded-full border border-navy/15 px-4 text-sm font-semibold text-navy">
                <PlusSquare aria-hidden="true" className="size-4" />
                New entry
              </span>
            </div>

            <div className="relative z-30 flex flex-row items-stretch rounded-[2.35rem] border border-navy/10 bg-white p-2 shadow-[0_10px_36px_rgba(0,0,0,0.14)]">
              <div className={`${filterCellClassName} flex-1`}>
                <span className="text-xs font-semibold leading-5 text-navy">Name</span>
                <span className="text-sm leading-5 text-navy/55">Hackathon name</span>
              </div>
              <div className={`${filterCellClassName} flex-[1.25]`}>
                <FilterCellLabel icon={Globe2}>Countries</FilterCellLabel>
                <span className="mt-1 text-sm leading-5 text-navy/55">
                  Search countries
                </span>
              </div>
              <div className={`${filterCellClassName} flex-1`}>
                <FilterCellLabel icon={CalendarDays}>Date</FilterCellLabel>
                <span className="mt-1 block truncate text-sm leading-5 text-navy/55">
                  Any date
                </span>
              </div>
              <div className={`${filterCellClassName} flex-1 bg-ivory`}>
                <FilterCellLabel icon={MapPin}>Format</FilterCellLabel>
                <span className="mt-1 block truncate text-sm leading-5 text-navy/55">
                  Any format
                </span>
              </div>
              <div className={`${filterCellClassName} flex-[1.5]`}>
                <FilterCellLabel icon={Settings2}>Features</FilterCellLabel>
                <span className="mt-1 block truncate text-sm leading-5 text-navy/55">
                  Add features
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2">
                <span className="grid size-12 place-items-center rounded-full bg-cabernet text-wheat">
                  <Search aria-hidden="true" className="size-5" strokeWidth={2.5} />
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="px-12 pt-6">
          <div className="mx-auto max-w-[1120px]">
            <div className="mb-4">
              <h1 className="text-4xl font-semibold tracking-normal text-navy">
                Upcoming hackathons
              </h1>
            </div>
            <div className="grid grid-cols-3 gap-x-6 gap-y-6">
              {sampleHackathons.map((hackathon, index) => (
                <HackathonCard
                  hackathon={hackathon}
                  index={index}
                  key={hackathon.id}
                  preview
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export function MacbookScreenHackathons() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const update = () =>
      setScale((element.clientWidth / DESIGN_WIDTH) * CONTENT_SCALE);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative h-full w-full select-none overflow-hidden bg-white"
      ref={containerRef}
    >
      <div
        style={{
          height: DESIGN_HEIGHT,
          left: "50%",
          position: "absolute",
          top: "50%",
          transform: `translate(-50%, -50%) scale(${scale ?? 0})`,
          visibility: scale === null ? "hidden" : undefined,
          width: DESIGN_WIDTH,
        }}
      >
        <AppFrame />
      </div>
    </div>
  );
}
