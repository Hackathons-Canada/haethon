import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { reminders, users } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { verifyUnsubscribeToken } from "@/lib/notifications/unsubscribe";

/* Signed-link unsubscribe. GET serves the link a human clicks in the email
   footer; POST is the RFC 8058 one-click endpoint mail clients call from
   their native "Unsubscribe" button. Both are public (no session) — the HMAC
   token is the authorization. */

async function unsubscribe(token: string | null) {
  const userId = token ? verifyUnsubscribeToken(token) : null;

  if (!userId) {
    return false;
  }

  const updated = await db
    .update(users)
    .set({ emailUnsubscribedAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning({ id: users.id });

  if (!updated.length) {
    return false;
  }

  // Clear the queue too so the cron never has to re-filter these and the
  // pending-reminder counts users see elsewhere drop to zero immediately.
  await db
    .delete(reminders)
    .where(and(eq(reminders.userId, userId), eq(reminders.channel, "email"), isNull(reminders.sentAt)));

  return true;
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");

  if (!(await unsubscribe(token))) {
    return NextResponse.json({ error: "Invalid or expired unsubscribe link." }, { status: 400 });
  }

  return NextResponse.redirect(new URL("/unsubscribed", env.NEXT_PUBLIC_APP_URL));
}

export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get("token");

  if (!(await unsubscribe(token))) {
    return NextResponse.json({ error: "Invalid unsubscribe token." }, { status: 400 });
  }

  return NextResponse.json({ data: { unsubscribed: true } });
}
