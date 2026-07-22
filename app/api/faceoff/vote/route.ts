import { randomUUID } from "node:crypto";

import { and, eq, gte, inArray, or } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getCurrentUserContext } from "@/lib/auth";
import { db } from "@/lib/db";
import { hackathonFaceoffVotes, hackathons } from "@/lib/db/schema";
import { computeEloUpdate, isUpset } from "@/lib/hackathons/elo";
import { revalidateHackathonCaches } from "@/lib/hackathons/catalog";
import { faceoffVoteSchema } from "@/lib/validations/hackathon";

const VOTER_COOKIE = "faceoff_voter_id";
const VOTER_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
/* Same voter, same pair, within this window = treat as a duplicate submit
   (double click, page refresh) rather than a fresh judgment. */
const DUPLICATE_PAIR_WINDOW_MS = 60 * 60 * 1000;
/* Anything faster than this between two votes from the same voter reads as a
   script, not a human weighing two logos. */
const MIN_MS_BETWEEN_VOTES = 600;

/* Anonymous voting is allowed by design (lower friction, more votes), so
   identity here is "best effort": signed-in users are keyed by their user id,
   everyone else by a long-lived random cookie. Both land in the same
   voterFingerprint column so the throttle checks below don't need to branch. */
async function resolveVoterFingerprint(userId: string | null): Promise<{ fingerprint: string; setCookie?: string }> {
  if (userId) {
    return { fingerprint: `user:${userId}` };
  }

  const cookieStore = await cookies();
  const existing = cookieStore.get(VOTER_COOKIE)?.value;

  if (existing) {
    return { fingerprint: `anon:${existing}` };
  }

  const anonId = randomUUID();
  return { fingerprint: `anon:${anonId}`, setCookie: anonId };
}

export async function POST(request: Request) {
  const parsed = faceoffVoteSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { winnerId, loserId } = parsed.data;
  const userContext = await getCurrentUserContext();
  const { fingerprint, setCookie } = await resolveVoterFingerprint(userContext?.user.id ?? null);

  const [recentVotes, rows] = await Promise.all([
    db
      .select({ id: hackathonFaceoffVotes.id, createdAt: hackathonFaceoffVotes.createdAt })
      .from(hackathonFaceoffVotes)
      .where(
        and(
          eq(hackathonFaceoffVotes.voterFingerprint, fingerprint),
          gte(hackathonFaceoffVotes.createdAt, new Date(Date.now() - DUPLICATE_PAIR_WINDOW_MS)),
          or(
            and(eq(hackathonFaceoffVotes.winnerId, winnerId), eq(hackathonFaceoffVotes.loserId, loserId)),
            and(eq(hackathonFaceoffVotes.winnerId, loserId), eq(hackathonFaceoffVotes.loserId, winnerId))
          )
        )
      )
      .limit(1),
    db
      .select({
        id: hackathons.id,
        eloRating: hackathons.eloRating,
        faceoffWins: hackathons.faceoffWins,
        faceoffLosses: hackathons.faceoffLosses,
      })
      .from(hackathons)
      .where(inArray(hackathons.id, [winnerId, loserId])),
  ]);

  const mostRecentVote = recentVotes[0];

  if (mostRecentVote) {
    const msSinceLastVote = Date.now() - mostRecentVote.createdAt.getTime();

    if (msSinceLastVote < MIN_MS_BETWEEN_VOTES) {
      return NextResponse.json({ error: "Slow down a bit." }, { status: 429 });
    }

    return NextResponse.json({ error: "You already judged this matchup recently." }, { status: 409 });
  }

  const winner = rows.find((row) => row.id === winnerId);
  const loser = rows.find((row) => row.id === loserId);

  if (!winner || !loser) {
    return NextResponse.json({ error: "Hackathon not found." }, { status: 404 });
  }

  const { winnerRatingAfter, loserRatingAfter } = computeEloUpdate({
    winnerRating: winner.eloRating,
    winnerGamesPlayed: winner.faceoffWins + winner.faceoffLosses,
    loserRating: loser.eloRating,
    loserGamesPlayed: loser.faceoffWins + loser.faceoffLosses,
  });
  const upset = isUpset(winner.eloRating, loser.eloRating);

  // No cross-row transaction on the neon-http driver (same constraint the
  // thumbs-up/down vote route works around) — two independent updates plus a
  // log row is an accepted, low-stakes race for a for-fun ranking.
  await Promise.all([
    db
      .update(hackathons)
      .set({ eloRating: winnerRatingAfter, faceoffWins: winner.faceoffWins + 1, updatedAt: new Date() })
      .where(eq(hackathons.id, winnerId)),
    db
      .update(hackathons)
      .set({ eloRating: loserRatingAfter, faceoffLosses: loser.faceoffLosses + 1, updatedAt: new Date() })
      .where(eq(hackathons.id, loserId)),
    db.insert(hackathonFaceoffVotes).values({
      winnerId,
      loserId,
      voterUserId: userContext?.user.id ?? null,
      voterFingerprint: fingerprint,
      winnerEloBefore: winner.eloRating,
      winnerEloAfter: winnerRatingAfter,
      loserEloBefore: loser.eloRating,
      loserEloAfter: loserRatingAfter,
    }),
  ]);

  revalidateHackathonCaches();

  const response = NextResponse.json({
    data: {
      winner: { id: winnerId, eloBefore: winner.eloRating, eloAfter: winnerRatingAfter },
      loser: { id: loserId, eloBefore: loser.eloRating, eloAfter: loserRatingAfter },
      upset,
    },
  });

  if (setCookie) {
    response.cookies.set(VOTER_COOKIE, setCookie, {
      httpOnly: true,
      maxAge: VOTER_COOKIE_MAX_AGE_SECONDS,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}
