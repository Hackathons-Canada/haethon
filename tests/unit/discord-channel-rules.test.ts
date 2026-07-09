import { describe, expect, it } from "vitest";

import { categoryForHackathon, channelNameForHackathon } from "@/lib/discord/channel-rules";

describe("Discord channel rules", () => {
  it("prefixes the channel with the UTC start month and day", () => {
    expect(
      channelNameForHackathon({
        name: "Hack North 2026",
        startsAt: new Date("2026-09-13T00:00:00.000Z"),
      })
    ).toBe("sep-13-hack-north-2026");
  });

  it("pads single-digit start days", () => {
    expect(
      channelNameForHackathon({
        name: "Delta Hacks 2027",
        startsAt: new Date("2027-01-05T00:00:00.000Z"),
      })
    ).toBe("jan-05-delta-hacks-2027");
  });

  it("places active Canadian and US hackathons in their own categories", () => {
    const event = {
      endsAt: new Date("2027-09-15T00:00:00.000Z"),
      now: new Date("2027-09-01T00:00:00.000Z"),
      status: "upcoming",
    };

    expect(categoryForHackathon({ ...event, country: "Canada" })).toBe("canada");
    expect(categoryForHackathon({ ...event, country: "USA" })).toBe("us");
  });

  it("places eligible completed hackathons in the past category", () => {
    expect(
      categoryForHackathon({
        country: "United States",
        endsAt: new Date("2026-09-15T00:00:00.000Z"),
        now: new Date("2026-10-01T00:00:00.000Z"),
        status: "upcoming",
      })
    ).toBe("past");
  });

  it("does not assign a Discord category to other countries", () => {
    expect(
      categoryForHackathon({
        country: "Mexico",
        endsAt: new Date("2025-09-15T00:00:00.000Z"),
        now: new Date("2026-10-01T00:00:00.000Z"),
        status: "completed",
      })
    ).toBeNull();
  });
});
