import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import { ArrowLeft, ArrowUpRight, BellRing, CalendarDays, Landmark, MapPin, Trophy } from "lucide-react";

import { HackathonStatusTracker } from "@/components/hackathon-status-tracker";
import { getCurrentUserRecord } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  hackathonDates,
  hackathonLocations,
  hackathonTags,
  hackathons,
  organizations,
  reminders,
  tags,
  userHackathons,
} from "@/lib/db/schema";
import { buildBadges, formatDateRange, formatDuration, formatLocation } from "@/lib/hackathons/card-format";
import { formatReminderDate, reminderTypeLabels } from "@/lib/hackathons/reminder-labels";

const publicStatuses = ["upcoming", "live", "completed"] as const;

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getHackathon(slug: string) {
  const [row] = await db
    .select({
      id: hackathons.id,
      name: hackathons.name,
      shortDescription: hackathons.shortDescription,
      websiteUrl: hackathons.websiteUrl,
      imageUrl: hackathons.imageUrl,
      applicationUrl: hackathons.applicationUrl,
      venue: hackathons.venue,
      format: hackathons.format,
      status: hackathons.status,
      beginnerFriendly: hackathons.beginnerFriendly,
      travelReimbursement: hackathons.travelReimbursement,
      prizeAmountUsd: hackathons.prizeAmountUsd,
      organizationName: organizations.name,
      city: hackathonLocations.city,
      region: hackathonLocations.region,
      country: hackathonLocations.country,
      startsAt: hackathonDates.startsAt,
      endsAt: hackathonDates.endsAt,
      applicationOpensAt: hackathonDates.applicationOpensAt,
      applicationClosesAt: hackathonDates.applicationClosesAt,
      acceptanceAt: hackathonDates.acceptanceAt,
    })
    .from(hackathons)
    .leftJoin(organizations, eq(organizations.id, hackathons.organizationId))
    .leftJoin(hackathonLocations, eq(hackathonLocations.hackathonId, hackathons.id))
    .leftJoin(hackathonDates, eq(hackathonDates.hackathonId, hackathons.id))
    .where(
      and(eq(hackathons.slug, slug), isNotNull(hackathons.publishedAt), inArray(hackathons.status, publicStatuses))
    )
    .limit(1);

  return row ?? null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const hackathon = await getHackathon(slug);

  if (!hackathon) {
    return { title: "Hackathon not found | Hackathons North America" };
  }

  return {
    title: `${hackathon.name} | Hackathons North America`,
    description: hackathon.shortDescription ?? `Dates, deadlines, and details for ${hackathon.name}.`,
  };
}

