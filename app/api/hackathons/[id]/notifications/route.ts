import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getCurrentUserContext } from "@/lib/auth";
import { db } from "@/lib/db";
import { hackathons, userHackathons } from "@/lib/db/schema";
import {
  computePlannedEmailReminderEntries,
  countPendingEmailReminders,
  setUserHackathonNotificationPreferences,
  syncRemindersForUserHackathon,
} from "@/lib/hackathons/reminders";
import { getCommittedEmailEvents } from "@/lib/notifications/email-budget";
import { findWeekOverEmailLimit } from "@/lib/notifications/email-week";
import { hackathonNotificationPreferencesSchema } from "@/lib/validations/hackathon";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const userContext = await getCurrentUserContext();

  if (!userContext) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const parsed = hackathonNotificationPreferencesSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { id } = await context.params;
  const [hackathon] = await db.select({ id: hackathons.id }).from(hackathons).where(eq(hackathons.id, id)).limit(1);

  if (!hackathon) {
    return NextResponse.json({ error: "Hackathon not found." }, { status: 404 });
  }

  const [plannedEntries, currentCount, committed] = await Promise.all([
    computePlannedEmailReminderEntries({
      userId: userContext.user.id,
      hackathonId: id,
      preferences: parsed.data.preferences,
    }),
    countPendingEmailReminders({ userId: userContext.user.id, hackathonId: id }),
    getCommittedEmailEvents({ userId: userContext.user.id, excludeHackathonId: id }),
  ]);

  // Only changes that add sends are refused, so anyone already past the cap
  // can still turn reminders off. The check books this hackathon's new plan
  // against everything else already promised, week by calendar week.
  if (plannedEntries.length > currentCount) {
    const bookedEvents = [
      ...committed.events,
      ...plannedEntries.map((entry) => ({ type: entry.type, occursAt: entry.scheduledFor })),
    ];

    if (findWeekOverEmailLimit(bookedEvents, committed.hasCountryAlert)) {
      return NextResponse.json(
        { code: "notification_limit", error: "For now, you're limited to five emails per week." },
        { status: 409 }
      );
    }
  }

  const [tracked] = await db
    .insert(userHackathons)
    .values({
      userId: userContext.user.id,
      hackathonId: id,
      isSaved: true,
    })
    .onConflictDoUpdate({
      target: [userHackathons.userId, userHackathons.hackathonId],
      set: {
        isSaved: true,
        updatedAt: new Date(),
      },
    })
    .returning({
      isSaved: userHackathons.isSaved,
    });

  await setUserHackathonNotificationPreferences({
    userId: userContext.user.id,
    hackathonId: id,
    preferences: parsed.data.preferences,
  });

  await syncRemindersForUserHackathon({
    userId: userContext.user.id,
    hackathonId: id,
    isSaved: tracked.isSaved,
  });

  return NextResponse.json({ data: { preferences: parsed.data.preferences } });
}
