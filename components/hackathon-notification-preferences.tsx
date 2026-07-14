"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { BellRing } from "lucide-react";

import { formatReminderDate, reminderTypeLabels } from "@/lib/hackathons/reminder-labels";
import { EMAIL_NOTIFICATION_LIMIT, type SelectableReminderType } from "@/lib/hackathons/reminder-plan";

type NotificationPreference = {
  type: SelectableReminderType;
  enabled: boolean;
  scheduledFor: string | null;
  // Whether the send time is still in the future. Omitted (treated as upcoming)
  // where callers only ever pass deliverable reminders, like the detail page.
  upcoming?: boolean;
};

function isUpcoming(preference: NotificationPreference) {
  return preference.upcoming ?? Boolean(preference.scheduledFor);
}

function handleUnauthenticated() {
  window.location.href = "/sign-in";
}

export function HackathonNotificationPreferences({
  hackathonId,
  initialPreferences,
  pendingElsewhereCount = 0,
}: {
  hackathonId: string;
  initialPreferences: NotificationPreference[];
  /* Pending email reminders the user already has on other hackathons — the
     starting point for the account-wide notification limit check. */
  pendingElsewhereCount?: number;
}) {
  const router = useRouter();
  const [preferences, setPreferences] = useState(initialPreferences);
  const [pendingType, setPendingType] = useState<SelectableReminderType | null>(null);
  const [limitNoticeOpen, setLimitNoticeOpen] = useState(false);

  useEffect(() => {
    if (!limitNoticeOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLimitNoticeOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [limitNoticeOpen]);

  async function updatePreference(type: SelectableReminderType, enabled: boolean) {
    if (pendingType) {
      return;
    }

    if (enabled) {
      const enabledUpcomingCount = preferences.filter(
        (preference) => preference.enabled && isUpcoming(preference)
      ).length;

      if (pendingElsewhereCount + enabledUpcomingCount >= EMAIL_NOTIFICATION_LIMIT) {
        setLimitNoticeOpen(true);
        return;
      }
    }

    const previousPreferences = preferences;
    const nextPreferences = preferences.map((preference) =>
      preference.type === type ? { ...preference, enabled } : preference
    );

    setPreferences(nextPreferences);
    setPendingType(type);

    try {
      const response = await fetch(`/api/hackathons/${encodeURIComponent(hackathonId)}/notifications`, {
        body: JSON.stringify({
          preferences: nextPreferences.map((preference) => ({
            type: preference.type,
            enabled: preference.enabled,
          })),
        }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });

      if (response.status === 401) {
        handleUnauthenticated();
        return;
      }

      // The server re-checks the notification limit — a stale elsewhere count
      // (another tab, another hackathon) surfaces here as a 409.
      if (response.status === 409) {
        setPreferences(previousPreferences);
        setLimitNoticeOpen(true);
        return;
      }

      if (!response.ok) {
        throw new Error("Could not update notification preferences.");
      }

      router.refresh();
    } catch {
      setPreferences(previousPreferences);
    } finally {
      setPendingType(null);
    }
  }

  // Once a reminder's send time has passed there is nothing to subscribe to, so
  // its clickable card is dropped — the "Email notifications" heading still shows
  // so the section reads as a settled, past hackathon rather than disappearing.
  const upcomingPreferences = preferences.filter(isUpcoming);

  return (
    <div className="mt-5 border-t border-navy/10 dark:border-white/10 pt-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-navy dark:text-wheat">
        <BellRing aria-hidden="true" className="size-4 text-cabernet dark:text-[#e4a3ab]" />
        Email notifications
      </div>
      {upcomingPreferences.length ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {upcomingPreferences.map((preference) => {
            const scheduledFor = preference.scheduledFor ? new Date(preference.scheduledFor) : null;
            const pending = pendingType === preference.type;

            return (
              <label
                className={`flex min-h-20 cursor-pointer flex-col justify-between rounded-md border bg-white dark:bg-white/[0.06] p-3 text-sm transition-colors ${
                  preference.enabled
                    ? "border-cabernet/40 text-navy dark:text-wheat"
                    : "border-navy/10 dark:border-white/10 text-navy/55 dark:text-wheat/55"
                } hover:border-cabernet/40 dark:hover:border-[#e4a3ab]/40`}
                key={preference.type}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="font-medium">{reminderTypeLabels[preference.type] ?? preference.type}</span>
                  <input
                    checked={preference.enabled}
                    className="mt-0.5 size-4 accent-cabernet"
                    disabled={pendingType !== null}
                    onChange={(event) => updatePreference(preference.type, event.target.checked)}
                    type="checkbox"
                  />
                </span>
                <span className="mt-2 text-xs text-navy/55 dark:text-wheat/55">
                  {scheduledFor ? formatReminderDate(scheduledFor) : "No upcoming reminder"}
                  {pending ? " - saving" : ""}
                </span>
              </label>
            );
          })}
        </div>
      ) : null}
      {limitNoticeOpen
        ? createPortal(
            <div
              aria-modal="true"
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
              role="dialog"
            >
              <button
                aria-label="Close"
                className="absolute inset-0 bg-navy/40 dark:bg-black/60 backdrop-blur-[2px]"
                onClick={() => setLimitNoticeOpen(false)}
                tabIndex={-1}
                type="button"
              />
              <div className="relative w-full max-w-md rounded-2xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[#1b1b1b] p-6 shadow-[0_30px_80px_rgb(0_0_0/0.45)]">
                <h2 className="text-lg font-semibold leading-6 text-navy dark:text-wheat">
                  Hey, nothing&apos;s going to show up for now.
                </h2>
                <p className="mt-2 text-sm leading-5 text-navy/60 dark:text-wheat/60">
                  You can have up to {EMAIL_NOTIFICATION_LIMIT} email notifications at a time. Turn one off to make
                  room for this one.
                </p>
                <div className="mt-6 flex items-center justify-end">
                  <button
                    className="inline-flex min-h-10 items-center justify-center rounded-full bg-cabernet px-5 text-sm font-semibold text-wheat transition-colors hover:bg-cabernet/90 dark:bg-[#e4a3ab] dark:text-[#141414] dark:hover:bg-[#e9b3ba]"
                    onClick={() => setLimitNoticeOpen(false)}
                    type="button"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
