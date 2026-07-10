import { createHash } from "node:crypto";

import { and, eq, inArray, isNull, lte } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { hackathons, reminders, users } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { buildReminderEmail } from "@/lib/notifications/reminder-email";
import { resend } from "@/lib/notifications/resend";

// The Resend batch API accepts at most 100 emails per call, so the query limit
// and the batch size are the same number.
const BATCH_SIZE = 100;

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

  if (!due.length) {
    return NextResponse.json({ data: { due: 0, sent: 0, failed: 0 } });
  }

  const emails = await Promise.all(
    due.map(async (reminder) => {
      const { subject, html, text } = await buildReminderEmail({
        type: reminder.type,
        firstName: reminder.firstName,
        hackathonName: reminder.hackathonName,
        hackathonSlug: reminder.hackathonSlug,
        scheduledFor: reminder.scheduledFor,
        appUrl: env.NEXT_PUBLIC_APP_URL,
      });

      return {
        from: env.RESEND_AUDIENCE_FROM as string,
        to: reminder.email,
        subject,
        html,
        text,
      };
    })
  );

  // Stable per-batch idempotency key so a retry of the exact same due set (e.g.
  // after the DB update below fails) is deduplicated by Resend rather than
  // sending twice.
  const idempotencyKey = `reminders:${createHash("sha256")
    .update(due.map((reminder) => reminder.id).join(","))
    .digest("hex")}`;

  const { data, error } = await resend.batch.send(emails, {
    idempotencyKey,
    // Permissive validation sends the valid emails and reports the rest in
    // `errors` instead of rejecting the whole batch over one bad address.
    batchValidation: "permissive",
  });

  if (error) {
    return NextResponse.json({ data: { due: due.length, sent: 0, failed: due.length } });
  }

  const failedIndices = new Set((data && "errors" in data ? (data.errors ?? []) : []).map((entry) => entry.index));
  const sentIds = due.filter((_, index) => !failedIndices.has(index)).map((reminder) => reminder.id);

  if (sentIds.length) {
    await db.update(reminders).set({ sentAt: new Date() }).where(inArray(reminders.id, sentIds));
  }

  return NextResponse.json({
    data: { due: due.length, sent: sentIds.length, failed: failedIndices.size },
  });
}
