import { describe, expect, it } from "vitest";

import { profileUpdateSchema } from "@/lib/validations/hackathon";
import { parsePortfolioUrl, parseSocialInput } from "@/lib/validations/social";

describe("parseSocialInput", () => {
  it("accepts a bare handle and builds the canonical URL", () => {
    const result = parseSocialInput("linkedinUrl", "jane-doe");

    expect(result).toEqual({
      ok: true,
      handle: "jane-doe",
      url: "https://www.linkedin.com/in/jane-doe",
    });
  });

  it("strips a leading @", () => {
    const result = parseSocialInput("xUrl", "@janedoe");

    expect(result).toEqual({ ok: true, handle: "janedoe", url: "https://x.com/janedoe" });
  });

  it("extracts the handle from a pasted full URL", () => {
    expect(parseSocialInput("linkedinUrl", "https://www.linkedin.com/in/jane-doe/")).toEqual({
      ok: true,
      handle: "jane-doe",
      url: "https://www.linkedin.com/in/jane-doe",
    });
    expect(parseSocialInput("githubUrl", "github.com/octocat")).toEqual({
      ok: true,
      handle: "octocat",
      url: "https://github.com/octocat",
    });
  });

  it("ignores query strings and tracking params", () => {
    const result = parseSocialInput("instagramUrl", "https://instagram.com/jane.doe?igsh=abc123");

    expect(result).toEqual({
      ok: true,
      handle: "jane.doe",
      url: "https://www.instagram.com/jane.doe",
    });
  });

  it("accepts twitter.com as an alias for x.com", () => {
    const result = parseSocialInput("xUrl", "https://twitter.com/janedoe");

    expect(result).toEqual({ ok: true, handle: "janedoe", url: "https://x.com/janedoe" });
  });

  it("rejects URLs on the wrong domain", () => {
    expect(parseSocialInput("linkedinUrl", "https://evil.com/in/jane-doe").ok).toBe(false);
    expect(parseSocialInput("githubUrl", "https://linkedin.com/in/jane-doe").ok).toBe(false);
  });

  it("rejects lookalike domains that merely contain the platform name", () => {
    expect(parseSocialInput("linkedinUrl", "https://linkedin.evil.com/in/jane-doe").ok).toBe(false);
    expect(parseSocialInput("linkedinUrl", "https://fakelinkedin.com/in/jane-doe").ok).toBe(false);
  });

  it("rejects non-http protocols", () => {
    expect(parseSocialInput("githubUrl", "javascript:alert(1)//github.com/x").ok).toBe(false);
  });

  it("rejects LinkedIn links that are not profile pages", () => {
    expect(parseSocialInput("linkedinUrl", "https://linkedin.com/company/acme").ok).toBe(false);
    expect(parseSocialInput("linkedinUrl", "https://linkedin.com").ok).toBe(false);
  });

  it("rejects handles with invalid characters or length", () => {
    expect(parseSocialInput("xUrl", "way_too_long_for_twitter").ok).toBe(false);
    expect(parseSocialInput("githubUrl", "bad handle!").ok).toBe(false);
    expect(parseSocialInput("linkedinUrl", "ab").ok).toBe(false);
  });
});

describe("parsePortfolioUrl", () => {
  it("accepts any domain and fills in https://", () => {
    const result = parsePortfolioUrl("janedoe.dev");

    expect(result).toEqual({ ok: true, handle: "https://janedoe.dev/", url: "https://janedoe.dev/" });
  });

  it("rejects javascript: and data: URLs", () => {
    expect(parsePortfolioUrl("javascript:alert(1)").ok).toBe(false);
    expect(parsePortfolioUrl("data:text/html,<script>alert(1)</script>").ok).toBe(false);
  });

  it("rejects strings that are not URLs", () => {
    expect(parsePortfolioUrl("not a url").ok).toBe(false);
    expect(parsePortfolioUrl("localhost").ok).toBe(false);
  });
});

describe("profileUpdateSchema social fields", () => {
  it("normalizes handles and pasted URLs to canonical URLs", () => {
    const result = profileUpdateSchema.safeParse({
      linkedinUrl: "www.linkedin.com/in/jane-doe",
      githubUrl: "octocat",
      xUrl: "@janedoe",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.linkedinUrl).toBe("https://www.linkedin.com/in/jane-doe");
      expect(result.data.githubUrl).toBe("https://github.com/octocat");
      expect(result.data.xUrl).toBe("https://x.com/janedoe");
    }
  });

  it("rejects wrong-domain social links", () => {
    const result = profileUpdateSchema.safeParse({
      linkedinUrl: "https://myphishingsite.com/in/jane-doe",
    });

    expect(result.success).toBe(false);
  });

  it("rejects profane handles and profile text", () => {
    expect(profileUpdateSchema.safeParse({ githubUrl: "sh1tlord" }).success).toBe(false);
    expect(profileUpdateSchema.safeParse({ headline: "professional b1tch" }).success).toBe(false);
    expect(profileUpdateSchema.safeParse({ headline: "Software engineer" }).success).toBe(true);
  });

  it("clears a field when an empty string is sent", () => {
    const result = profileUpdateSchema.safeParse({ linkedinUrl: "", headline: "" });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.linkedinUrl).toBeNull();
      expect(result.data.headline).toBeNull();
    }
  });

  it("rejects javascript: portfolio links", () => {
    expect(profileUpdateSchema.safeParse({ portfolioUrl: "javascript:alert(1)" }).success).toBe(false);
  });
});
