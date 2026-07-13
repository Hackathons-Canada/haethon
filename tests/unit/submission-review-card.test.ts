import { describe, expect, it } from "vitest";

import { submissionReviewErrorMessage } from "@/components/admin/submission-review-card";

describe("submissionReviewErrorMessage", () => {
  it("turns field validation errors into renderable text", () => {
    expect(
      submissionReviewErrorMessage({
        fieldErrors: { rejectionReason: ["Too small: expected string to have >=3 characters"] },
        formErrors: [],
      })
    ).toBe("rejectionReason: Too small: expected string to have >=3 characters");
  });

  it("uses a safe fallback for unknown error responses", () => {
    expect(submissionReviewErrorMessage({ unexpected: "response" })).toBe("Review action failed.");
  });
});
