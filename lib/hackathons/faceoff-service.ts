import { and, eq, inArray, isNotNull, lt, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { hackathonFaceoffMatchups, hackathonFaceoffRatings, hackathons } from "@/lib/db/schema";
import { displayEloRating } from "@/lib/hackathons/elo";

const MATCHUP_RETENTION_DAYS = 90;
const publicStatuses = ["upcoming", "live", "completed"] as const;

export async function getLiveFaceoffRatings() {
  const rows = await db
    .select({
      id: hackathons.id,
      rawEloRating: hackathonFaceoffRatings.eloRating,
      faceoffWins: hackathonFaceoffRatings.faceoffWins,
      faceoffLosses: hackathonFaceoffRatings.faceoffLosses,
    })
    .from(hackathonFaceoffRatings)
    .innerJoin(
      hackathons,
      and(
        eq(hackathonFaceoffRatings.hackathonId, hackathons.id),
        isNotNull(hackathons.publishedAt),
        inArray(hackathons.status, publicStatuses)
      )
    );

  return rows.map((row) => ({
    id: row.id,
    eloRating: displayEloRating(row.rawEloRating, row.faceoffWins + row.faceoffLosses),
    faceoffWins: row.faceoffWins,
    faceoffLosses: row.faceoffLosses,
  }));
}

export async function getFaceoffImpressionCounts() {
  const result = await db.execute<{ id: string; impressions: number }>(sql`
    select hackathon_id as id, count(*)::integer as impressions
    from (
      select left_id as hackathon_id from hackathon_faceoff_matchups
      union all
      select right_id from hackathon_faceoff_matchups
    ) shown
    group by hackathon_id
  `);

  return result.rows;
}

export async function cleanupOldFaceoffMatchups(now = new Date()) {
  const retentionBoundary = new Date(now.getTime() - MATCHUP_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const deleted = await db
    .delete(hackathonFaceoffMatchups)
    .where(lt(hackathonFaceoffMatchups.expiresAt, retentionBoundary))
    .returning({ id: hackathonFaceoffMatchups.id });

  return deleted.length;
}
