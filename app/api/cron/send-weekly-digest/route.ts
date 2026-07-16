import { createHash } from "node:crypto";

import * as Sentry from "@sentry/nextjs";
import { and, asc, eq, inArray, isNull, lt, lte, or } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { hackathons, reminders, users } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { digestReminderTypes } from "@/lib/hackathons/reminder-plan";
import {
  advanceCountryAlertWatermarks,
  getDueCountryAlertDeliveries,
  type CountryAlertDelivery,
} from "@/lib/notifications/country-alerts";
import { countEmailsSentThisWeek } from "@/lib/notifications/email-budget";
import { WEEKLY_EMAIL_LIMIT } from "@/lib/notifications/email-week";
import { buildWeeklyDigestEmail, type WeeklyDigestReminderRow } from "@/lib/notifications/weekly-digest-email";
import { resend } from "@/lib/notifications/resend";
import { buildUnsubscribeUrl, unsubscribeHeaders } from "@/lib/notifications/unsubscribe";

const DAY_MS = 86_400_000;
/* The Monday digest looks ahead: every digest reminder whose scheduledFor
   falls inside the coming week rides this send, so a "week before" heads-up
   lands 7–14 days ahead of its event instead of trickling out mid-week. */
const DIGEST_WINDOW_MS = 7 * DAY_MS;
const CLAIM_LEASE_MS = 10 * 60 * 1000;
// The Resend batch API accepts at most 100 emails per call.
const RESEND_BATCH_SIZE = 100;
const CLAIM_BATCH_SIZE = 200;
const MAX_CLAIM_BATCHES = 10;

export const maxDuration = 60;

type DigestUser = {
  userId: string;
  email: string;
  firstName: string | null;
  reminderRows: (WeeklyDigestReminderRow & { id: string })[];
  countryDelivery: CountryAlertDelivery | null;
};

