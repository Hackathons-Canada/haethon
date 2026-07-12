import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { resend } from "@/lib/notifications/resend";
import { buildUnsubscribeUrl, unsubscribeHeaders } from "@/lib/notifications/unsubscribe";

type SubmissionEmailStatus = "received" | "approved" | "merged" | "rejected";

const statusCopy: Record<SubmissionEmailStatus, { subject: string; body: string }> = {
  received: {
    subject: "Hackathon submission received",
    body: "Thanks for sending this in. The submission is now in the review queue.",
  },
  approved: {
    subject: "Hackathon submission approved",
    body: "Your submission has been approved and published.",
  },
  merged: {
    subject: "Hackathon submission merged",
    body: "Your submission matched an existing hackathon and helped update the canonical listing.",
  },
  rejected: {
    subject: "Hackathon submission reviewed",
    body: "Your submission was reviewed but was not published.",
  },
};

export async function sendSubmissionEmail(input: {
  to: string | null | undefined;
  status: SubmissionEmailStatus;
  hackathonName: string;
  reason?: string | null;
  hackathonUrl?: string | null;
}) {
  if (!resend || !env.RESEND_AUDIENCE_FROM || !input.to) {
    return;
  }

  // A send failure must never fail the submission itself — the status change
  // already happened; the email is best-effort and reported to Sentry.
  try {
    // Honor the global opt-out when the recipient is a known user. Their
    // signed unsubscribe link also goes in the footer and headers.
    const [recipient] = await db
      .select({ id: users.id, emailUnsubscribedAt: users.emailUnsubscribedAt })
      .from(users)
      .where(eq(users.email, input.to))
      .limit(1);

    if (recipient?.emailUnsubscribedAt) {
      return;
    }

    const copy = statusCopy[input.status];
    const lines = [
      copy.body,
      "",
      `Hackathon: ${input.hackathonName}`,
      input.reason ? `Reason: ${input.reason}` : null,
      input.hackathonUrl ? `View it here: ${input.hackathonUrl}` : null,
      recipient ? "" : null,
      recipient ? `Unsubscribe from all Haethon emails: ${buildUnsubscribeUrl(recipient.id)}` : null,
    ].filter((line): line is string => line !== null);

    await resend.emails.send({
      from: env.RESEND_AUDIENCE_FROM,
      to: input.to,
      subject: copy.subject,
      text: lines.join("\n"),
      ...(recipient ? { headers: unsubscribeHeaders(recipient.id) } : {}),
    });
  } catch (error) {
    console.error("Failed to send submission email", error);
    Sentry.captureException(error, { extra: { status: input.status, hackathonName: input.hackathonName } });
  }
}
