import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { requireAdminUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { hackathonDates, hackathons } from "@/lib/db/schema";
import { computeSelectableReminderPlan } from "@/lib/hackathons/reminder-plan";
import { env } from "@/lib/env";
import { buildReminderEmail } from "@/lib/notifications/reminder-email";
import { resend } from "@/lib/notifications/resend";
import { reminderEmailTestSchema } from "@/lib/validations/hackathon";

// Far enough in the past that every real hackathon date counts as "future", so
// the planner returns a scheduled date for the requested type regardless of
// whether the event has already happened.
const EPOCH = new Date(0);

export async function POST(request: Request) {
  const gate = await requireAdminUser();

  if (!gate.ok) {
    return NextResponse.json({ error: gate.reason }, { status: gate.reason === "unauthenticated" ? 401 : 403 });
  }

  if (!resend || !env.RESEND_AUDIENCE_FROM) {
    return NextResponse.json({ error: "Resend is not configured." }, { status: 503 });
  }

  const parsed = reminderEmailTestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { email, hackathonId, type } = parsed.data;

  const [hackathon] = await db
    .select({
      name: hackathons.name,
      slug: hackathons.slug,
      startsAt: hackathonDates.startsAt,
      endsAt: hackathonDates.endsAt,
      applicationOpensAt: hackathonDates.applicationOpensAt,
      applicationClosesAt: hackathonDates.applicationClosesAt,
      acceptanceAt: hackathonDates.acceptanceAt,
    })
    .from(hackathons)
    .leftJoin(hackathonDates, eq(hackathonDates.hackathonId, hackathons.id))
    .where(eq(hackathons.id, hackathonId))
    .limit(1);

  if (!hackathon) {
    return NextResponse.json({ error: "Hackathon not found." }, { status: 404 });
  }

  const plan = computeSelectableReminderPlan(
    {
      startsAt: hackathon.startsAt,
      endsAt: hackathon.endsAt,
      applicationOpensAt: hackathon.applicationOpensAt,
      applicationClosesAt: hackathon.applicationClosesAt,
      acceptanceAt: hackathon.acceptanceAt,
    },
    EPOCH
  );
  // Fall back to now when the hackathon has no date for the requested reminder,
  // so the test still renders a plausible email.
  const scheduledFor = plan.find((entry) => entry.type === type)?.scheduledFor ?? new Date();

  const { subject, html, text } = await buildReminderEmail({
    type,
    firstName: gate.user.firstName,
    hackathonName: hackathon.name,
    hackathonSlug: hackathon.slug,
    scheduledFor,
    appUrl: env.NEXT_PUBLIC_APP_URL,
    // Keep the preview layout identical without giving a test recipient a
    // signed link that could unsubscribe the admin who sent it.
    unsubscribeUrl: `${env.NEXT_PUBLIC_APP_URL}/account#email-preferences`,
  });

  const { error } = await resend.emails.send({
    from: env.RESEND_AUDIENCE_FROM,
    to: email,
    subject: `[Test] ${subject}`,
    html,
    text,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }

  return NextResponse.json({ data: { sentTo: email, subject } });
}
