import { describe, expect, it } from "vitest";

import { submissionReviewErrorMessage, submissionReviewIntent } from "@/components/admin/submission-review-card";

describe("submissionReviewErrorMessage", () => {
  it("turns field validation errors into renderable text", () => {
    expect(
      submissionReviewErrorMessage({
        fieldErrors: { rejectionReason: ["Too small: expected string to have >=3 characters"] },
        formErrors: [],
      })
    ).toBe("Enter a rejection reason of at least 3 characters before rejecting.");
  });

  it("uses a safe fallback for unknown error responses", () => {
    expect(submissionReviewErrorMessage({ unexpected: "response" })).toBe("Review action failed.");
  });
});

describe("submissionReviewIntent", () => {
  it("reads the clicked submit button instead of falling through to approval", () => {
    const rejectButton = document.createElement("button");
    rejectButton.value = "reject";

    expect(submissionReviewIntent(rejectButton)).toBe("reject");
  });
});
