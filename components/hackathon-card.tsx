"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { BellPlus, Bookmark, Check, ChevronDown, Swords } from "lucide-react";

import { DiscordGlyph } from "@/components/discord-glyph";
import { hackathonLogoSrc, isDirectImageUrl } from "@/lib/hackathons/logo-hosts";
import { formatReminderDate } from "@/lib/hackathons/reminder-labels";
import type { SelectableReminderType } from "@/lib/hackathons/reminder-plan";
import type { HackathonSourceBadge } from "@/lib/hackathons/source-badges";

export type HackathonCardData = {
  /** Search metadata sent with the cached catalog snapshot. */
  beginnerFriendly?: boolean;
  country?: string | null;
  /** Two-letter ISO code — used for the "near me" local-country boost. */
  countryCode?: string | null;
  date: string;
  /** Face Off head-to-head rating. Undefined only for hand-built preview cards. */
  eloRating?: number;
  faceoffLosses?: number;
  faceoffWins?: number;
  format?: "online" | "in_person";
  hasDiscord?: boolean;
  highSchoolersOnly?: boolean;
  id: string;
  image?: string | null;
  /** The event's dates have passed; shown only for recurring (annual) series
      until the next edition is published. */
  isPast?: boolean;
  isSaved: boolean;
  /** City-centroid coordinates used by the browser-side distance filter. */
  latitude?: number | null;
  longitude?: number | null;
  location: string;
  name: string;
  slug?: string | null;
  /* Where this hackathon's data came from — surfaced as a small provenance
     badge under the card image. Absent when we have no source on file. */
  source?: HackathonSourceBadge | null;
  startsAt?: string | null;
  travelReimbursement?: boolean;
};

function handleUnauthenticated() {
  window.location.href = "/sign-in";
}

