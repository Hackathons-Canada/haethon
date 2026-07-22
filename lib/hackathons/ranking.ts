/**
 * Client- and server-safe sorting/grouping helpers for the Elo-ranked catalog
 * views (Browse, Ranking, Tier List). Pure functions over already-fetched
 * catalog cards — no DB access.
 */

export type EloRankable = {
  id: string;
  eloRating: number;
  countryCode?: string | null;
};

export const TIER_LABELS = ["S", "A", "B", "C", "D"] as const;
export type TierLabel = (typeof TIER_LABELS)[number];

/* Percentile cutoffs (top to bottom) rather than fixed Elo bands: as votes
   push the whole population's ratings up or down over time, fixed bands would
   eventually empty out or overflow a single tier. Ranking by percentile of
   the *current* filtered set keeps all five tiers populated. */
const TIER_CUTOFFS: { tier: TierLabel; through: number }[] = [
  { tier: "S", through: 0.1 },
  { tier: "A", through: 0.3 },
  { tier: "B", through: 0.65 },
  { tier: "C", through: 0.9 },
  { tier: "D", through: 1 },
];

export function sortByEloDescending<T extends EloRankable>(cards: readonly T[]): T[] {
  return [...cards].sort((a, b) => b.eloRating - a.eloRating || a.id.localeCompare(b.id));
}

/**
 * Elo-descending, but with the visitor's home country's hackathons pulled to
 * the very top first. Used by the Browse and Ranking views; the Tier List
 * view deliberately skips this (tiers are Elo-only).
 */
export function sortByEloWithLocalBoost<T extends EloRankable>(
  cards: readonly T[],
  localCountryCode: string | null | undefined
): T[] {
  const sorted = sortByEloDescending(cards);

  if (!localCountryCode) {
    return sorted;
  }

  const normalized = localCountryCode.toUpperCase();
  const local: T[] = [];
  const rest: T[] = [];

  for (const card of sorted) {
    (card.countryCode?.toUpperCase() === normalized ? local : rest).push(card);
  }

  return [...local, ...rest];
}

export type TierGroup<T> = {
  tier: TierLabel;
  hackathons: T[];
};

export function assignTiers<T extends EloRankable>(cards: readonly T[]): TierGroup<T>[] {
  const sorted = sortByEloDescending(cards);
  const total = sorted.length;
  const groups: TierGroup<T>[] = TIER_LABELS.map((tier) => ({ tier, hackathons: [] }));

  sorted.forEach((card, index) => {
    const rank = (index + 1) / total;
    const cutoff = TIER_CUTOFFS.find((entry) => rank <= entry.through) ?? TIER_CUTOFFS[TIER_CUTOFFS.length - 1];
    const group = groups.find((entry) => entry.tier === cutoff.tier);
    group?.hackathons.push(card);
  });

  return groups;
}
