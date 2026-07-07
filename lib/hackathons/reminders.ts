import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { hackathonDates, reminders } from "@/lib/db/schema";
import { computeReminderPlan, type ApplicationStatus } from "@/lib/hackathons/reminder-plan";

/**
 * Replace a user's pending reminders for a hackathon with the plan for their
 * current status. Reminders that already went out are kept as history.
 * Unsaving a hackathon clears pending reminders instead.
 */
export async function syncRemindersForUserHackathon({
  userId,
  hackathonId,
  applicationStatus,
  isSaved,
  now = new Date(),
}: {
  userId: string;
  hackathonId: string;
  applicationStatus: ApplicationStatus;
  isSaved: boolean;
  now?: Date;
}) {
  await db
    .delete(reminders)
    .where(and(eq(reminders.userId, userId), eq(reminders.hackathonId, hackathonId), isNull(reminders.sentAt)));

  if (!isSaved) {
    return;
  }

  const [dates] = await db
    .select({
      startsAt: hackathonDates.startsAt,
      endsAt: hackathonDates.endsAt,
      applicationOpensAt: hackathonDates.applicationOpensAt,
      applicationClosesAt: hackathonDates.applicationClosesAt,
      acceptanceAt: hackathonDates.acceptanceAt,
    })
    .from(hackathonDates)
    .where(eq(hackathonDates.hackathonId, hackathonId))
    .limit(1);

  const plan = computeReminderPlan(applicationStatus, dates ?? null, now);

  if (!plan.length) {
    return;
  }

  await db.insert(reminders).values(
    plan.map((entry) => ({
      userId,
      hackathonId,
      type: entry.type,
      channel: "email" as const,
      scheduledFor: entry.scheduledFor,
    }))
  );
}
