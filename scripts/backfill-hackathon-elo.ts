/**
 * Seeds the Face Off Elo rating for every hackathon that hasn't been voted on
 * yet (faceoff_wins = 0 and faceoff_losses = 0 — once a hackathon has real
 * matchup history this script leaves it alone, run or not).
 *
 * Two-tier scoring:
 *  1. KNOWN_FLAGSHIP_HACKATHONS — a hand-curated list of hackathons recognized
 *     as genuinely prestigious (major student hackathons, well-known branded
 *     events), matched by name.
 *  2. Everyone else falls back to a formula blending prize money (log-scaled,
 *     since a $500k prize pool shouldn't linearly dwarf a $5k one),
 *     dataConfidenceScore, and the existing thumbs-up/down voteScore — all
 *     signals already on the row, no manual judgment required.
 * A small flat bonus is added on top of either tier when the name mentions a
 * recognizable tech-industry sponsor (Anthropic, Snowflake, etc.) — sponsor
 * backing is a real, checkable signal distinct from "this specific event is
 * famous."
 *
 * Usage: npx tsx scripts/backfill-hackathon-elo.ts [--dry-run]
 */
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

const BASE_ELO = 1500;

const KNOWN_FLAGSHIP_HACKATHONS: { pattern: RegExp; elo: number; reason: string }[] = [
  {
    pattern: /hack the north/i,
    elo: 1950,
    reason: "University of Waterloo — the largest, most prestigious student hackathon in Canada and an MLH flagship.",
  },
  {
    pattern: /spartahack/i,
    elo: 1700,
    reason: "Michigan State's long-running MLH-circuit hackathon, now on its 12th edition.",
  },
  {
    pattern: /\bcutc\b/i,
    elo: 1620,
    reason: "Canadian Undergraduate Technology Conference — a well-regarded national student tech event.",
  },
  { pattern: /hack the 6ix/i, elo: 1610, reason: "Established Toronto student hackathon on the MLH circuit." },
  { pattern: /hack the hill/i, elo: 1570, reason: "University of Ottawa's growing MLH-circuit hackathon." },
  { pattern: /hack atlantic/i, elo: 1540, reason: "Established Atlantic Canada regional hackathon." },
  { pattern: /xprize/i, elo: 1650, reason: "XPRIZE-branded innovation challenge." },
];

/* A flat nudge, not a tier override — one recognizable sponsor logo in an
   event name is real signal, but not enough on its own to claim the event is
   "prestigious." */
const NOTABLE_SPONSOR_KEYWORDS = [
  "anthropic",
  "auth0",
  "snowflake",
  "ramp",
  "box",
  "braintrust",
  "replit",
  "gemini",
  "cursor",
  "revenuecat",
  "temporal",
];
const SPONSOR_BONUS = 40;

type HackathonRow = {
  id: string;
  name: string;
  prizeAmountUsd: number | null;
  dataConfidenceScore: string | null;
  voteScore: number;
};

function formulaElo(row: HackathonRow): number {
  let score = BASE_ELO;

  if (row.prizeAmountUsd && row.prizeAmountUsd > 0) {
    score += Math.min(250, Math.round(40 * Math.log10(1 + row.prizeAmountUsd)));
  }

  const confidence = Number(row.dataConfidenceScore ?? 0.5);
  score += Math.round((confidence - 0.5) * 60);
  score += Math.max(-40, Math.min(40, row.voteScore * 5));

  return Math.round(score);
}

function seedEloFor(row: HackathonRow): { elo: number; reason: string } {
  const override = KNOWN_FLAGSHIP_HACKATHONS.find(({ pattern }) => pattern.test(row.name));
  const base = override ? { elo: override.elo, reason: override.reason } : { elo: formulaElo(row), reason: "formula" };

  const hasSponsorMention = NOTABLE_SPONSOR_KEYWORDS.some((keyword) => row.name.toLowerCase().includes(keyword));

  if (!hasSponsorMention) {
    return base;
  }

  return { elo: base.elo + SPONSOR_BONUS, reason: `${base.reason} + notable sponsor mention` };
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing. Add it to .env.local first.");
    process.exit(1);
  }

  const dryRun = process.argv.includes("--dry-run");

  // The db client validates env at import time, so import after dotenv runs.
  const { and, eq } = await import("drizzle-orm");
  const { db } = await import("../lib/db");
  const { hackathons } = await import("../lib/db/schema");

  const rows = await db
    .select({
      id: hackathons.id,
      name: hackathons.name,
      prizeAmountUsd: hackathons.prizeAmountUsd,
      dataConfidenceScore: hackathons.dataConfidenceScore,
      voteScore: hackathons.voteScore,
      faceoffWins: hackathons.faceoffWins,
      faceoffLosses: hackathons.faceoffLosses,
    })
    .from(hackathons);

  const eligible = rows.filter((row) => row.faceoffWins === 0 && row.faceoffLosses === 0);

  console.log(
    `${eligible.length}/${rows.length} hackathon(s) have no Face Off matchup history yet and are eligible for seeding.`
  );

  const plan = eligible.map((row) => ({ ...seedEloFor(row), id: row.id, name: row.name }));

  for (const entry of plan) {
    console.log(`  ${entry.elo}  ${entry.name}  (${entry.reason})`);
  }

  if (dryRun) {
    console.log("Dry run: no rows were updated.");
    return;
  }

  for (const entry of plan) {
    await db
      .update(hackathons)
      .set({ eloRating: entry.elo, updatedAt: new Date() })
      .where(and(eq(hackathons.id, entry.id), eq(hackathons.faceoffWins, 0), eq(hackathons.faceoffLosses, 0)));
  }

  console.log(`Backfill complete: ${plan.length} hackathon(s) seeded.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
