import { describe, expect, it } from "vitest";

import { pickMatchup, pushRecentIds } from "@/lib/hackathons/faceoff-pairing";

function candidate(id: string, eloRating: number) {
  return { id, eloRating };
}

describe("pickMatchup", () => {
  it("returns null when the pool has fewer than two hackathons", () => {
    expect(pickMatchup([], [])).toBeNull();
    expect(pickMatchup([candidate("a", 1500)], [])).toBeNull();
  });

  it("never pairs a hackathon against itself", () => {
    const pool = Array.from({ length: 6 }, (_, index) => candidate(`h${index}`, 1500 + index * 10));

    for (let attempt = 0; attempt < 50; attempt += 1) {
      const pair = pickMatchup(pool, []);
      expect(pair).not.toBeNull();
      expect(pair?.[0].id).not.toBe(pair?.[1].id);
    }
  });

  it("still returns a pair when every hackathon but one is in the recent list", () => {
    const pool = [candidate("a", 1500), candidate("b", 1500)];

    const pair = pickMatchup(pool, ["a"]);

    expect(pair).not.toBeNull();
  });
});

describe("pushRecentIds", () => {
  it("prepends new ids and caps the history length", () => {
    const result = pushRecentIds(["a", "b"], "c", "d");

    expect(result.slice(0, 2)).toEqual(["c", "d"]);
    expect(result.length).toBeLessThanOrEqual(8);
  });
});
