import { NextResponse } from "next/server";

import { requireAdminUser } from "@/lib/auth";
import { importAdminHackathons } from "@/lib/hackathons/review-service";
import { adminHackathonImportSchema } from "@/lib/validations/hackathon";

export async function POST(request: Request) {
  const gate = await requireAdminUser();

  if (!gate.ok) {
    return NextResponse.json({ error: gate.reason }, { status: gate.reason === "unauthenticated" ? 401 : 403 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = adminHackathonImportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await importAdminHackathons({
      payloads: parsed.data.hackathons,
      reviewerUserId: gate.user.id,
    });

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to import hackathons." },
      { status: 400 }
    );
  }
}
