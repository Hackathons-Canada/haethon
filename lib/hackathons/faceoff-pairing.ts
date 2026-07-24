/**
 * Client-side matchup picker for the Face Off arena. The arena already holds
 * the full (cached) catalog snapshot, so picking "what's next" happens
 * entirely in the browser — no round trip needed between votes.
 */

export type FaceoffCandidate = {
  id: string;
  eloRating: number;
  faceoffWins?: number;
  faceoffLosses?: number;
  faceoffImpressions?: number;
};

const EXPLORATION_PROBABILITY = 0.15;
/* Ring buffer size for "don't show this hackathon again immediately." */
export const RECENT_HISTORY_SIZE = 8;

export function pickMatchup<T extends FaceoffCandidate>(
  pool: readonly T[],
  recentIds: readonly string[],
  random: () => number = Math.random
): [T, T] | null {
  if (pool.length < 2) {
    return null;
  }

  const recent = new Set(recentIds);
  const freshPool = pool.filter((candidate) => !recent.has(candidate.id));
  const firstPickPool = freshPool.length >= 2 ? freshPool : pool;

  const first = weightedChoice(firstPickPool, exposureWeight, random);
  const second = pickOpponent(pool, first, recentIds, random);

  return second ? [first, second] : null;
}

/**
 * Streak mode keeps the reigning hackathon anchored on one side, so only its
 * challenger gets picked. Returns null when the anchor is not in the pool
 * (unpublished mid-streak, for example) so callers can fall back to a fresh pair.
 */
export function pickChallenger<T extends FaceoffCandidate>(
  pool: readonly T[],
  anchorId: string,
  recentIds: readonly string[],
  random: () => number = Math.random
): [T, T] | null {
  const anchor = pool.find((candidate) => candidate.id === anchorId);

  if (!anchor) {
    return null;
  }

  const opponent = pickOpponent(pool, anchor, recentIds, random);

  return opponent ? [anchor, opponent] : null;
}

function pickOpponent<T extends FaceoffCandidate>(
  pool: readonly T[],
  first: T,
  recentIds: readonly string[],
  random: () => number
): T | null {
  const recent = new Set(recentIds);
  const secondPickPool = pool.filter((candidate) => candidate.id !== first.id && !recent.has(candidate.id));
  const anyOpponent = pool.filter((candidate) => candidate.id !== first.id);
  const opponents = secondPickPool.length ? secondPickPool : anyOpponent;

  if (!opponents.length) {
    return null;
  }

  const explore = random() < EXPLORATION_PROBABILITY;

  return weightedChoice(
    opponents,
    (candidate) => {
      if (explore) {
        return exposureWeight(candidate);
      }

      // The closer the ratings, the more information the result carries.
      const informationWeight = 1 / (1 + Math.abs(candidate.eloRating - first.eloRating) / 100);
      return exposureWeight(candidate) * informationWeight;
    },
    random
  );
}

function gamesPlayed(candidate: FaceoffCandidate): number {
  return (candidate.faceoffWins ?? 0) + (candidate.faceoffLosses ?? 0);
}

function exposureWeight(candidate: FaceoffCandidate): number {
  return 1 / Math.sqrt((1 + gamesPlayed(candidate)) * (1 + (candidate.faceoffImpressions ?? 0)));
}

function weightedChoice<T>(items: readonly T[], weight: (item: T) => number, random: () => number): T {
  const weights = items.map((item) => Math.max(0, weight(item)));
  const total = weights.reduce((sum, value) => sum + value, 0);

  if (total <= 0) {
    return items[Math.floor(random() * items.length)];
  }

  let cursor = random() * total;

  for (let index = 0; index < items.length; index += 1) {
    cursor -= weights[index];

    if (cursor <= 0) {
      return items[index];
    }
  }

  return items[items.length - 1];
}

export function pushRecentIds(recentIds: readonly string[], ...ids: string[]): string[] {
  return [...ids, ...recentIds].slice(0, RECENT_HISTORY_SIZE);
}
