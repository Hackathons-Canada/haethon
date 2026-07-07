import { and, eq, isNull, lte } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { hackathons, reminders, users } from "@/lib/db/schema";
import { formatReminderDate, reminderTypeLabels } from "@/lib/hackathons/reminder-labels";
import { env } from "@/lib/env";
import { resend } from "@/lib/notifications/resend";

const BATCH_SIZE = 100;

const reminderBodies: Record<string, string> = {
  application_open: "Applications are open. Grab a spot before the rush.",
  application_close: "Applications close soon. Get yours in.",
  acceptance_date: "Acceptance decisions are due. Check your inbox and update your status.",
  hackathon_start: "The event is coming up. Time to sort travel, teammates, and ideas.",
  check_in: "It's hackathon day. Check in at the venue to verify your attendance.",
  attendance_check: "The event is wrapping up. Redeem your check-in code if you haven't yet.",
  add_to_profile: "How did it go? Mark it attended so it counts on your profile.",
};

export async function GET(request: Request) {
  if (!env.CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 503 });
  }

  if (request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!resend || !env.RESEND_AUDIENCE_FROM) {
    return NextResponse.json({ error: "Resend is not configured." }, { status: 503 });
  }

  const due = await db
    .select({
      id: reminders.id,
      type: reminders.type,
      scheduledFor: reminders.scheduledFor,
      email: users.email,
      firstName: users.firstName,
      hackathonName: hackathons.name,
      hackathonSlug: hackathons.slug,
    })
    .from(reminders)
    .innerJoin(users, eq(users.id, reminders.userId))
    .innerJoin(hackathons, eq(hackathons.id, reminders.hackathonId))
    .where(and(isNull(reminders.sentAt), lte(reminders.scheduledFor, new Date()), eq(reminders.channel, "email")))
    .limit(BATCH_SIZE);

  let sent = 0;
  let failed = 0;

  for (const reminder of due) {
    const label = reminderTypeLabels[reminder.type] ?? reminder.type;
    const detailUrl = `${env.NEXT_PUBLIC_APP_URL}/hackathons/${reminder.hackathonSlug}`;
    const lines = [
      `Hey ${reminder.firstName ?? "hacker"},`,
      "",
      `${reminder.hackathonName}: ${reminderBodies[reminder.type] ?? label}`,
      "",
      `Scheduled for: ${formatReminderDate(reminder.scheduledFor)}`,
      `Event details: ${detailUrl}`,
      `Your pipeline: ${env.NEXT_PUBLIC_APP_URL}/my`,
    ];

    try {
      await resend.emails.send({
        from: env.RESEND_AUDIENCE_FROM,
        to: reminder.email,
        subject: `${label} · ${reminder.hackathonName}`,
        text: lines.join("\n"),
      });

      await db.update(reminders).set({ sentAt: new Date() }).where(eq(reminders.id, reminder.id));
      sent += 1;
    } catch {
      failed += 1;
    }
  }

  return NextResponse.json({ data: { due: due.length, sent, failed } });
}
