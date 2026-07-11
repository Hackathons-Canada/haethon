import { redirect } from "next/navigation";
import { Building2, ClipboardCheck } from "lucide-react";

import { SubmissionReviewQueue } from "@/components/admin/submission-review-queue";
import { getCurrentUserContext } from "@/lib/auth";
import { getApprovedOrganizationIdsForUser, listHackathonSubmissions } from "@/lib/hackathons/review-service";

export default async function OrganizerReviewPage() {
  const context = await getCurrentUserContext();

  if (!context) {
    redirect("/sign-in");
  }

  const organizationIds = await getApprovedOrganizationIdsForUser(context.user.id);
  const submissions = await listHackathonSubmissions({ allowedOrganizationIds: organizationIds, limit: 100 });
  const pending = submissions.filter((submission) => submission.status === "pending");

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-white/[0.06] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rust">Organizer console</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl font-semibold tracking-[-0.02em] text-navy dark:text-wheat">Organization review queue</h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-navy/55 dark:text-wheat/55">
              Review submissions connected to your verified organizations.
            </p>
          </div>
          <div className="rounded-xl border border-navy/10 dark:border-white/10 bg-ivory dark:bg-white/5 px-4 py-3 text-sm font-semibold text-navy dark:text-wheat">
            {organizationIds.length} verified orgs
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-white/[0.06] p-5">
          <Building2 aria-hidden="true" className="size-5 text-cabernet dark:text-[#e4a3ab]" />
          <p className="mt-3 text-sm font-semibold text-navy/55 dark:text-wheat/55">Verified organizations</p>
          <p className="mt-1 text-3xl font-semibold text-navy dark:text-wheat">{organizationIds.length}</p>
        </div>
        <div className="rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-white/[0.06] p-5">
          <ClipboardCheck aria-hidden="true" className="size-5 text-cabernet dark:text-[#e4a3ab]" />
          <p className="mt-3 text-sm font-semibold text-navy/55 dark:text-wheat/55">Pending submissions</p>
          <p className="mt-1 text-3xl font-semibold text-navy dark:text-wheat">{pending.length}</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-navy dark:text-wheat">Review queue</h2>
        <SubmissionReviewQueue
          emptyMessage="No pending submissions are connected to your verified organizations."
          endpointBase="/api/organizer/hackathon-submissions"
          submissions={pending}
        />
      </section>
    </div>
  );
}
