import { inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import { sources } from "@/lib/db/schema";

/* The provenance value shown as a small badge on each hackathon card. Mirrors
   the source_type enum in the schema so a query row drops straight in. */
export type HackathonSource = "devpost" | "mlh" | "organizer_site" | "manual" | "other";

/* A hackathon can carry several source rows (it was seen on more than one
   platform). When picking the one to badge, reliability wins first; ties fall
   back to this authority order so the more recognizable provenance shows. */
const SOURCE_PRIORITY: Record<HackathonSource, number> = {
  mlh: 5,
  devpost: 4,
  organizer_site: 3,
  manual: 2,
  other: 1,
};

/* Host substrings that identify a known provenance. Checked against the source
   URL (and website URL as a fallback) when we ingest a hackathon, so the badge
   reflects where the data actually came from instead of a blanket "manual". */
const SOURCE_HOST_HINTS: Array<{ hint: string; source: HackathonSource }> = [
  { hint: "devpost.com", source: "devpost" },
  { hint: "mlh.io", source: "mlh" },
  { hint: "majorleaguehacking.com", source: "mlh" },
];

/**
 * Infers a source_type from the URLs a hackathon was ingested with. Devpost and
 * MLH events are recognized by host; anything else falls back to `manual`,
 * which is the community/admin-submission default. Pass every URL you have —
 * the first recognized host wins.
 */
export function deriveSourceType(...urls: Array<string | null | undefined>): HackathonSource {
  for (const url of urls) {
    if (!url) {
      continue;
    }

    let host: string;
    try {
      host = new URL(url).hostname.toLowerCase();
    } catch {
      continue;
    }

    const match = SOURCE_HOST_HINTS.find(({ hint }) => host === hint || host.endsWith(`.${hint}`));
    if (match) {
      return match.source;
    }
  }

  return "manual";
}

/**
 * Given a set of hackathon ids, returns the single most authoritative
 * source_type per hackathon — highest reliability score, then the priority
 * above as a tie-breaker. Hackathons with no source row are simply absent from
 * the map, so the card renders no badge for them.
 */
export async function getPrimarySourceByHackathon(
  hackathonIds: string[]
): Promise<Map<string, HackathonSource>> {
  if (!hackathonIds.length) {
    return new Map();
  }

  const rows = await db
    .select({
      hackathonId: sources.hackathonId,
      sourceType: sources.sourceType,
      reliabilityScore: sources.reliabilityScore,
    })
    .from(sources)
    .where(inArray(sources.hackathonId, hackathonIds));

  const best = new Map<string, { sourceType: HackathonSource; score: number }>();

  for (const row of rows) {
    if (!row.hackathonId) {
      continue;
    }

    const score = Number(row.reliabilityScore ?? 0);
    const current = best.get(row.hackathonId);
    const wins =
      !current ||
      score > current.score ||
      (score === current.score && SOURCE_PRIORITY[row.sourceType] > SOURCE_PRIORITY[current.sourceType]);

    if (wins) {
      best.set(row.hackathonId, { sourceType: row.sourceType, score });
    }
  }

  return new Map(Array.from(best, ([id, value]) => [id, value.sourceType]));
}
