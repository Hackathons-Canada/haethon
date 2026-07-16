import { and, eq, gte, inArray, isNotNull, isNull, ne } from "drizzle-orm";

import { db } from "@/lib/db";
import { countryAlertSubscriptions, reminders } from "@/lib/db/schema";
import { digestReminderTypes } from "@/lib/hackathons/reminder-plan";
import { weekStartUtc, type EmailEvent } from "@/lib/notifications/email-week";

/**
 * Everything already promised to a user's inbox, for weekly-limit checks:
 * pending email reminders (optionally excluding one hackathon whose plan is
 * being replaced), emails that already went out this week, and whether a
 * country alert subscription reserves the weekly digest slot.
 */
export async function getCommittedEmailEvents({
  userId,
  excludeHackathonId,
  now = new Date(),
}: {
  userId: string;
  excludeHackathonId?: string;
  now?: Date;
}): Promise<{ events: EmailEvent[]; hasCountryAlert: boolean }> {
  const weekStart = weekStartUtc(now);

  const [pending, sentThisWeek, [subscription]] = await Promise.all([
    db
      .select({ type: reminders.type, scheduledFor: reminders.scheduledFor })
      .from(reminders)
      .where(
        and(
          eq(reminders.userId, userId),
          eq(reminders.channel, "email"),
          isNull(reminders.sentAt),
          ...(excludeHackathonId ? [ne(reminders.hackathonId, excludeHackathonId)] : [])
        )
      ),
    // Sent rows count against the week they were actually delivered in, and
    // they always count — even for the hackathon being re-planned.
    db
      .select({ type: reminders.type, sentAt: reminders.sentAt })
      .from(reminders)
      .where(
        and(
          eq(reminders.userId, userId),
          eq(reminders.channel, "email"),
          isNotNull(reminders.sentAt),
          gte(reminders.sentAt, weekStart)
        )
      ),
    db
      .select({ id: countryAlertSubscriptions.id })
      .from(countryAlertSubscriptions)
      .where(eq(countryAlertSubscriptions.userId, userId))
      .limit(1),
  ]);

  return {
    events: [
      ...pending.map((row) => ({ type: row.type, occursAt: row.scheduledFor })),
      ...sentThisWeek.map((row) => ({ type: row.type, occursAt: row.sentAt as Date })),
    ],
    hasCountryAlert: Boolean(subscription),
  };
}

/**
 * Emails each of these users has already received this calendar week — the
 * cron backstop for the weekly limit. Immediate reminders count one each;
 * digest-type reminder rows and a country alert watermark inside the week
 * collapse into the single Monday digest email they shared.
 */
export async function countEmailsSentThisWeek(userIds: string[], now: Date): Promise<Map<string, number>> {
  const counts = new Map<string, number>();

  if (!userIds.length) {
    return counts;
  }

  const weekStart = weekStartUtc(now);
  const [sentRows, alertedSubscriptions] = await Promise.all([
    db
      .select({ userId: reminders.userId, type: reminders.type })
      .from(reminders)
      .where(
        and(
          inArray(reminders.userId, userIds),
          eq(reminders.channel, "email"),
          isNotNull(reminders.sentAt),
          gte(reminders.sentAt, weekStart)
        )
      ),
    db
      .select({ userId: countryAlertSubscriptions.userId })
      .from(countryAlertSubscriptions)
      .where(and(inArray(countryAlertSubscriptions.userId, userIds), gte(countryAlertSubscriptions.lastNotifiedAt, weekStart))),
  ]);

  const digestUsers = new Set<string>(alertedSubscriptions.map((row) => row.userId));

  for (const row of sentRows) {
    if (digestReminderTypes.some((digestType) => digestType === row.type)) {
      digestUsers.add(row.userId);
    } else {
      counts.set(row.userId, (counts.get(row.userId) ?? 0) + 1);
    }
  }

  for (const userId of digestUsers) {
    counts.set(userId, (counts.get(userId) ?? 0) + 1);
  }

  return counts;
}
