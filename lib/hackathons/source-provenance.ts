/* Pure source-provenance helpers. This module is safe to use from client
   components; database access stays in source-badges.ts. */
export type HackathonSource = "devpost" | "mlh" | "luma" | "cerebral_valley" | "organizer_site" | "manual" | "other";

export type HackathonSourceBadge = {
  label: string;
  type: HackathonSource;
};

// A source row is only labelled Community when it originated in the public
// submission form and a reviewer approved it. Imported URLs never use this.
export const COMMUNITY_FORM_SOURCE_URL = "https://haethon.local/submissions/community-form";

const SOURCE_PRIORITY: Record<HackathonSource, number> = {
  mlh: 7,
  luma: 6,
  cerebral_valley: 5,
  devpost: 4,
  organizer_site: 3,
  other: 2,
  manual: 1,
};

const SOURCE_HOST_HINTS: Array<{ hint: string; source: HackathonSource }> = [
  { hint: "mlh.com", source: "mlh" },
  { hint: "mlh.io", source: "mlh" },
  { hint: "majorleaguehacking.com", source: "mlh" },
  { hint: "lu.ma", source: "luma" },
  { hint: "luma.com", source: "luma" },
  { hint: "cerebralvalley.ai", source: "cerebral_valley" },
  { hint: "devpost.com", source: "devpost" },
];

const SOURCE_LABELS: Record<Exclude<HackathonSource, "other">, string> = {
  mlh: "MLH",
  luma: "Luma",
  cerebral_valley: "Cerebral Valley",
  devpost: "Devpost",
  organizer_site: "Organizer",
  manual: "Community",
};

function sourceHost(url: string) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

function sourceLabel(type: HackathonSource, url: string) {
  return type === "other" ? (sourceHost(url) ?? "Website") : SOURCE_LABELS[type];
}

export function pickPrimarySourceBadge(rows: Array<{ sourceType: HackathonSource; sourceUrl: string }>): HackathonSourceBadge | null {
  if (!rows.length) {
    return null;
  }

  const byType = new Map<HackathonSource, { count: number; urls: Map<string, number> }>();

  for (const row of rows) {
    const current = byType.get(row.sourceType) ?? { count: 0, urls: new Map<string, number>() };
    current.count += 1;
    current.urls.set(row.sourceUrl, (current.urls.get(row.sourceUrl) ?? 0) + 1);
    byType.set(row.sourceType, current);
  }

  const [sourceType, value] = Array.from(byType).sort(([leftType, left], [rightType, right]) =>
    right.count !== left.count ? right.count - left.count : SOURCE_PRIORITY[rightType] - SOURCE_PRIORITY[leftType]
  )[0];
  const sourceUrl = Array.from(value.urls).sort(([leftUrl, leftCount], [rightUrl, rightCount]) =>
    rightCount !== leftCount ? rightCount - leftCount : leftUrl.localeCompare(rightUrl)
  )[0][0];

  return { type: sourceType, label: sourceLabel(sourceType, sourceUrl) };
}

/**
 * MLH, Luma, Cerebral Valley, and Devpost are recognized by host. Only the
 * community-form URL resolves to `manual`; other sites retain their hostname.
 */
export function deriveSourceType(...urls: Array<string | null | undefined>): HackathonSource {
  for (const url of urls) {
    if (!url) {
      continue;
    }

    if (url === COMMUNITY_FORM_SOURCE_URL) {
      return "manual";
    }

    const host = sourceHost(url);
    if (!host) {
      continue;
    }

    const match = SOURCE_HOST_HINTS.find(({ hint }) => host === hint || host.endsWith(`.${hint}`));
    if (match) {
      return match.source;
    }
  }

  return "other";
}