/* Keep country names readable while preserving the US/Canada color accents. */
function getCountryDisplay(country: string): { label: string; underlineClass: string } {
  const key = country.trim().toLowerCase();

  if (key === "united states" || key === "united states of america" || key === "usa") {
    return { label: "United States", underlineClass: "underline decoration-[#5A6CFF] underline-offset-2" };
  }

  if (key === "canada") {
    return { label: "Canada", underlineClass: "underline decoration-[#D9043D] underline-offset-2" };
  }

  return { label: country.trim(), underlineClass: "" };
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function getAccentStyle(name: string) {
  const palette = [
    [102, 0, 0],
    [217, 4, 61],
    [31, 93, 135],
    [24, 120, 92],
    [138, 83, 18],
    [86, 64, 148],
    [160, 62, 43],
  ] as const;
  const hash = Array.from(name).reduce((total, character) => total + character.charCodeAt(0), 0);
  const [r, g, b] = palette[hash % palette.length] ?? palette[0];

  return {
    "--hackathon-accent-rgb": `${r} ${g} ${b}`,
  } as CSSProperties & { "--hackathon-accent-rgb": string };
}

function BookmarkButton({
  hackathonId,
  hackathonName,
  initialSaved,
  preview = false,
}: {
  hackathonId: string;
  hackathonName: string;
  initialSaved: boolean;
  preview?: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);

  async function toggleSaved() {
    if (preview) {
      return;
    }

    const nextSaved = !saved;
    const previousSaved = saved;

    setSaved(nextSaved);
    setSaving(true);

    try {
      const response = await fetch(`/api/hackathons/${encodeURIComponent(hackathonId)}/save`, {
        body: JSON.stringify({ isSaved: nextSaved }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });

      if (response.status === 401) {
        handleUnauthenticated();
        return;
      }

      if (!response.ok) {
        throw new Error("Could not save hackathon.");
      }

      const payload = (await response.json()) as { data?: { isSaved?: boolean } };
      setSaved(Boolean(payload.data?.isSaved));
    } catch {
      setSaved(previousSaved);
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      aria-label={`${saved ? "Remove" : "Add"} ${hackathonName} ${
        saved ? "from" : "to"
      } library`}
      aria-disabled={preview || undefined}
      aria-pressed={saved}
      disabled={saving}
      className={`relative z-10 grid size-10 shrink-0 place-items-center transition-colors hover:text-pine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine ${
        saved ? "text-pine" : "text-ink"
      } disabled:cursor-wait disabled:opacity-70`}
      onClick={toggleSaved}
      type="button"
    >
      <Bookmark
        aria-hidden="true"
        className={`size-5 ${saved ? "fill-current" : "fill-transparent"}`}
        strokeWidth={2.35}
      />
    </button>
  );
}

function HackathonLogoMark({
  compact = false,
  hackathon,
  logoSrc,
}: {
  compact?: boolean;
  hackathon: HackathonCardData;
  logoSrc: string | null;
}) {
  return (
    <div
      className={`relative grid shrink-0 place-items-center overflow-hidden bg-ink/5 ${
        compact ? "size-14" : "size-[4.5rem]"
      }`}
    >
      {logoSrc ? (
        <Image
          alt={`${hackathon.name} logo`}
          className="object-contain"
          fill
          priority={false}
          sizes="72px"
          src={logoSrc}
          /* Same-origin (proxy fallback) and allowlisted remote hosts both go
             through next/image optimization (WebP + srcset). Only preview cards
             carrying a raw URL on an unknown host must skip it — the optimizer
             rejects hosts outside remotePatterns. */
          unoptimized={!logoSrc.startsWith("/") && !isDirectImageUrl(logoSrc)}
        />
      ) : (
        <div className="grid size-full place-items-center bg-[rgb(var(--hackathon-accent-rgb)/0.92)] px-2 text-center text-lg font-semibold text-paper">
          {getInitials(hackathon.name) || "HN"}
        </div>
      )}
    </div>
  );
}

type ReminderOption = {
  type: SelectableReminderType;
  label: string;
  /* ISO string of the send time, so this stays serializable from the server.
     Null while the anchor date is unconfirmed — the "applications open" email
     goes out the moment the date is known and arrives. */
  scheduledFor: string | null;
  enabled: boolean;
};

export type HackathonCardReminder = {
  hackathonId: string;
  /* The hacker's current pipeline stage — shown as the panel heading, since the
     reminders offered depend on where they stand. */
  statusLabel: string;
  options: ReminderOption[];
};

/* Inline reminder picker used on the My Hackathons board. Clicking the footer
   button expands a select panel below it — mirroring the search bar popovers —
   where each reminder can be toggled on or off. Choices save instantly, and the
   active ones surface as chips on the card once the panel is closed. */
function ReminderControl({ hackathonId, statusLabel, options: initialOptions }: HackathonCardReminder) {
  const [options, setOptions] = useState(initialOptions);
  const [open, setOpen] = useState(false);
  const [pendingType, setPendingType] = useState<SelectableReminderType | null>(null);
  const [limitNotice, setLimitNotice] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const enabledOptions = options.filter((option) => option.enabled);

  async function toggleReminder(type: SelectableReminderType, enabled: boolean) {
    if (pendingType) {
      return;
    }

    const previousOptions = options;
    const nextOptions = options.map((option) => (option.type === type ? { ...option, enabled } : option));

    setOptions(nextOptions);
    setPendingType(type);
    setLimitNotice(false);

    try {
      const response = await fetch(`/api/hackathons/${encodeURIComponent(hackathonId)}/notifications`, {
        body: JSON.stringify({
          preferences: nextOptions.map((option) => ({ type: option.type, enabled: option.enabled })),
        }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });

      if (response.status === 401) {
        handleUnauthenticated();
        return;
      }

      // The server books the change against the five-emails-per-week limit —
      // an overflowing week comes back as a 409.
      if (response.status === 409) {
        setOptions(previousOptions);
        setLimitNotice(true);
        return;
      }

      if (!response.ok) {
        throw new Error("Could not update reminders.");
      }
    } catch {
      setOptions(previousOptions);
    } finally {
      setPendingType(null);
    }
  }

  return (
    <div className="relative z-10" ref={rootRef}>
      <button
        aria-expanded={open}
        className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine ${
          open ? "bg-pine text-paper" : "text-ink hover:bg-pine hover:text-paper"
        }`}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <BellPlus aria-hidden="true" className="size-3.5" />
        {enabledOptions.length ? `Reminders · ${enabledOptions.length}` : "Add Reminder"}
        <ChevronDown
          aria-hidden="true"
          className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {!open && enabledOptions.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {enabledOptions.map((option) => (
            <span
              className="inline-flex items-center gap-1 bg-pine/10 px-2.5 py-1 text-xs font-medium text-pine"
              key={option.type}
            >
              <BellPlus aria-hidden="true" className="size-3" />
              {option.label}
            </span>
          ))}
        </div>
      ) : null}

      {open ? (
        <div className="mt-2 border border-ink/15 bg-paper p-3 shadow-sm">
          <p className="px-1 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-pine">
            {statusLabel}
          </p>
          {options.length ? (
            <div className="mt-2 space-y-1.5">
              {options.map((option) => {
                const pending = pendingType === option.type;

                return (
                  <label
                    className={`flex cursor-pointer items-center justify-between gap-3 border px-3 py-2.5 text-left transition-colors ${
                      option.enabled
                        ? "border-pine/35 bg-pine/5"
                        : "border-ink/15 bg-paper hover:border-ink/40"
                    }`}
                    key={option.type}
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-ink">{option.label}</span>
                      <span className="mt-0.5 block text-xs text-ink/55">
                        {option.scheduledFor
                          ? formatReminderDate(new Date(option.scheduledFor))
                          : "Date TBA — we'll email you the moment they open"}
                        {pending ? " · saving" : ""}
                      </span>
                    </span>
                    <input
                      checked={option.enabled}
                      className="sr-only"
                      disabled={pendingType !== null}
                      onChange={(event) => toggleReminder(option.type, event.target.checked)}
                      type="checkbox"
                    />
                    <span
                      aria-hidden="true"
                      className={`grid size-6 shrink-0 place-items-center rounded-full border ${
                        option.enabled
                          ? "border-pine bg-pine text-paper"
                          : "border-ink/15 text-transparent"
                      }`}
                    >
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                  </label>
                );
              })}
            </div>
          ) : (
            <p className="mt-2 px-1 pb-1 text-xs text-ink/55">
              No reminders are available yet. We&apos;ll offer them once this hackathon&apos;s key dates are confirmed.
            </p>
          )}
          {limitNotice ? (
            <p className="mt-2 px-1 pb-1 text-xs font-medium text-cabernet">
              For now, you&apos;re limited to five emails per week. Turn another reminder off to make room.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function HackathonCard({
  compact = false,
  cornerAction,
  hackathon,
  preview = false,
  reminder,
}: {
  /* Tightens padding, logo, and footer spacing so cards stack densely on the
     My Hackathons board. */
  compact?: boolean;
  /* Optional control pinned to the card's top-right corner (e.g. the remove
     trash button on the My Hackathons board). Sits above the full-card link. */
  cornerAction?: ReactNode;
  hackathon: HackathonCardData;
  preview?: boolean;
  /* When set, the footer swaps the save control for an inline reminder
     picker that expands below the card — used on the My Hackathons board. */
  reminder?: HackathonCardReminder;
}) {
  const accentStyle = useMemo(() => getAccentStyle(hackathon.name), [hackathon.name]);
  const logoSrc = hackathon.image
    ? preview
      ? hackathon.image
      : hackathonLogoSrc(hackathon.id, hackathon.image)
    : null;
  return (
    <article
      className={`group relative flex min-w-0 flex-col border border-ink/15 bg-paper transition-colors hover:border-ink/40 ${
        compact ? "p-4" : "p-5 sm:p-6"
      } ${
        /* Past editions read as faded — dimmed just enough to signal "already
           happened" without hurting text legibility. Hover restores full
           strength so the card is still easy to inspect. */
        hackathon.isPast ? "opacity-70 hover:opacity-100 focus-within:opacity-100" : ""
      }`}
      style={accentStyle}
    >
      {hackathon.slug && !preview ? (
        <Link
          aria-label={`View ${hackathon.name} details`}
          className="absolute inset-0 z-[1]"
          draggable={false}
          href={`/hackathons/${hackathon.slug}`}
        />
      ) : null}

      <div className={`flex items-start ${compact ? "gap-3" : "gap-4"}`}>
        {/* The column is pinned to the logo's width so the provenance badge
            below can never grow wider than the image — long labels truncate. */}
        <div className={`flex shrink-0 flex-col items-center gap-2 ${compact ? "w-14" : "w-[4.5rem]"}`}>
          <HackathonLogoMark compact={compact} hackathon={hackathon} logoSrc={logoSrc} />
          {/* Provenance label — names where this hackathon's data came from.
              Absent when we have no source on file. */}
          {hackathon.source ? (
            <span className="relative z-10 max-w-full truncate font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink/55">
              {hackathon.source.label}
            </span>
          ) : null}
        </div>
        <div className="min-w-0 pt-1">
          <h2
            className={`line-clamp-2 font-semibold tracking-tight text-ink ${
              compact ? "text-lg leading-6" : "text-xl leading-6 sm:text-[1.35rem]"
            }`}
          >
            {hackathon.name}
          </h2>
          {hackathon.isPast ? (
            <p className="mt-2 text-[15px] leading-5 text-ink/40">
              Last held {hackathon.date} · next edition TBA
            </p>
          ) : (
            <p className="mt-2 text-[15px] leading-5 text-ink/55">
              {hackathon.date}
            </p>
          )}
          <p
            className="mt-1 truncate text-[15px] leading-5 text-ink/55"
            title={[hackathon.country ? getCountryDisplay(hackathon.country).label : null, hackathon.location]
              .filter(Boolean)
              .join(", ")}
          >
            {hackathon.country
              ? (() => {
                  const { label, underlineClass } = getCountryDisplay(hackathon.country);

                  return (
                    <>
                      <span className={underlineClass}>{label}</span>
                      {", "}
                    </>
                  );
                })()
              : null}
            {hackathon.location}
          </p>
          {hackathon.beginnerFriendly ||
          hackathon.travelReimbursement ||
          hackathon.highSchoolersOnly ||
          hackathon.hasDiscord ||
          typeof hackathon.eloRating === "number" ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {typeof hackathon.eloRating === "number" ? (
                <span
                  className="relative z-10 inline-flex items-center gap-1 bg-ink/5 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink/55"
                  title="Face Off Elo rating"
                >
                  <Swords aria-hidden="true" className="size-3" />
                  {hackathon.eloRating}
                </span>
              ) : null}
              {hackathon.beginnerFriendly ? (
                <span className="relative z-10 inline-flex items-center bg-pine/10 px-2.5 py-1 text-[11px] font-medium text-pine">
                  Beginner friendly
                </span>
              ) : null}
              {hackathon.travelReimbursement ? (
                <span className="relative z-10 inline-flex items-center bg-pine/10 px-2.5 py-1 text-[11px] font-medium text-pine">
                  Travel support
                </span>
              ) : null}
              {hackathon.highSchoolersOnly ? (
                <span className="relative z-10 inline-flex items-center bg-pine/10 px-2.5 py-1 text-[11px] font-medium text-pine">
                  High school only
                </span>
              ) : null}
              {hackathon.hasDiscord ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#5865F2]">
                  <DiscordGlyph className="size-3.5" />
                  Discord
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className={`mt-auto text-base leading-6 ${compact ? "pt-3" : "pt-5"}`}>
        {reminder ? (
          <div className="flex items-start justify-between gap-2">
            <ReminderControl
              hackathonId={reminder.hackathonId}
              options={reminder.options}
              statusLabel={reminder.statusLabel}
            />
            {cornerAction ? <div className="relative z-20 shrink-0">{cornerAction}</div> : null}
          </div>
        ) : (
          <div className="flex items-center justify-end gap-3">
            <BookmarkButton
              hackathonId={hackathon.id}
              hackathonName={hackathon.name}
              initialSaved={hackathon.isSaved}
              preview={preview}
            />
          </div>
        )}
      </div>
    </article>
  );
}