function formatDeadline(date: Date | null) {
  if (!date) {
    return "TBA";
  }

  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(
    date
  );
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

const factLabelClassName = "font-mono text-xs font-medium uppercase tracking-[0.14em] text-[#706F6B]";

export default async function HackathonDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [hackathon, user] = await Promise.all([getHackathon(slug), getCurrentUserRecord()]);

  if (!hackathon) {
    notFound();
  }

  const [tagRows, [tracked], upcomingReminders] = await Promise.all([
    db
      .select({ name: tags.name })
      .from(hackathonTags)
      .innerJoin(tags, eq(tags.id, hackathonTags.tagId))
      .where(eq(hackathonTags.hackathonId, hackathon.id)),
    user
      ? db
          .select({ applicationStatus: userHackathons.applicationStatus })
          .from(userHackathons)
          .where(and(eq(userHackathons.userId, user.id), eq(userHackathons.hackathonId, hackathon.id)))
          .limit(1)
      : Promise.resolve([] as { applicationStatus: string }[]),
    user
      ? db
          .select({
            id: reminders.id,
            type: reminders.type,
            scheduledFor: reminders.scheduledFor,
          })
          .from(reminders)
          .where(
            and(eq(reminders.userId, user.id), eq(reminders.hackathonId, hackathon.id), isNull(reminders.sentAt))
          )
          .orderBy(asc(reminders.scheduledFor))
      : Promise.resolve([]),
  ]);

  const badges = buildBadges(hackathon);
  const applyUrl = hackathon.applicationUrl ?? hackathon.websiteUrl;

  return (
    <main className="min-h-screen bg-white px-5 pb-20 pt-10 text-black sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-[860px]">
        <Link
          className="inline-flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-[0.14em] text-[#706F6B] hover:text-[#660000]"
          href="/hackathons"
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          Hackathons DB
        </Link>

        <header className="mt-8 flex items-start gap-5">
          <div className="relative grid size-20 shrink-0 place-items-center border border-black/10 bg-[#F7F7F4]">
            {hackathon.imageUrl ? (
              <Image
                alt={`${hackathon.name} logo`}
                className="object-contain p-2.5"
                fill
                sizes="80px"
                src={hackathon.imageUrl}
                unoptimized
              />
            ) : (
              <span className="text-xl font-semibold text-[#660000]">{getInitials(hackathon.name) || "HN"}</span>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-normal text-black sm:text-4xl">{hackathon.name}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span
                  className="rounded-full border border-black/10 px-2.5 py-0.5 font-mono text-xs font-medium uppercase tracking-[0.12em] text-[#706F6B]"
                  key={badge}
                >
                  {badge}
                </span>
              ))}
              {tagRows.map((tag) => (
                <span
                  className="rounded-full border border-[#660000]/20 bg-[#660000]/5 px-2.5 py-0.5 font-mono text-xs font-medium uppercase tracking-[0.12em] text-[#660000]"
                  key={tag.name}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        </header>

        {hackathon.shortDescription ? (
          <p className="mt-6 max-w-[640px] text-base leading-7 text-[#3F3E3B]">{hackathon.shortDescription}</p>
        ) : null}

        <section className="mt-8 rounded-lg border border-black/10 bg-[#F7F7F4] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#660000]">Your status</h2>
          <p className="mt-2 text-sm text-[#706F6B]">
            Set where you are with this hackathon and we&apos;ll remind you about the right deadlines — applications,
            acceptance, and check-in.
          </p>
          <div className="mt-4">
            {user ? (
              <HackathonStatusTracker
                hackathonId={hackathon.id}
                initialStatus={tracked?.applicationStatus ?? null}
              />
            ) : (
              <Link
                className="inline-flex min-h-10 items-center justify-center border border-[#660000] px-5 text-sm font-semibold text-[#660000] transition-colors hover:bg-[#660000] hover:text-white"
                href="/sign-in"
              >
                Sign in to track this hackathon
              </Link>
            )}
          </div>
          {upcomingReminders.length ? (
            <ul className="mt-5 space-y-2 border-t border-black/10 pt-4">
              {upcomingReminders.map((reminder) => (
                <li className="flex items-center gap-2 text-sm text-[#3F3E3B]" key={reminder.id}>
                  <BellRing aria-hidden="true" className="size-3.5 shrink-0 text-[#660000]" />
                  <span>
                    {reminderTypeLabels[reminder.type] ?? reminder.type} · {formatReminderDate(reminder.scheduledFor)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-black/10 p-5">
            <p className={factLabelClassName}>Event dates</p>
            <p className="mt-2 flex items-center gap-2 text-base font-semibold text-black">
              <CalendarDays aria-hidden="true" className="size-4 shrink-0 text-[#660000]" />
              {formatDateRange(hackathon.startsAt, hackathon.endsAt)}
            </p>
            <p className="mt-1 text-sm text-[#706F6B]">
              {formatDuration(hackathon.startsAt, hackathon.endsAt, hackathon.format)}
            </p>
          </div>

          <div className="rounded-lg border border-black/10 p-5">
            <p className={factLabelClassName}>Location</p>
            <p className="mt-2 flex items-center gap-2 text-base font-semibold text-black">
              <MapPin aria-hidden="true" className="size-4 shrink-0 text-[#660000]" />
              {formatLocation(hackathon)}
            </p>
            {hackathon.venue ? <p className="mt-1 text-sm text-[#706F6B]">{hackathon.venue}</p> : null}
          </div>

          <div className="rounded-lg border border-black/10 p-5">
            <p className={factLabelClassName}>Application window</p>
            <p className="mt-2 text-base font-semibold text-black">
              {formatDeadline(hackathon.applicationOpensAt)} → {formatDeadline(hackathon.applicationClosesAt)}
            </p>
            <p className="mt-1 text-sm text-[#706F6B]">
              Acceptances {hackathon.acceptanceAt ? formatDeadline(hackathon.acceptanceAt) : "TBA"}
            </p>
          </div>

          <div className="rounded-lg border border-black/10 p-5">
            <p className={factLabelClassName}>Prizes</p>
            <p className="mt-2 flex items-center gap-2 text-base font-semibold text-black">
              <Trophy aria-hidden="true" className="size-4 shrink-0 text-[#660000]" />
              {hackathon.prizeAmountUsd ? `$${hackathon.prizeAmountUsd.toLocaleString("en-US")} prize pool` : "TBA"}
            </p>
            {hackathon.organizationName ? (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-[#706F6B]">
                <Landmark aria-hidden="true" className="size-3.5 shrink-0" />
                {hackathon.organizationName}
              </p>
            ) : null}
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          {applyUrl ? (
            <a
              className="inline-flex min-h-11 items-center justify-center gap-1.5 border border-[#660000] bg-[#660000] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#4d0000]"
              href={applyUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Apply on event site
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
          ) : null}
          {hackathon.websiteUrl && hackathon.websiteUrl !== applyUrl ? (
            <a
              className="inline-flex min-h-11 items-center justify-center gap-1.5 border border-[#660000] px-6 text-sm font-semibold text-[#660000] transition-colors hover:bg-[#660000] hover:text-white"
              href={hackathon.websiteUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Event website
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
          ) : null}
        </div>
      </div>
    </main>
  );
}
