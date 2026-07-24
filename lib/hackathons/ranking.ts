/**
 * Client- and server-safe sorting/grouping helpers for the Elo-ranked catalog
 * views (Browse, Ranking, Tier List). Pure functions over already-fetched
 * catalog cards — no DB access.
 */

export type EloRankable = {
  id: string;
  eloRating: number;
  countryCode?: string | null;
  faceoffWins?: number;
  faceoffLosses?: number;
};

export const TIER_LABELS = ["S", "A", "B", "C", "D"] as const;
export type TierLabel = (typeof TIER_LABELS)[number];

/* Percentile cutoffs (top to bottom) rather than fixed Elo bands: as votes
   push the whole population's ratings up or down over time, fixed bands would
   eventually empty out or overflow a single tier. Ranking by percentile of
   the *current* filtered set keeps all five tiers populated. */
const ESTABLISHED_TIER_CUTOFFS: { tier: Exclude<TierLabel, "D">; through: number }[] = [
  { tier: "S", through: 0.1 },
  { tier: "A", through: 0.35 },
  { tier: "B", through: 0.7 },
  { tier: "C", through: 1 },
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
  const established = sortByEloDescending(
    cards.filter((card) => {
      if (card.faceoffWins === undefined || card.faceoffLosses === undefined) {
        return true;
      }

      return card.faceoffWins + card.faceoffLosses >= 10;
    })
  );
  const provisional = sortByEloDescending(
    cards.filter(
      (card) =>
        card.faceoffWins !== undefined &&
        card.faceoffLosses !== undefined &&
        card.faceoffWins + card.faceoffLosses < 10
    )
  );
  const total = established.length;
  const groups: TierGroup<T>[] = TIER_LABELS.map((tier) => ({ tier, hackathons: [] }));

  established.forEach((card, index) => {
    const rank = total === 1 ? 0 : index / (total - 1);
    const cutoff =
      ESTABLISHED_TIER_CUTOFFS.find((entry) => rank <= entry.through) ??
      ESTABLISHED_TIER_CUTOFFS[ESTABLISHED_TIER_CUTOFFS.length - 1];
    const group = groups.find((entry) => entry.tier === cutoff.tier);
    group?.hackathons.push(card);
  });

  groups.find((entry) => entry.tier === "D")?.hackathons.push(...provisional);

  return groups;
}