export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!resend || !env.RESEND_AUDIENCE_FROM) {
    return NextResponse.json({ error: "Resend is not configured." }, { status: 503 });
  }

  const now = new Date();
  const horizon = new Date(now.getTime() + DIGEST_WINDOW_MS);
  const staleBefore = new Date(now.getTime() - DIGEST_WINDOW_MS);
  const claimExpiredBefore = new Date(now.getTime() - CLAIM_LEASE_MS);

  // A digest reminder whose event already passed (its scheduledFor is a week
  // before the event) can no longer be usefully announced — drop it instead of
  // letting it clog pending counts or send stale.
  await db
    .delete(reminders)
    .where(
      and(
        isNull(reminders.sentAt),
        eq(reminders.channel, "email"),
        inArray(reminders.type, [...digestReminderTypes]),
        lt(reminders.scheduledFor, staleBefore)
      )
    );

  // Claim in batches until the week's rows are exhausted. The eligibility
  // predicate is repeated on the update so concurrent invocations cannot both
  // claim the same reminder after selecting it.
  const claimedIds: string[] = [];

  for (let batch = 0; batch < MAX_CLAIM_BATCHES; batch += 1) {
    const candidates = await db
      .select({ id: reminders.id })
      .from(reminders)
      .innerJoin(users, eq(users.id, reminders.userId))
      .where(
        and(
          isNull(reminders.sentAt),
          eq(reminders.channel, "email"),
          inArray(reminders.type, [...digestReminderTypes]),
          lte(reminders.scheduledFor, horizon),
          isNull(users.emailUnsubscribedAt),
          or(isNull(reminders.claimedAt), lt(reminders.claimedAt, claimExpiredBefore))
        )
      )
      .orderBy(asc(reminders.scheduledFor))
      .limit(CLAIM_BATCH_SIZE);

    if (!candidates.length) {
      break;
    }

    const claimed = await db
      .update(reminders)
      .set({ claimedAt: now })
      .where(
        and(
          inArray(reminders.id, candidates.map((candidate) => candidate.id)),
          isNull(reminders.sentAt),
          or(isNull(reminders.claimedAt), lt(reminders.claimedAt, claimExpiredBefore))
        )
      )
      .returning({ id: reminders.id });

    claimedIds.push(...claimed.map((row) => row.id));

    if (candidates.length < CLAIM_BATCH_SIZE) {
      break;
    }

    if (batch === MAX_CLAIM_BATCHES - 1) {
      Sentry.captureMessage("Weekly digest hit its claim batch cap; leftovers wait for the next run.", {
        level: "warning",
        extra: { claimed: claimedIds.length },
      });
    }
  }

  const [claimedRows, countryDeliveries] = await Promise.all([
    claimedIds.length
      ? db
          .select({
            id: reminders.id,
            type: reminders.type,
            scheduledFor: reminders.scheduledFor,
            userId: users.id,
            email: users.email,
            firstName: users.firstName,
            hackathonName: hackathons.name,
            hackathonSlug: hackathons.slug,
          })
          .from(reminders)
          .innerJoin(users, eq(users.id, reminders.userId))
          .innerJoin(hackathons, eq(hackathons.id, reminders.hackathonId))
          .where(inArray(reminders.id, claimedIds))
          .orderBy(asc(reminders.scheduledFor))
      : Promise.resolve([]),
    getDueCountryAlertDeliveries(),
  ]);

  // One digest per user, no matter how many sources feed it.
  const byUser = new Map<string, DigestUser>();

  for (const row of claimedRows) {
    const user = byUser.get(row.userId) ?? {
      userId: row.userId,
      email: row.email,
      firstName: row.firstName,
      reminderRows: [],
      countryDelivery: null,
    };
    user.reminderRows.push({
      id: row.id,
      type: row.type,
      scheduledFor: row.scheduledFor,
      hackathonName: row.hackathonName,
      hackathonSlug: row.hackathonSlug,
    });
    byUser.set(row.userId, user);
  }

  for (const delivery of countryDeliveries) {
    const user = byUser.get(delivery.userId) ?? {
      userId: delivery.userId,
      email: delivery.email,
      firstName: delivery.firstName,
      reminderRows: [],
      countryDelivery: null,
    };
    user.countryDelivery = delivery;
    byUser.set(delivery.userId, user);
  }

  if (!byUser.size) {
    return NextResponse.json({ data: { users: 0, sent: 0, failed: 0, skipped: 0 } });
  }

  // Weekly-limit backstop: subscribe-time enforcement should make this a
  // no-op, but never let the digest become a sixth email in someone's week.
  const sentThisWeek = await countEmailsSentThisWeek([...byUser.keys()], now);
  const skippedUsers: DigestUser[] = [];
  const digestUsers: DigestUser[] = [];

  for (const user of byUser.values()) {
    if ((sentThisWeek.get(user.userId) ?? 0) >= WEEKLY_EMAIL_LIMIT) {
      skippedUsers.push(user);
    } else {
      digestUsers.push(user);
    }
  }

  if (skippedUsers.length) {
    Sentry.captureMessage("Weekly digest skipped users already at the weekly email limit.", {
      level: "warning",
      extra: { skipped: skippedUsers.length },
    });
    const skippedRowIds = skippedUsers.flatMap((user) => user.reminderRows.map((row) => row.id));

    if (skippedRowIds.length) {
      await db.update(reminders).set({ claimedAt: null }).where(inArray(reminders.id, skippedRowIds));
    }
  }

  let sent = 0;
  let failed = 0;

  for (let offset = 0; offset < digestUsers.length; offset += RESEND_BATCH_SIZE) {
    const chunk = digestUsers.slice(offset, offset + RESEND_BATCH_SIZE);

    const emails = await Promise.all(
      chunk.map(async (user) => {
        const { subject, html, text } = await buildWeeklyDigestEmail({
          firstName: user.firstName,
          reminderRows: user.reminderRows,
          country: user.countryDelivery?.country ?? null,
          countryItems: user.countryDelivery?.items ?? [],
          appUrl: env.NEXT_PUBLIC_APP_URL,
          unsubscribeUrl: buildUnsubscribeUrl(user.userId),
        });

        return {
          from: env.RESEND_AUDIENCE_FROM as string,
          to: user.email,
          subject,
          html,
          text,
          headers: unsubscribeHeaders(user.userId),
        };
      })
    );

    // Stable per-chunk idempotency key (reminder ids + alert watermarks) so a
    // retried dispatch of the same due set is deduplicated by Resend.
    const idempotencyKey = `weekly-digest:${createHash("sha256")
      .update(
        chunk
          .map((user) =>
            [
              user.userId,
              ...user.reminderRows.map((row) => row.id),
              user.countryDelivery
                ? `${user.countryDelivery.subscriptionId}:${user.countryDelivery.lastNotifiedAt.toISOString()}`
                : "",
            ].join("|")
          )
          .join(",")
      )
      .digest("hex")}`;

    const { data, error } = await resend.batch.send(emails, {
      idempotencyKey,
      // Permissive validation sends the valid emails and reports the rest in
      // `errors` instead of rejecting the whole chunk over one bad address.
      batchValidation: "permissive",
    });

    if (error) {
      Sentry.captureException(new Error(`Weekly digest batch send failed: ${error.message}`), {
        extra: { chunkSize: chunk.length, idempotencyKey },
      });
      const chunkRowIds = chunk.flatMap((user) => user.reminderRows.map((row) => row.id));

      if (chunkRowIds.length) {
        await db.update(reminders).set({ claimedAt: null }).where(inArray(reminders.id, chunkRowIds));
      }

      failed += chunk.length;
      continue;
    }

    const failedIndices = new Set((data && "errors" in data ? (data.errors ?? []) : []).map((entry) => entry.index));

    if (failedIndices.size) {
      Sentry.captureMessage("Some weekly digest emails were rejected by Resend.", {
        level: "warning",
        extra: { chunkSize: chunk.length, failed: failedIndices.size },
      });
    }

    const delivered = chunk.filter((_, index) => !failedIndices.has(index));
    const rejected = chunk.filter((_, index) => failedIndices.has(index));

    const deliveredRowIds = delivered.flatMap((user) => user.reminderRows.map((row) => row.id));
    const rejectedRowIds = rejected.flatMap((user) => user.reminderRows.map((row) => row.id));

    if (deliveredRowIds.length) {
      await db.update(reminders).set({ claimedAt: null, sentAt: new Date() }).where(inArray(reminders.id, deliveredRowIds));
    }

    if (rejectedRowIds.length) {
      await db.update(reminders).set({ claimedAt: null }).where(inArray(reminders.id, rejectedRowIds));
    }

    // Rejected subscribers keep their watermark and retry next Monday.
    await advanceCountryAlertWatermarks(
      delivered.flatMap((user) => (user.countryDelivery ? [user.countryDelivery] : [])),
      now
    );

    sent += delivered.length;
    failed += failedIndices.size;
  }

  const body = {
    data: { users: byUser.size, sent, failed, skipped: skippedUsers.length },
  };

  // Failed sends were released to retry; surface the run as failed so Vercel's
  // cron log shows it needed a retry instead of it disappearing into a 200.
  return failed ? NextResponse.json({ ...body, error: "Some digests failed to send." }, { status: 500 }) : NextResponse.json(body);
}
