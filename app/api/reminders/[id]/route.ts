import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getCurrentUserContext } from "@/lib/auth";
import { db } from "@/lib/db";
import { reminders } from "@/lib/db/schema";
import { isSelectableReminderType, setUserHackathonNotificationPreferences } from "@/lib/hackathons/reminders";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const userContext = await getCurrentUserContext();

  if (!userContext) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { id } = await context.params;
  const [reminder] = await db
    .select({
      id: reminders.id,
      hackathonId: reminders.hackathonId,
      type: reminders.type,
    })
    .from(reminders)
    .where(and(eq(reminders.id, id), eq(reminders.userId, userContext.user.id), isNull(reminders.sentAt)))
    .limit(1);

  if (!reminder) {
    return NextResponse.json({ error: "Reminder not found." }, { status: 404 });
  }

  if (isSelectableReminderType(reminder.type)) {
    await setUserHackathonNotificationPreferences({
      userId: userContext.user.id,
      hackathonId: reminder.hackathonId,
      preferences: [{ type: reminder.type, enabled: false }],
    });
  }

  const [deleted] = await db
    .delete(reminders)
    .where(and(eq(reminders.id, id), eq(reminders.userId, userContext.user.id), isNull(reminders.sentAt)))
    .returning({ id: reminders.id });

  if (!deleted) {
    return NextResponse.json({ error: "Reminder not found." }, { status: 404 });
  }

  return NextResponse.json({ data: deleted });
}
