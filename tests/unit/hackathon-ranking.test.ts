import { describe, expect, it } from "vitest";

import { assignTiers, sortByEloDescending, sortByEloWithLocalBoost } from "@/lib/hackathons/ranking";

function card(id: string, eloRating: number, countryCode: string | null = null) {
  return { id, eloRating, countryCode };
}

describe("sortByEloDescending", () => {
  it("orders highest rating first, breaking ties by id", () => {
    const result = sortByEloDescending([card("b", 1500), card("a", 1600), card("c", 1500)]);

    expect(result.map((entry) => entry.id)).toEqual(["a", "b", "c"]);
  });
});

describe("sortByEloWithLocalBoost", () => {
  it("pulls the visitor's country to the top, Elo-sorted within each group", () => {
    const cards = [card("us-low", 1400, "US"), card("ca-high", 1900, "CA"), card("ca-low", 1300, "CA"), card("us-high", 2000, "US")];

    const result = sortByEloWithLocalBoost(cards, "CA");

    expect(result.map((entry) => entry.id)).toEqual(["ca-high", "ca-low", "us-high", "us-low"]);
  });

  it("falls back to plain Elo order when no local country is known", () => {
    const cards = [card("a", 1400), card("b", 1900)];

    expect(sortByEloWithLocalBoost(cards, null).map((entry) => entry.id)).toEqual(["b", "a"]);
  });

  it("matches country codes case-insensitively", () => {
    const cards = [card("a", 1400, "ca"), card("b", 1900, "US")];

    expect(sortByEloWithLocalBoost(cards, "CA").map((entry) => entry.id)).toEqual(["a", "b"]);
  });
});

describe("assignTiers", () => {
  it("splits a population into five percentile-based tiers, highest first", () => {
    const cards = Array.from({ length: 20 }, (_, index) => card(`h${index}`, 2000 - index * 10));

    const groups = assignTiers(cards);

    expect(groups.map((group) => group.tier)).toEqual(["S", "A", "B", "C", "D"]);
    // Every hackathon is accounted for exactly once.
    expect(groups.reduce((total, group) => total + group.hackathons.length, 0)).toBe(20);
    // Tiers stay ordered highest-to-lowest.
    expect(groups[0].hackathons[0]?.id).toBe("h0");
    expect(groups.at(-1)?.hackathons.at(-1)?.id).toBe("h19");
  });

  it("keeps every tier non-negative and handles a tiny population", () => {
    const groups = assignTiers([card("only", 1500)]);

    expect(groups.reduce((total, group) => total + group.hackathons.length, 0)).toBe(1);
  });
});
