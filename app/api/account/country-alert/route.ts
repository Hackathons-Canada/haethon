import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUserContext } from "@/lib/auth";
import { db } from "@/lib/db";
import { countryAlertSubscriptions } from "@/lib/db/schema";
import { normalizeCountrySelections } from "@/lib/hackathons/countries";
import { getCommittedEmailEvents } from "@/lib/notifications/email-budget";
import { findWeekOverEmailLimit } from "@/lib/notifications/email-week";

const countryAlertSchema = z.object({
  country: z.string().min(1).max(120),
});

/* Creates or replaces the caller's single country alert — the unique userId
   column means saving a new country swaps the old one out. Alerts are
   weekly-only: their content rides the Monday digest email. */
export async function PUT(request: Request) {
  const userContext = await getCurrentUserContext();

  if (!userContext) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const parsed = countryAlertSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [country] = normalizeCountrySelections([parsed.data.country]);

  if (!country) {
    return NextResponse.json({ error: "Unknown country." }, { status: 400 });
  }

  const now = new Date();
  const [existing] = await db
    .select({ country: countryAlertSubscriptions.country })
    .from(countryAlertSubscriptions)
    .where(eq(countryAlertSubscriptions.userId, userContext.user.id))
    .limit(1);

  // A new subscription reserves the weekly digest slot; refuse it when some
  // week is already fully booked with five emails. Switching country on an
  // existing subscription adds nothing, so it always goes through.
  if (!existing) {
    const committed = await getCommittedEmailEvents({ userId: userContext.user.id, now });

    if (findWeekOverEmailLimit(committed.events, true)) {
      return NextResponse.json(
        { code: "notification_limit", error: "For now, you're limited to five emails per week." },
        { status: 409 }
      );
    }
  }

  // Switching country restarts the watermark at "now" so the subscriber is
  // alerted about future additions, not the new country's existing backlog.
  const resetWatermark = !existing || existing.country !== country;

  await db
    .insert(countryAlertSubscriptions)
    .values({
      userId: userContext.user.id,
      country,
      lastNotifiedAt: now,
    })
    .onConflictDoUpdate({
      target: countryAlertSubscriptions.userId,
      set: {
        country,
        updatedAt: now,
        ...(resetWatermark ? { lastNotifiedAt: now } : {}),
      },
    });

  return NextResponse.json({ data: { country } });
}

export async function DELETE() {
  const userContext = await getCurrentUserContext();

  if (!userContext) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  await db.delete(countryAlertSubscriptions).where(eq(countryAlertSubscriptions.userId, userContext.user.id));

  return NextResponse.json({ data: { removed: true } });
}
