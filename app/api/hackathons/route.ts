import { and, asc, eq, gte, ilike, lte, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { hackathonDates, hackathonLocations, hackathons } from "@/lib/db/schema";
import { hackathonSearchSchema } from "@/lib/validations/hackathon";

export async function GET(request: Request) {
  const parsed = hackathonSearchSchema.safeParse(Object.fromEntries(new URL(request.url).searchParams.entries()));

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { q, city, country, format, status, startsAfter, startsBefore, limit } = parsed.data;

  const rows = await db
    .select({
      id: hackathons.id,
      name: hackathons.name,
      slug: hackathons.slug,
      shortDescription: hackathons.shortDescription,
      format: hackathons.format,
      status: hackathons.status,
      city: hackathonLocations.city,
      region: hackathonLocations.region,
      country: hackathonLocations.country,
      startsAt: hackathonDates.startsAt,
      endsAt: hackathonDates.endsAt,
      score: q ? sql<number>`similarity(${hackathons.name}, ${q})` : sql<number>`0`,
    })
    .from(hackathons)
    .leftJoin(hackathonLocations, eq(hackathonLocations.hackathonId, hackathons.id))
    .leftJoin(hackathonDates, eq(hackathonDates.hackathonId, hackathons.id))
    .where(
      and(
        q ? ilike(hackathons.name, `%${q}%`) : undefined,
        city ? ilike(hackathonLocations.city, `%${city}%`) : undefined,
        country ? eq(hackathonLocations.country, country) : undefined,
        format ? eq(hackathons.format, format) : undefined,
        status ? eq(hackathons.status, status) : undefined,
        startsAfter ? gte(hackathonDates.startsAt, startsAfter) : undefined,
        startsBefore ? lte(hackathonDates.startsAt, startsBefore) : undefined
      )
    )
    .orderBy(q ? sql`similarity(${hackathons.name}, ${q}) desc` : asc(hackathonDates.startsAt))
    .limit(limit);

  return NextResponse.json({ data: rows });
}
