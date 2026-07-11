"use client";

import { useMemo, useState } from "react";

import { SubmissionReviewCard, type SubmissionReviewItem } from "@/components/admin/submission-review-card";

export function SubmissionReviewQueue({
  emptyMessage,
  endpointBase,
  submissions,
}: {
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
    return <div className="rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-white/[0.06] p-5 text-sm text-navy/55 dark:text-wheat/55">{emptyMessage}</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-white/[0.06] px-4 py-3 text-sm">
        <span className="font-semibold text-navy dark:text-wheat">{remainingSubmissions.length} pending</span>
        <span className="text-navy/55 dark:text-wheat/55">Showing next submission</span>
      </div>
      <SubmissionReviewCard key={activeSubmission.id} endpointBase={endpointBase} onReviewed={onReviewed} submission={activeSubmission} />
    </div>
  );
}
