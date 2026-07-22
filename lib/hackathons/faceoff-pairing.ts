/**
 * Client-side matchup picker for the Face Off arena. The arena already holds
 * the full (cached) catalog snapshot, so picking "what's next" happens
 * entirely in the browser — no round trip needed between votes.
 */

export type FaceoffCandidate = {
  id: string;
  eloRating: number;
};

/* How often the second pick comes from a similar-Elo band vs. anywhere in the
   pool. Mostly-close matchups feel more like a real contest; the occasional
   wildcard keeps long shots and hidden gems in rotation. */
const SIMILAR_ELO_BAND = 150;
const SIMILAR_ELO_PROBABILITY = 0.65;
/* Ring buffer size for "don't show this hackathon again immediately." */
export const RECENT_HISTORY_SIZE = 8;

export function pickMatchup<T extends FaceoffCandidate>(
  pool: readonly T[],
  recentIds: readonly string[]
): [T, T] | null {
  if (pool.length < 2) {
    return null;
  }

  const recent = new Set(recentIds);
  const freshPool = pool.filter((candidate) => !recent.has(candidate.id));
  const firstPickPool = freshPool.length >= 2 ? freshPool : pool;

  const first = firstPickPool[Math.floor(Math.random() * firstPickPool.length)];

  const similarOpponents = pool.filter(
    (candidate) => candidate.id !== first.id && Math.abs(candidate.eloRating - first.eloRating) <= SIMILAR_ELO_BAND
  );
  const anyOpponent = pool.filter((candidate) => candidate.id !== first.id);
  const useSimilarBand = similarOpponents.length > 0 && Math.random() < SIMILAR_ELO_PROBABILITY;
  const secondPickPool = useSimilarBand ? similarOpponents : anyOpponent;

  if (!secondPickPool.length) {
    return null;
  }

  const second = secondPickPool[Math.floor(Math.random() * secondPickPool.length)];

  return [first, second];
}

export function pushRecentIds(recentIds: readonly string[], ...ids: string[]): string[] {
  return [...ids, ...recentIds].slice(0, RECENT_HISTORY_SIZE);
}
