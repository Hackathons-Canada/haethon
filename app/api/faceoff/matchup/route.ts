import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUserContext } from "@/lib/auth";
import { db } from "@/lib/db";
import { hackathonFaceoffMatchups } from "@/lib/db/schema";
import { getPublicHackathonCatalogSnapshot } from "@/lib/hackathons/catalog";
import { pickChallenger, pickMatchup } from "@/lib/hackathons/faceoff-pairing";
import { getFaceoffImpressionCounts, getLiveFaceoffRatings } from "@/lib/hackathons/faceoff-service";
import { resolveFaceoffVoter, setFaceoffVoterCookie } from "@/lib/hackathons/faceoff-voter";

const MATCHUP_TTL_MS = 10 * 60 * 1000;
const skipSchema = z.object({ matchupId: z.string().uuid() });

export async function GET(request: Request) {
  const userContext = await getCurrentUserContext();
  const voter = await resolveFaceoffVoter(userContext?.user.id ?? null);
  const searchParams = new URL(request.url).searchParams;
  const recentIds = searchParams
    .getAll("exclude")
    .slice(0, 8)
    .filter((value) => z.string().uuid().safeParse(value).success);
  /* Streak mode pins the reigning hackathon to the left slot; `anchor` names it. */
  const anchorParam = searchParams.get("anchor");
  const anchorId = anchorParam && z.string().uuid().safeParse(anchorParam).success ? anchorParam : null;
  const [{ cards }, liveRatings, impressionCounts] = await Promise.all([
    getPublicHackathonCatalogSnapshot(),
    getLiveFaceoffRatings(),
    getFaceoffImpressionCounts(),
  ]);
  const ratingsById = new Map(liveRatings.map((rating) => [rating.id, rating]));
  const impressionsById = new Map(impressionCounts.map((entry) => [entry.id, entry.impressions]));
  const candidates = cards.map((card) => ({
    ...card,
    ...(ratingsById.get(card.id) ?? {}),
    faceoffImpressions: impressionsById.get(card.id) ?? 0,
  }));
  const anchoredPair = anchorId ? pickChallenger(candidates, anchorId, recentIds) : null;
  const pair = anchoredPair ?? pickMatchup(candidates, recentIds);

  if (!pair) {
    return NextResponse.json({ error: "Not enough eligible hackathons." }, { status: 404 });
  }

  // An anchored pair keeps the champion on the left; fresh pairs still randomize sides.
  const [left, right] = anchoredPair ? pair : Math.random() < 0.5 ? pair : [pair[1], pair[0]];
  const expiresAt = new Date(Date.now() + MATCHUP_TTL_MS);
  const [matchup] = await db
    .insert(hackathonFaceoffMatchups)
    .values({
      leftId: left.id,
      rightId: right.id,
      voterFingerprint: voter.fingerprint,
      expiresAt,
    })
    .returning({ id: hackathonFaceoffMatchups.id });

  const response = NextResponse.json({
    data: {
      id: matchup.id,
      leftId: left.id,
      rightId: right.id,
      expiresAt: expiresAt.toISOString(),
    },
  });
  setFaceoffVoterCookie(response, voter.anonymousIdToSet);

  return response;
}

export async function PATCH(request: Request) {
  const parsed = skipSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const userContext = await getCurrentUserContext();
  const voter = await resolveFaceoffVoter(userContext?.user.id ?? null);
  const skippedAt = new Date();
  const [skipped] = await db
    .update(hackathonFaceoffMatchups)
    .set({ skippedAt })
    .where(
      and(
        eq(hackathonFaceoffMatchups.id, parsed.data.matchupId),
        eq(hackathonFaceoffMatchups.voterFingerprint, voter.fingerprint),
        isNull(hackathonFaceoffMatchups.consumedAt),
        isNull(hackathonFaceoffMatchups.skippedAt)
      )
    )
    .returning({ id: hackathonFaceoffMatchups.id });

  const response = NextResponse.json({ data: { skipped: Boolean(skipped) } });
  setFaceoffVoterCookie(response, voter.anonymousIdToSet);

  return response;
}
