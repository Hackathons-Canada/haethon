import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getCurrentUserContext } from "@/lib/auth";
import { db } from "@/lib/db";
import { reminders } from "@/lib/db/schema";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const userContext = await getCurrentUserContext();

  if (!userContext) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { id } = await context.params;
  const [deleted] = await db
    .delete(reminders)
    .where(and(eq(reminders.id, id), eq(reminders.userId, userContext.user.id), isNull(reminders.sentAt)))
    .returning({ id: reminders.id });

  if (!deleted) {
    return NextResponse.json({ error: "Reminder not found." }, { status: 404 });
  }

  return NextResponse.json({ data: deleted });
}
