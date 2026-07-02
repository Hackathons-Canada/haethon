import Link from "next/link";
import {
  ArrowRight,
  Building2,
  ClipboardList,
  Maximize2,
  Search,
} from "lucide-react";

const navItems = [
  { label: "About", href: "#about" },
  { label: "FQA", href: "#fqa" },
  { label: "New entry", href: "/submit" },
  { label: "Hackathons", href: "/hackathons" },
];

const navLinkClassName =
  "decoration-[#660000] decoration-1 underline-offset-6 hover:text-[#660000] hover:underline focus-visible:text-[#660000] focus-visible:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#660000]";

const loginLinkClassName =
  "inline-flex min-h-9 items-center justify-center border border-[#660000] px-4 text-[#660000] transition-colors hover:bg-[#660000] hover:text-white focus-visible:bg-[#660000] focus-visible:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#660000]";

const hackathonPlaceholders = [
  "Hackathon 01",
  "Hackathon 02",
  "Hackathon 03",
  "Hackathon 04",
  "Hackathon 05",
  "Hackathon 06",
  "Hackathon 07",
  "Hackathon 08",
];

const audienceCards = [
  {
    title: "Hacker",
    icon: Search,
  },
  {
    title: "Organizer",
    icon: ClipboardList,
  },
  {
    title: "Corporations/business",
    icon: Building2,
  },
];

function CompanyLogoStrip({ hidden = false }: { hidden?: boolean }) {
  return (
    <svg
      aria-hidden={hidden}
      aria-label={
        hidden
          ? undefined
          : "Placeholder company logo strip with Google, Microsoft, Tailscale, Backboard.io, GitHub, Warp, PCBWay, 1Password, and Perplexity"
      }
      className="h-auto w-[1588px] shrink-0"
      fill="none"
      role={hidden ? undefined : "img"}
      viewBox="0 0 1588 46"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="#3F3E3B" fontFamily="Arial, Helvetica, sans-serif">
        <text fontSize="24" fontWeight="700" x="16" y="32">
          Google
        </text>
        <circle cx="122" cy="25" fill="#706F6B" r="3" />
        <text fontSize="24" fontWeight="700" x="166" y="32">
          Microsoft
        </text>
        <circle cx="314" cy="25" fill="#706F6B" r="3" />
        <text fontSize="24" fontWeight="700" x="358" y="32">
          Tailscale
        </text>
        <circle cx="492" cy="25" fill="#706F6B" r="3" />
        <text fontSize="24" fontWeight="700" x="536" y="32">
          Backboard.io
        </text>
        <circle cx="708" cy="25" fill="#706F6B" r="3" />
        <text fontSize="24" fontWeight="700" x="752" y="32">
          GitHub
        </text>
        <circle cx="858" cy="25" fill="#706F6B" r="3" />
        <text fontSize="24" fontWeight="700" x="902" y="32">
          Warp
        </text>
        <circle cx="990" cy="25" fill="#706F6B" r="3" />
        <text fontSize="24" fontWeight="700" x="1034" y="32">
          PCBWay
        </text>
        <circle cx="1160" cy="25" fill="#706F6B" r="3" />
        <text fontSize="24" fontWeight="700" x="1204" y="32">
          1Password
        </text>
        <circle cx="1366" cy="25" fill="#706F6B" r="3" />
        <text fontSize="24" fontWeight="700" x="1410" y="32">
          Perplexity
        </text>
        <circle cx="1572" cy="25" fill="#706F6B" r="3" />
      </g>
    </svg>
  );
}

