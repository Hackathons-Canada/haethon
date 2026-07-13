/**
 * Tags historical admin-imported hackathon submissions with `payload.origin =
 * "admin_import"` so the submissions review page (/admin/submissions) can keep
 * them out — imports are handled entirely on /admin/import.
 *
 * New imports are tagged at write time in importAdminHackathons(). This backfill
 * covers rows created before that marker existed. A successful import row is
 * identified by: status "approved", submitter_type "community", the reviewer
 * being the submitter (imports self-approve with reviewerUserId on both fields),
 * and a *full* payload — community-form submissions keep a minimal
 * {name, websiteUrl, sourceUrl} payload even after approval, so payload fullness
 * cleanly separates the two.
 *
 * Usage: npx tsx scripts/backfill-import-submission-origin.ts [--dry-run]
 */
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Add it to .env.local first.");
  process.exit(1);
}

function isImportPayload(payload: Record<string, unknown>) {
  // Already tagged, or a broken-import fix record handled on /admin/broken.
  if (payload.origin === "admin_import" || payload.importReason || payload.needsFix) {
    return false;
  }

  // Full import payloads carry event details a community-form submission never does.
  return Boolean(payload.startDate || payload.endDate || payload.format || payload.country || payload.city);
}

async function main() {
  // The db client validates env at import time, so import after dotenv runs.
  const { eq } = await import("drizzle-orm");
  const { db } = await import("../lib/db");
  const { hackathonSubmissions } = await import("../lib/db/schema");
  const dryRun = process.argv.includes("--dry-run");

  const rows = await db
    .select({
      id: hackathonSubmissions.id,
      payload: hackathonSubmissions.payload,
      status: hackathonSubmissions.status,
      submitterType: hackathonSubmissions.submitterType,
      submittedByUserId: hackathonSubmissions.submittedByUserId,
      reviewedByUserId: hackathonSubmissions.reviewedByUserId,
    })
    .from(hackathonSubmissions);

  const changes = rows.filter(
    (row) =>
      row.status === "approved" &&
      row.submitterType === "community" &&
      row.reviewedByUserId != null &&
      row.reviewedByUserId === row.submittedByUserId &&
      isImportPayload(row.payload ?? {})
  );

  console.log(`Scanned ${rows.length} submission rows; ${changes.length} look like admin imports.`);

  if (dryRun) {
    console.log("Dry run — no rows written.");
    return;
  }

  for (const row of changes) {
    await db
      .update(hackathonSubmissions)
      .set({ payload: { ...(row.payload ?? {}), origin: "admin_import" } })
      .where(eq(hackathonSubmissions.id, row.id));
  }

  console.log(`Tagged ${changes.length} submission rows with origin "admin_import".`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
