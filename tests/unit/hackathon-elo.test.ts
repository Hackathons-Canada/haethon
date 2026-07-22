import { describe, expect, it } from "vitest";

import { computeEloUpdate, isUpset, kFactor } from "@/lib/hackathons/elo";

describe("kFactor", () => {
  it("tapers down as a hackathon plays more matchups", () => {
    expect(kFactor(0)).toBe(40);
    expect(kFactor(9)).toBe(40);
    expect(kFactor(10)).toBe(24);
    expect(kFactor(29)).toBe(24);
    expect(kFactor(30)).toBe(16);
    expect(kFactor(500)).toBe(16);
  });
});

describe("computeEloUpdate", () => {
  it("gives the winner a bigger gain when they were the underdog", () => {
    const underdogWins = computeEloUpdate({
      winnerRating: 1400,
      winnerGamesPlayed: 5,
      loserRating: 1600,
      loserGamesPlayed: 5,
    });
    const favoriteWins = computeEloUpdate({
      winnerRating: 1600,
      winnerGamesPlayed: 5,
      loserRating: 1400,
      loserGamesPlayed: 5,
    });

    expect(underdogWins.winnerRatingAfter - 1400).toBeGreaterThan(favoriteWins.winnerRatingAfter - 1600);
  });

  it("moves both ratings toward each other for an even matchup", () => {
    const result = computeEloUpdate({
      winnerRating: 1500,
      winnerGamesPlayed: 5,
      loserRating: 1500,
      loserGamesPlayed: 5,
    });

    expect(result.winnerRatingAfter).toBeGreaterThan(1500);
    expect(result.loserRatingAfter).toBeLessThan(1500);
    // Equal ratings + equal K-factor: the swing is symmetric.
    expect(result.winnerRatingAfter - 1500).toBe(1500 - result.loserRatingAfter);
  });

  it("moves established hackathons less than provisional ones for the same result", () => {
    const provisional = computeEloUpdate({
      winnerRating: 1500,
      winnerGamesPlayed: 0,
      loserRating: 1500,
      loserGamesPlayed: 0,
    });
    const established = computeEloUpdate({
      winnerRating: 1500,
      winnerGamesPlayed: 50,
      loserRating: 1500,
      loserGamesPlayed: 50,
    });

    expect(established.winnerRatingAfter - 1500).toBeLessThan(provisional.winnerRatingAfter - 1500);
  });
});

describe("isUpset", () => {
  it("flags a win only when the winner was rated well below the loser", () => {
    expect(isUpset(1400, 1600)).toBe(true);
    expect(isUpset(1450, 1600)).toBe(true); // exactly at the 150-point gap threshold
    expect(isUpset(1451, 1600)).toBe(false); // one point inside the threshold
    expect(isUpset(1500, 1600)).toBe(false);
    expect(isUpset(1600, 1500)).toBe(false);
  });
});
