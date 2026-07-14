import { AttendanceAnomalyManager } from "@/components/admin/attendance-anomaly-manager";
import { detectAttendanceAnomalies } from "@/lib/hackathons/attendance-anomaly-service";

export const dynamic = "force-dynamic";

export default async function AdminAttendanceAnomaliesPage() {
  const findings = await detectAttendanceAnomalies();

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-white/[0.06] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rust">Trust &amp; safety</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl font-semibold tracking-[-0.02em] text-navy dark:text-wheat">Attendance anomalies</h1>
            <p className="mt-2 max-w-3xl text-base leading-7 text-navy/55 dark:text-wheat/55">
              Statistical outliers in self reported attendance. Verify a claim to mark its days admin verified, or revoke it
              to remove the self reported days and reset the status to interested.
            </p>
          </div>
          <div className="rounded-xl border border-navy/10 dark:border-white/10 bg-ivory dark:bg-white/5 px-4 py-3 text-sm font-semibold text-navy dark:text-wheat">
            {findings.length} flagged
          </div>
        </div>
      </section>

      <AttendanceAnomalyManager findings={findings} />
    </div>
  );
}
