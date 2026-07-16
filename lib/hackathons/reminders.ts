import { and, count, eq, gt, isNotNull, isNull, lte, notExists, or, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { hackathonDates, reminders, userHackathonNotificationPreferences, userHackathons } from "@/lib/db/schema";
import {
  computeSelectableReminderPlan,
  getSelectableReminderTypesForStatus,
  selectableReminderTypes,
  type SelectableReminderType,
} from "@/lib/hackathons/reminder-plan";

// Reminders are opt-in: a type with no stored preference is treated as OFF, so
// nothing is scheduled until the hacker explicitly turns it on. This keeps a
// status move (which re-syncs against the newly offered types) from silently
// enabling an email reminder the hacker never asked for.
function getDefaultPreferences() {
  return new Map<SelectableReminderType, boolean>(selectableReminderTypes.map((type) => [type, false]));
}

function isSelectableReminderType(type: string): type is SelectableReminderType {
  return selectableReminderTypes.some((selectableType) => selectableType === type);
}

export async function setUserHackathonNotificationPreferences({
  userId,
  hackathonId,
  preferences,
}: {
  userId: string;
  hackathonId: string;
  preferences: { type: SelectableReminderType; enabled: boolean }[];
}) {
  if (!preferences.length) {
    return;
  }

  await db
    .insert(userHackathonNotificationPreferences)
    .values(
      preferences.map((preference) => ({
        userId,
        hackathonId,
        type: preference.type,
        channel: "email" as const,
        enabled: preference.enabled,
        updatedAt: new Date(),
      }))
    )
    .onConflictDoUpdate({
      target: [
        userHackathonNotificationPreferences.userId,
        userHackathonNotificationPreferences.hackathonId,
        userHackathonNotificationPreferences.type,
        userHackathonNotificationPreferences.channel,
      ],
      set: {
        enabled: sql`excluded.enabled`,
        updatedAt: new Date(),
      },
    });
}

/**
 * Email reminders for one hackathon that have not been delivered yet — the
 * baseline for deciding whether a preference change adds sends.
 */
export async function countPendingEmailReminders({ userId, hackathonId }: { userId: string; hackathonId: string }) {
  const [row] = await db
    .select({ value: count() })
    .from(reminders)
    .where(
      and(
        eq(reminders.userId, userId),
        eq(reminders.hackathonId, hackathonId),
        eq(reminders.channel, "email"),
        isNull(reminders.sentAt)
      )
    );

  return row?.value ?? 0;
}

/**
 * Plan entries whose exact (type, scheduledFor) email already went out. The
 * Monday digest delivers digest-type reminders up to a week before their
 * scheduledFor, so a future plan entry can already be history — recreating it
 * would email the hacker twice about the same moment.
 */
async function excludeAlreadySentEntries(
  userId: string,
  hackathonId: string,
  entries: { type: SelectableReminderType; scheduledFor: Date }[]
) {
  if (!entries.length) {
    return entries;
  }

  const sentRows = await db
    .select({ type: reminders.type, scheduledFor: reminders.scheduledFor })
    .from(reminders)
    .where(
      and(
        eq(reminders.userId, userId),
        eq(reminders.hackathonId, hackathonId),
        eq(reminders.channel, "email"),
        isNotNull(reminders.sentAt)
      )
    );

  const sentKeys = new Set(sentRows.map((row) => `${row.type}:${row.scheduledFor.getTime()}`));

  return entries.filter((entry) => !sentKeys.has(`${entry.type}:${entry.scheduledFor.getTime()}`));
}

/**
 * The reminders syncRemindersForUserHackathon would schedule for this hackathon
 * once the requested preference changes are applied — used to enforce the
 * weekly email limit before anything is written. Untracked hackathons predict
 * with the default "interested" status because the notifications endpoint
 * creates the tracking row with that default.
 */
export async function computePlannedEmailReminderEntries({
  userId,
  hackathonId,
  preferences,
  now = new Date(),
}: {
  userId: string;
  hackathonId: string;
  preferences: { type: SelectableReminderType; enabled: boolean }[];
  now?: Date;
}) {
  const [[dates], [userHackathon]] = await Promise.all([
    db
      .select({
        startsAt: hackathonDates.startsAt,
        endsAt: hackathonDates.endsAt,
        applicationOpensAt: hackathonDates.applicationOpensAt,
        applicationClosesAt: hackathonDates.applicationClosesAt,
        acceptanceAt: hackathonDates.acceptanceAt,
      })
      .from(hackathonDates)
      .where(eq(hackathonDates.hackathonId, hackathonId))
      .limit(1),
    db
      .select({ applicationStatus: userHackathons.applicationStatus })
      .from(userHackathons)
      .where(and(eq(userHackathons.userId, userId), eq(userHackathons.hackathonId, hackathonId)))
      .limit(1),
  ]);

  const enabledByType = await getEnabledEmailReminderTypes(userId, hackathonId);

  for (const preference of preferences) {
    enabledByType.set(preference.type, preference.enabled);
  }

  const availableReminderTypes = new Set(
    getSelectableReminderTypesForStatus(userHackathon?.applicationStatus ?? "interested")
  );

  const planned = computeSelectableReminderPlan(dates ?? null, now).filter(
    (entry) => availableReminderTypes.has(entry.type) && enabledByType.get(entry.type)
  );

  return excludeAlreadySentEntries(userId, hackathonId, planned);
}

async function getEnabledEmailReminderTypes(userId: string, hackathonId: string) {
  const enabledByType = getDefaultPreferences();
  const rows = await db
    .select({
      type: userHackathonNotificationPreferences.type,
      enabled: userHackathonNotificationPreferences.enabled,
    })
    .from(userHackathonNotificationPreferences)
    .where(
      and(
        eq(userHackathonNotificationPreferences.userId, userId),
        eq(userHackathonNotificationPreferences.hackathonId, hackathonId),
        eq(userHackathonNotificationPreferences.channel, "email")
      )
    );

  for (const row of rows) {
    if (isSelectableReminderType(row.type)) {
      enabledByType.set(row.type, row.enabled);
    }
  }

  return enabledByType;
}

/**
 * Schedule the "applications open" email for every hacker who enabled it
 * before the opening date was confirmed. Nothing re-syncs reminders when an
 * admin fills in a hackathon's dates, so the daily cron sweeps instead: once
 * `applicationOpensAt` is known and has arrived, a due reminder is inserted
 * (and sent in the same run). Skipped once applications have closed or the
 * event has started — announcing an opening that has already ended would be
 * wrong — and once any application_open reminder exists for the pair, so a
 * sent email is never repeated.
 */
export async function scheduleDueApplicationOpenReminders(now = new Date()) {
  const due = await db
    .select({
      userId: userHackathonNotificationPreferences.userId,
      hackathonId: userHackathonNotificationPreferences.hackathonId,
      applicationOpensAt: hackathonDates.applicationOpensAt,
    })
    .from(userHackathonNotificationPreferences)
    .innerJoin(hackathonDates, eq(hackathonDates.hackathonId, userHackathonNotificationPreferences.hackathonId))
    .innerJoin(
      userHackathons,
      and(
        eq(userHackathons.userId, userHackathonNotificationPreferences.userId),
        eq(userHackathons.hackathonId, userHackathonNotificationPreferences.hackathonId)
      )
    )
    .where(
      and(
        eq(userHackathonNotificationPreferences.type, "application_open"),
        eq(userHackathonNotificationPreferences.channel, "email"),
        eq(userHackathonNotificationPreferences.enabled, true),
        eq(userHackathons.isSaved, true),
        eq(userHackathons.applicationStatus, "interested"),
        isNotNull(hackathonDates.applicationOpensAt),
        lte(hackathonDates.applicationOpensAt, now),
        or(isNull(hackathonDates.applicationClosesAt), gt(hackathonDates.applicationClosesAt, now)),
        or(isNull(hackathonDates.startsAt), gt(hackathonDates.startsAt, now)),
        notExists(
          db
            .select({ id: reminders.id })
            .from(reminders)
            .where(
              and(
                eq(reminders.userId, userHackathonNotificationPreferences.userId),
                eq(reminders.hackathonId, userHackathonNotificationPreferences.hackathonId),
                eq(reminders.type, "application_open"),
                eq(reminders.channel, "email")
              )
            )
        )
      )
    );

  const rows = due.filter((row) => row.applicationOpensAt !== null);

  if (!rows.length) {
    return 0;
  }

  await db
    .insert(reminders)
    .values(
      rows.map((row) => ({
        userId: row.userId,
        hackathonId: row.hackathonId,
        type: "application_open" as const,
        channel: "email" as const,
        scheduledFor: row.applicationOpensAt as Date,
      }))
    )
    .onConflictDoNothing({
      target: [
        reminders.userId,
        reminders.hackathonId,
        reminders.type,
        reminders.channel,
        reminders.scheduledFor,
      ],
      where: sql`${reminders.sentAt} is null`,
    });

  return rows.length;
}

/**
 * Replace a user's pending reminders for a hackathon with the plan for their
 * current status. Reminders that already went out are kept as history.
 * Unsaving a hackathon clears pending reminders instead.
 */
export async function syncRemindersForUserHackathon({
  userId,
  hackathonId,
  isSaved,
  now = new Date(),
}: {
  userId: string;
  hackathonId: string;
  isSaved: boolean;
  now?: Date;
}) {
  await db
    .delete(reminders)
    .where(and(eq(reminders.userId, userId), eq(reminders.hackathonId, hackathonId), isNull(reminders.sentAt)));

  if (!isSaved) {
    return;
  }

  const [[dates], [userHackathon]] = await Promise.all([
    db
      .select({
        startsAt: hackathonDates.startsAt,
        endsAt: hackathonDates.endsAt,
        applicationOpensAt: hackathonDates.applicationOpensAt,
        applicationClosesAt: hackathonDates.applicationClosesAt,
        acceptanceAt: hackathonDates.acceptanceAt,
      })
      .from(hackathonDates)
      .where(eq(hackathonDates.hackathonId, hackathonId))
      .limit(1),
    db
      .select({ applicationStatus: userHackathons.applicationStatus })
      .from(userHackathons)
      .where(and(eq(userHackathons.userId, userId), eq(userHackathons.hackathonId, hackathonId)))
      .limit(1),
  ]);

  const enabledByType = await getEnabledEmailReminderTypes(userId, hackathonId);
  const availableReminderTypes = new Set(getSelectableReminderTypesForStatus(userHackathon?.applicationStatus ?? null));
  // Skip entries the weekly digest already delivered ahead of their
  // scheduledFor — recreating them would repeat the email next Monday.
  const plan = await excludeAlreadySentEntries(
    userId,
    hackathonId,
    computeSelectableReminderPlan(dates ?? null, now).filter(
      (entry) => availableReminderTypes.has(entry.type) && enabledByType.get(entry.type)
    )
  );

  if (!plan.length) {
    return;
  }

  await db
    .insert(reminders)
    .values(
      plan.map((entry) => ({
        userId,
        hackathonId,
        type: entry.type,
        channel: "email" as const,
        scheduledFor: entry.scheduledFor,
      }))
    )
    .onConflictDoNothing({
      target: [
        reminders.userId,
        reminders.hackathonId,
        reminders.type,
        reminders.channel,
        reminders.scheduledFor,
      ],
      where: sql`${reminders.sentAt} is null`,
    });
}
