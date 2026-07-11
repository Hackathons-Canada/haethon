"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BellRing } from "lucide-react";

import { formatReminderDate, reminderTypeLabels } from "@/lib/hackathons/reminder-labels";
import type { SelectableReminderType } from "@/lib/hackathons/reminder-plan";

type NotificationPreference = {
  type: SelectableReminderType;
  enabled: boolean;
  scheduledFor: string | null;
  // Whether the send time is still in the future. Omitted (treated as upcoming)
  // where callers only ever pass deliverable reminders, like the detail page.
  upcoming?: boolean;
};

function handleUnauthenticated() {
  window.location.href = "/sign-in";
}

export function HackathonNotificationPreferences({
  hackathonId,
  initialPreferences,
}: {
  hackathonId: string;
  initialPreferences: NotificationPreference[];
}) {
  const router = useRouter();
  const [preferences, setPreferences] = useState(initialPreferences);
  const [pendingType, setPendingType] = useState<SelectableReminderType | null>(null);

  async function updatePreference(type: SelectableReminderType, enabled: boolean) {
    if (pendingType) {
      return;
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
  const upcomingPreferences = preferences.filter(
    (preference) => preference.upcoming ?? Boolean(preference.scheduledFor)
  );

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
    </div>
  );
}
