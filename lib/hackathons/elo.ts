/**
 * Standard Elo rating math for the Face Off head-to-head matchups. Pure
 * functions only — no DB access — so the API route stays thin and this stays
 * unit-testable in isolation.
 */

export type EloMatchInput = {
  winnerRating: number;
  winnerGamesPlayed: number;
  loserRating: number;
  loserGamesPlayed: number;
};

export type EloMatchResult = {
  winnerRatingAfter: number;
  loserRatingAfter: number;
};

/* A newer hackathon's rating should move fast on its first few matchups and
   settle down once it has enough votes to mean something — the same
   provisional/established split chess Elo systems use. */
export function kFactor(gamesPlayed: number): number {
  if (gamesPlayed < 10) {
    return 40;
  }

  if (gamesPlayed < 30) {
    return 24;
  }

  return 16;
}

function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + 10 ** ((ratingB - ratingA) / 400));
}

export function computeEloUpdate({
  winnerRating,
  winnerGamesPlayed,
  loserRating,
  loserGamesPlayed,
}: EloMatchInput): EloMatchResult {
  const winnerExpected = expectedScore(winnerRating, loserRating);
  const loserExpected = expectedScore(loserRating, winnerRating);

  return {
    winnerRatingAfter: Math.round(winnerRating + kFactor(winnerGamesPlayed) * (1 - winnerExpected)),
    loserRatingAfter: Math.round(loserRating + kFactor(loserGamesPlayed) * (0 - loserExpected)),
  };
}

/* Powers the "UPSET!" callout in the Face Off UI — a lower-rated hackathon
   beating a much higher-rated one by more than this gap feels like a real
   upset rather than statistical noise. */
export const UPSET_ELO_GAP = 150;

export function isUpset(winnerRatingBefore: number, loserRatingBefore: number): boolean {
  return loserRatingBefore - winnerRatingBefore >= UPSET_ELO_GAP;
}
