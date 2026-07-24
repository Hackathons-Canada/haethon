/**
 * Ensures every hackathon has a neutral Face Off prior. Ratings with matchup
 * history are never rewritten; only missing or completely unplayed records
 * are initialized to 1500.
 *
 * Usage: pnpm backfill:hackathon-elo [--dry-run]
 */
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

const BASE_ELO = 1500;

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing. Add it to .env.local first.");
    process.exit(1);
  }

  const dryRun = process.argv.includes("--dry-run");
  const { eq, sql } = await import("drizzle-orm");
  const { db } = await import("../lib/db");
  const { hackathonFaceoffRatings, hackathons } = await import("../lib/db/schema");
  const rows = await db
    .select({
      id: hackathons.id,
      name: hackathons.name,
      eloRating: hackathonFaceoffRatings.eloRating,
      faceoffWins: hackathonFaceoffRatings.faceoffWins,
      faceoffLosses: hackathonFaceoffRatings.faceoffLosses,
    })
    .from(hackathons)
    .leftJoin(hackathonFaceoffRatings, eq(hackathonFaceoffRatings.hackathonId, hackathons.id));
  const eligible = rows.filter(
    (row) => row.eloRating === null || (row.faceoffWins === 0 && row.faceoffLosses === 0 && row.eloRating !== BASE_ELO)
  );

  console.log(`${eligible.length}/${rows.length} hackathon rating(s) need a neutral prior.`);
  eligible.forEach((row) => console.log(`  ${BASE_ELO}  ${row.name}`));

  if (dryRun) {
    console.log("Dry run: no rows were updated.");
    return;
  }

  for (const row of eligible) {
    await db
      .insert(hackathonFaceoffRatings)
      .values({ hackathonId: row.id, eloRating: BASE_ELO })
      .onConflictDoUpdate({
        target: hackathonFaceoffRatings.hackathonId,
        set: {
          eloRating: sql`case
            when ${hackathonFaceoffRatings.faceoffWins} + ${hackathonFaceoffRatings.faceoffLosses} = 0
            then ${BASE_ELO}
            else ${hackathonFaceoffRatings.eloRating}
          end`,
          updatedAt: new Date(),
        },
      });
  }

  console.log(`Backfill complete: ${eligible.length} rating(s) initialized.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
