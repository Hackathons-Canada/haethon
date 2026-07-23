"use client";

import { useMemo, useState } from "react";

import { SubmissionReviewCard, type SubmissionReviewItem } from "@/components/admin/submission-review-card";

export function SubmissionReviewQueue({
  allowDeleteExisting = false,
  emptyMessage,
  endpointBase,
  submissions,
}: {
  allowDeleteExisting?: boolean;
  emptyMessage: string;
  endpointBase: string;
  submissions: SubmissionReviewItem[];
}) {
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(() => new Set());
  const remainingSubmissions = useMemo(
    () => submissions.filter((submission) => !reviewedIds.has(submission.id)),
    [reviewedIds, submissions]
  );
  const activeSubmission = remainingSubmissions[0];

  function onReviewed(submissionId: string) {
    setReviewedIds((current) => {
      const next = new Set(current);
      next.add(submissionId);
      return next;
    });
  }

  if (!activeSubmission) {
    return <div className="border border-ink/15 bg-paper p-5 text-sm text-ink/55">{emptyMessage}</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 border border-ink/15 bg-paper px-4 py-3 text-sm">
        <span className="font-semibold text-ink">{remainingSubmissions.length} pending</span>
        <span className="text-ink/55">Showing next submission</span>
      </div>
      <SubmissionReviewCard
        key={activeSubmission.id}
        allowDeleteExisting={allowDeleteExisting}
        endpointBase={endpointBase}
        onReviewed={onReviewed}
        submission={activeSubmission}
      />
    </div>
  );
}
