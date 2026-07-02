import { describe, expect, it } from "vitest";

import { hackathonSearchSchema } from "@/lib/validations/hackathon";

describe("hackathonSearchSchema", () => {
  it("accepts a valid filter payload", () => {
    const result = hackathonSearchSchema.safeParse({
      q: "Toronto",
      city: "Toronto",
      format: "in_person",
      limit: "12",
    });

    expect(result.success).toBe(true);
  });
});