function HackathonNameStrip({ hidden = false }: { hidden?: boolean }) {
  return (
    <div
      aria-hidden={hidden}
      className="flex shrink-0 items-center gap-8 whitespace-nowrap pr-8 text-lg font-semibold text-[#3F3E3B]"
    >
      {hackathonPlaceholders.map((hackathon) => (
        <span key={hackathon} className="inline-flex items-center gap-8">
          {hackathon}
          <span
            aria-hidden="true"
            className="size-1 rounded-full bg-[#706F6B]"
          />
        </span>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-black">
      <nav
        aria-label="Primary navigation"
        className="border-b border-black/10 bg-white px-5 font-mono text-xs font-medium uppercase tracking-[0.14em] text-[#706F6B] sm:px-8 lg:px-12"
      >
        <div className="mx-auto flex min-h-20 max-w-[1280px] flex-col items-start justify-center gap-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-0">
          <Link
            href="/"
            className={`${navLinkClassName} font-serif text-xl font-semibold normal-case leading-none tracking-normal text-black sm:text-2xl`}
          >
            Hackathons North America
          </Link>

          <div className="flex flex-wrap items-center justify-start gap-x-5 gap-y-3 sm:justify-end sm:gap-x-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={navLinkClassName}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/sign-in" className={loginLinkClassName}>
              Login
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative isolate min-h-[calc(100vh-68px)] overflow-hidden bg-white px-5 pb-36 pt-24 sm:px-8 sm:pb-44 sm:pt-32 md:pb-56 md:pt-44 lg:px-12">
        <div aria-hidden="true" className="hero-aurora" />

        <div className="relative z-10 mx-auto max-w-[1280px]">
          <div className="grid items-end gap-8 md:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <h1 className="max-w-[1120px] text-[2.55rem] font-semibold leading-[1.02] tracking-normal text-black sm:text-[3rem] lg:text-[3.2rem]">
                Search hundreds of upcoming hackathons, build your hacker
                profile, and never miss another application deadline.
              </h1>
              <p className="mt-8 max-w-[640px] text-base leading-6 text-[#706F6B]">
                Filter for hackathons by location, date, and category, track
                your achievements, and stay informed with reminders for
                deadlines and upcoming events.
              </p>
            </div>

            <Link
              href="/hackathons"
              className="inline-flex w-fit items-center gap-3 justify-self-start text-sm font-medium text-[#706F6B] hover:text-[#660000] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#660000]/35 md:mb-1 md:justify-self-end"
            >
              <span className="font-semibold text-[#660000]">New</span>
              <span>Browse events</span>
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4"
                strokeWidth={1.75}
              />
            </Link>
          </div>

          <div className="relative mt-20 sm:mt-24">
            <div className="relative mx-auto h-[74vh] max-h-[760px] min-h-[520px] w-full overflow-hidden rounded-xl border border-black/15 bg-white shadow-[0_34px_110px_rgba(0,0,0,0.14)] sm:min-h-[600px] lg:min-h-[650px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_10%,_rgba(102,0,0,0.05),_rgba(255,255,255,0)_34%)]" />
              <div className="relative grid h-full grid-cols-[18%_1fr_25%] text-[12px] text-[#706F6B]">
                <aside className="border-r border-black/10 bg-[#F8F8F4]/95">
                  <div className="flex h-12 items-center gap-2 border-b border-black/10 px-5">
                    <span
                      aria-hidden="true"
                      className="grid size-4 place-items-center rounded-full bg-[#660000]"
                    >
                      <span className="block size-2.5 rounded-full bg-[linear-gradient(45deg,_#fff_0_18%,_transparent_18%_30%,_#fff_30%_48%,_transparent_48%_60%,_#fff_60%_78%,_transparent_78%)]" />
                    </span>
                    <span className="font-semibold text-black">Hackathons</span>
                  </div>
                  <div className="space-y-3 px-5 py-5">
                    {["Inbox", "My events", "Reviews", "Pulse"].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <span className="size-3 rounded-sm border border-black/20" />
                        <span>{item}</span>
                      </div>
                    ))}
                    <div className="pt-4 text-[#706F6B]/70">Workspace</div>
                    {["Applications", "Projects", "More"].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <span className="size-3 rounded-full border border-black/20" />
                        <span>{item}</span>
                      </div>
                    ))}
                    <div className="pt-4 text-[#706F6B]/70">Favorites</div>
                    <div className="rounded-md bg-[#660000]/8 px-3 py-2 text-[#660000]">
                      Global hackathon map
                    </div>
                  </div>
                </aside>

                <div className="grid grid-rows-[3rem_1fr] border-r border-black/10">
                  <div className="flex items-center justify-between border-b border-black/10 bg-white px-7">
                    <span className="font-semibold text-black">
                      Upcoming deadlines
                    </span>
                    <span className="text-[#706F6B]">02 / 145</span>
                  </div>
                  <div className="bg-white px-16 py-12">
                    <h2 className="text-2xl font-semibold text-black">
                      ETHGlobal New York
                    </h2>
                    <p className="mt-5 max-w-[560px] text-sm leading-6 text-[#706F6B]">
                      Track registration, team status, travel notes, and
                      submission milestones from one calm dashboard.
                    </p>
                    <div className="mt-8 space-y-4">
                      <div className="h-12 rounded-lg border border-black/10 bg-[#F8F8F4]" />
                      <div className="h-12 rounded-lg border border-black/10 bg-[#F8F8F4]" />
                      <div className="h-12 rounded-lg border border-black/10 bg-[#F8F8F4]" />
                    </div>
                  </div>
                </div>

                <div className="bg-white px-8 py-12">
                  <div className="text-[#706F6B]">NA-2703</div>
                  <div className="mt-10 space-y-5">
                    <div>
                      <div className="text-[#706F6B]">Status</div>
                      <div className="mt-2 font-medium text-black">
                        In Progress
                      </div>
                    </div>
                    <div>
                      <div className="text-[#706F6B]">Priority</div>
                      <div className="mt-2 font-medium text-black">High</div>
                    </div>
                    <div>
                      <div className="text-[#706F6B]">Owner</div>
                      <div className="mt-2 font-medium text-black">jori</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-4 h-1 w-10 rounded-full border border-black/35 bg-white" />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="company-network-heading"
        className="bg-white px-5 pb-16 pt-20 text-left sm:px-8 sm:pb-20 sm:pt-24 lg:px-12"
      >
        <div className="mx-auto max-w-[1160px]">
          <h2
            id="company-network-heading"
            className="text-sm font-medium tracking-normal text-[#706F6B]"
          >
            Companies we&apos;ve worked with
          </h2>

          <div className="company-marquee mt-7 overflow-hidden py-1">
            <div className="company-marquee-track flex w-max items-center">
              <CompanyLogoStrip />
              <CompanyLogoStrip hidden />
            </div>
          </div>

          <div className="mt-7">
            <h2 className="text-sm font-medium tracking-normal text-[#706F6B]">
              Hackathons we track
            </h2>
            <div className="company-marquee mt-7 overflow-hidden py-1">
              <div className="company-marquee-track flex w-max items-center">
                <HackathonNameStrip />
                <HackathonNameStrip hidden />
              </div>
            </div>
          </div>

          <div className="mt-24 text-left">
            <div className="mx-auto max-w-[1060px]">
              <h2 className="max-w-[760px] text-[0.9375rem] font-semibold leading-[1.25] tracking-normal text-black sm:text-lg lg:text-[1.325rem]">
                Built for hackers, organizers, and sponsors alike. Discover
                hackathons, grow your hacker profile, organize better events
                with proven resources, and connect companies with the next
                generation of builders—all from a single platform.
              </h2>
            </div>

            <div className="mx-auto mt-10 grid max-w-[1060px] gap-4 md:grid-cols-[1.95fr_1fr]">
              <article className="relative min-h-[460px] overflow-hidden rounded border border-black/10 bg-white p-5 text-left shadow-[0_18px_54px_rgba(0,0,0,0.06)] sm:p-7">
                <div className="relative z-10 flex items-start justify-between gap-4">
                  <h3 className="max-w-[420px] text-2xl font-semibold leading-tight text-black sm:text-[1.7rem]">
                    {audienceCards[0].title}
                  </h3>
                  <div className="flex size-9 shrink-0 items-center justify-center rounded bg-[#660000] text-white">
                    <Maximize2
                      aria-hidden="true"
                      className="size-4"
                      strokeWidth={1.75}
                    />
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-[64%] bg-[linear-gradient(135deg,_rgba(102,0,0,0.08),_rgba(248,248,244,0.95)_34%,_rgba(102,0,0,0.28)_70%,_rgba(112,111,107,0.2))]" />
                <div className="absolute bottom-8 left-8 z-10 hidden w-[27%] rounded-[1.45rem] border-[10px] border-black bg-white p-4 shadow-[0_24px_50px_rgba(0,0,0,0.2)] sm:block">
                  <div className="mx-auto mb-8 size-3 rounded-full bg-black/80" />
                  <div className="space-y-2 text-center">
                    <div className="mx-auto size-8 rounded-full border border-black/15" />
                    <div className="text-xs text-[#706F6B]">Profile</div>
                    <div className="text-2xl font-semibold text-black">87%</div>
                  </div>
                  <div className="mt-9 space-y-2">
                    <div className="h-2 rounded bg-black/10" />
                    <div className="h-2 w-3/4 rounded bg-black/10" />
                    <div className="h-9 rounded bg-[#660000]" />
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 z-10 w-[76%] rounded-tl-xl border border-black/10 bg-white shadow-[0_22px_64px_rgba(0,0,0,0.12)]">
                  <div className="flex h-10 items-center gap-2 border-b border-black/10 px-5">
                    <span className="size-2 rounded-full bg-black/15" />
                    <span className="size-2 rounded-full bg-black/15" />
                    <span className="size-2 rounded-full bg-black/15" />
                    <span className="ml-auto h-5 w-40 rounded-full bg-[#F8F8F4]" />
                  </div>
                  <div className="grid min-h-[250px] grid-cols-[1.08fr_0.92fr] text-xs text-[#706F6B]">
                    <div className="space-y-4 border-r border-black/10 p-7">
                      <div className="h-8 rounded bg-[#F8F8F4]" />
                      <div className="h-8 rounded bg-[#F8F8F4]" />
                      <div className="h-8 rounded bg-[#660000]" />
                      <div className="h-8 rounded bg-[#F8F8F4]" />
                      <div className="h-8 rounded bg-[#F8F8F4]" />
                    </div>
                    <div className="p-7">
                      <div className="h-20 rounded border border-black/10 bg-[#F8F8F4]" />
                      <div className="mt-6 space-y-3">
                        <div className="h-2 rounded bg-black/10" />
                        <div className="h-2 w-5/6 rounded bg-black/10" />
                        <div className="h-2 w-2/3 rounded bg-black/10" />
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              <article className="relative min-h-[460px] overflow-hidden rounded border border-black/10 bg-white p-5 text-left shadow-[0_18px_54px_rgba(0,0,0,0.06)] sm:p-7">
                <div className="relative z-10 flex items-start justify-between gap-4">
                  <h3 className="text-2xl font-semibold leading-tight text-black sm:text-[1.7rem]">
                    {audienceCards[1].title}
                  </h3>
                  <div className="flex size-9 shrink-0 items-center justify-center rounded bg-[#660000]/8 text-[#660000]">
                    <Maximize2
                      aria-hidden="true"
                      className="size-4"
                      strokeWidth={1.75}
                    />
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-[58%] bg-[linear-gradient(145deg,_rgba(248,248,244,0.9),_rgba(102,0,0,0.2)_58%,_rgba(112,111,107,0.14))]" />
                <div className="relative z-10 mt-20 space-y-4">
                  <div className="rounded border border-black/10 bg-white p-4 shadow-[0_20px_44px_rgba(0,0,0,0.08)]">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded bg-[#660000]/8 text-[#660000]">
                        <ClipboardList
                          aria-hidden="true"
                          className="size-4"
                          strokeWidth={1.75}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 w-24 rounded bg-black/20" />
                        <div className="h-2 w-16 rounded bg-black/10" />
                      </div>
                    </div>
                    <div className="mt-5 h-2 rounded-full bg-[#F8F8F4]">
                      <div className="h-full w-2/3 rounded-full bg-[#660000]" />
                    </div>
                  </div>
                  <div className="rounded border border-black/10 bg-white p-4 shadow-[0_20px_44px_rgba(0,0,0,0.08)]">
                    <div className="text-xs font-medium text-[#706F6B]">
                      Upcoming tasks
                    </div>
                    <div className="mt-5 flex h-28 items-end gap-2">
                      {[32, 48, 64, 42, 78, 56, 92, 68, 52, 74].map(
                        (height) => (
                          <span
                            key={height}
                            className="flex-1 rounded-t bg-[#660000]/55"
                            style={{ height: `${height}%` }}
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>
              </article>

              <article className="relative min-h-[178px] overflow-hidden rounded border border-black/10 bg-white p-5 text-left shadow-[0_18px_54px_rgba(0,0,0,0.06)] sm:p-7 md:col-span-2">
                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold leading-tight text-black sm:text-[1.7rem]">
                      {audienceCards[2].title}
                    </h3>
                    <div className="mt-8 grid max-w-[560px] grid-cols-3 gap-3">
                      <div className="h-16 rounded border border-black/10 bg-white/80" />
                      <div className="h-16 rounded border border-black/10 bg-white/80" />
                      <div className="h-16 rounded border border-black/10 bg-white/80" />
                    </div>
                  </div>
                  <div className="flex size-9 shrink-0 items-center justify-center rounded bg-[#660000]/8 text-[#660000]">
                    <Maximize2
                      aria-hidden="true"
                      className="size-4"
                      strokeWidth={1.75}
                    />
                  </div>
                </div>
                <div className="absolute inset-y-0 right-0 w-[55%] bg-[linear-gradient(110deg,_rgba(255,255,255,0),_rgba(102,0,0,0.14)_46%,_rgba(248,248,244,0.95))]" />
                <div className="absolute bottom-0 right-12 hidden h-[78%] w-[34%] items-end gap-2 md:flex">
                  {[58, 38, 74, 46, 88, 64, 52, 80, 44, 68, 92, 60].map(
                    (height) => (
                      <span
                        key={height}
                        className="flex-1 rounded-t bg-[#660000]/45"
                        style={{ height: `${height}%` }}
                      />
                    )
                  )}
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
