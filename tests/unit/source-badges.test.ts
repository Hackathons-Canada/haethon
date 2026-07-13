import { describe, expect, it } from "vitest";

import {
  COMMUNITY_FORM_SOURCE_URL,
  deriveSourceType,
  pickPrimarySourceBadge,
} from "@/lib/hackathons/source-provenance";

describe("hackathon source badges", () => {
  it("identifies supported websites and reserves Community for the approved form", () => {
    expect(deriveSourceType("https://events.mlh.io/events/123")).toBe("mlh");
    expect(deriveSourceType("https://mlh.com/events/123")).toBe("mlh");
    expect(deriveSourceType("https://events.majorleaguehacking.com/example")).toBe("mlh");
    expect(deriveSourceType("https://lu.ma/example")).toBe("luma");
    expect(deriveSourceType("https://events.luma.com/example")).toBe("luma");
    expect(deriveSourceType("https://cerebralvalley.ai/events/example")).toBe("cerebral_valley");
    expect(deriveSourceType("https://events.cerebralvalley.ai/example")).toBe("cerebral_valley");
    expect(deriveSourceType("https://devpost.com/hackathons/example")).toBe("devpost");
    expect(deriveSourceType("https://example-hackathon.devpost.com")).toBe("devpost");
    expect(deriveSourceType("https://example.edu/events/hackathon")).toBe("other");
    expect(deriveSourceType(COMMUNITY_FORM_SOURCE_URL)).toBe("manual");
  });

  it("uses the most frequent source, then the specified source order for ties", () => {
    expect(
      pickPrimarySourceBadge([
        { sourceType: "devpost", sourceUrl: "https://devpost.com/hackathons/example" },
        { sourceType: "luma", sourceUrl: "https://lu.ma/example" },
        { sourceType: "luma", sourceUrl: "https://lu.ma/example" },
      ])
    ).toEqual({ type: "luma", label: "Luma" });

    expect(
      pickPrimarySourceBadge([
        { sourceType: "devpost", sourceUrl: "https://devpost.com/hackathons/example" },
        { sourceType: "cerebral_valley", sourceUrl: "https://cerebralvalley.ai/events/example" },
        { sourceType: "luma", sourceUrl: "https://lu.ma/example" },
        { sourceType: "mlh", sourceUrl: "https://mlh.io/events/example" },
      ])
    ).toEqual({ type: "mlh", label: "MLH" });
  });

  it("shows an unrecognized source's website instead of Community", () => {
    expect(
      pickPrimarySourceBadge([{ sourceType: "other", sourceUrl: "https://events.example.edu/hackathons/example" }])
    ).toEqual({ type: "other", label: "events.example.edu" });
  });
});
