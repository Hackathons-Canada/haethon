import { inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import { sources } from "@/lib/db/schema";
import { deriveSourceType, pickPrimarySourceBadge } from "@/lib/hackathons/source-provenance";
import type { HackathonSource, HackathonSourceBadge } from "@/lib/hackathons/source-provenance";

export { COMMUNITY_FORM_SOURCE_URL, deriveSourceType, pickPrimarySourceBadge } from "@/lib/hackathons/source-provenance";
export type { HackathonSource, HackathonSourceBadge } from "@/lib/hackathons/source-provenance";

/**
 * Given a set of hackathon ids, returns the single most authoritative
 * source per hackathon — the source type occurring most often, then the
 * priority above as a tie-breaker. The returned label is the recognized site
 * name, or the source hostname for an otherwise unknown site. Hackathons with
 * no source row are simply absent from the map, so the card renders no badge.
 */
export async function getPrimarySourceByHackathon(
  hackathonIds: string[]
): Promise<Map<string, HackathonSourceBadge>> {
  if (!hackathonIds.length) {
    return new Map();
  }

  const rows = await db
    .select({
      hackathonId: sources.hackathonId,
      sourceUrl: sources.sourceUrl,
    })
    .from(sources)
    .where(inArray(sources.hackathonId, hackathonIds));

  const sourceRows = new Map<string, Array<{ sourceType: HackathonSource; sourceUrl: string }>>();

  for (const row of rows) {
    if (!row.hackathonId) {
      continue;
    }

    const entries = sourceRows.get(row.hackathonId) ?? [];
    // Render provenance from the URL itself, rather than trusting a historical
    // source_type value that may have been imported before classification existed.
    entries.push({ sourceType: deriveSourceType(row.sourceUrl), sourceUrl: row.sourceUrl });
    sourceRows.set(row.hackathonId, entries);
  }

  const badges = new Map<string, HackathonSourceBadge>();

  for (const [hackathonId, entries] of sourceRows) {
    const badge = pickPrimarySourceBadge(entries);

    if (badge) {
      badges.set(hackathonId, badge);
    }
  }

  return badges;
}
