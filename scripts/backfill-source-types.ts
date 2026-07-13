/**
 * Backfills hackathon source provenance: every existing `sources` row was
 * written with a hardcoded `source_type = "manual"`, so every card badges as
 * "Community". This re-derives the type from the stored `source_url` so only
 * approved community-form submissions stay `manual`; recognized platforms and
 * other websites receive their actual provenance instead.
 *
 * Usage: npx tsx scripts/backfill-source-types.ts [--dry-run]
 */
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Add it to .env.local first.");
  process.exit(1);
}

async function main() {
  // The db client validates env at import time, so import after dotenv runs.
  const { eq } = await import("drizzle-orm");
  const { db } = await import("../lib/db");
  const { sources } = await import("../lib/db/schema");
  const { deriveSourceType } = await import("../lib/hackathons/source-badges");
  const dryRun = process.argv.includes("--dry-run");

  const rows = await db
    .select({ id: sources.id, sourceType: sources.sourceType, sourceUrl: sources.sourceUrl })
    .from(sources);

  const changes = rows
    .map((row) => ({ row, next: deriveSourceType(row.sourceUrl) }))
    .filter(({ row, next }) => next !== row.sourceType);

  const tally = new Map<string, number>();
  for (const { next } of changes) {
    tally.set(next, (tally.get(next) ?? 0) + 1);
  }

  console.log(`Scanned ${rows.length} source rows; ${changes.length} would change.`);
  for (const [type, count] of tally) {
    console.log(`  → ${type}: ${count}`);
  }

  if (dryRun) {
    console.log("Dry run — no rows written.");
    return;
  }

  for (const { row, next } of changes) {
    await db.update(sources).set({ sourceType: next }).where(eq(sources.id, row.id));
  }

  console.log(`Updated ${changes.length} source rows.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
