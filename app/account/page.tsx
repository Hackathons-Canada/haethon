import Link from "next/link";
import { redirect } from "next/navigation";
import { and, desc, eq, isNotNull, or } from "drizzle-orm";

import { AccountProfileForm } from "@/components/forms/account-profile-form";
import { getCurrentUserContext } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  hackathonDates,
  hackathonLocations,
  hackathonResults,
  hackathons,
  hackathonSubmissions,
  userHackathonAttendanceDays,
  userHackathons,
  userProfiles,
} from "@/lib/db/schema";
import { dateToInputValue } from "@/lib/hackathons/utils";

function activityCells(attendance: { attendedOn: Date }[]) {
  const today = new Date();
  const cells = [];
  const attendanceByDay = new Map<string, number>();

  for (const row of attendance) {
    const key = dateToInputValue(row.attendedOn);
    attendanceByDay.set(key, (attendanceByDay.get(key) ?? 0) + 1);
  }

  for (let index = 83; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    const key = dateToInputValue(date);
    const count = attendanceByDay.get(key) ?? 0;
    cells.push({ key, count });
  }

  return cells;
}

const sectionHeadingClassName = "text-sm font-semibold uppercase tracking-[0.2em] text-[#660000]";

export default async function AccountPage() {
  const context = await getCurrentUserContext();

  if (!context) {
    redirect("/sign-in");
  }

  const [[profile], savedHackathons, wins, submissions, attendance] = await Promise.all([
    db.select().from(userProfiles).where(eq(userProfiles.userId, context.user.id)).limit(1),
    db
      .select({
        id: userHackathons.id,
        applicationStatus: userHackathons.applicationStatus,
        hackathonName: hackathons.name,
        hackathonStatus: hackathons.status,
        city: hackathonLocations.city,
        region: hackathonLocations.region,
        country: hackathonLocations.country,
        startsAt: hackathonDates.startsAt,
        endsAt: hackathonDates.endsAt,
      })
      .from(userHackathons)
      .innerJoin(hackathons, eq(hackathons.id, userHackathons.hackathonId))
      .leftJoin(hackathonLocations, eq(hackathonLocations.hackathonId, hackathons.id))
      .leftJoin(hackathonDates, eq(hackathonDates.hackathonId, hackathons.id))
      .where(and(eq(userHackathons.userId, context.user.id), eq(userHackathons.isSaved, true)))
      .orderBy(desc(userHackathons.updatedAt))
      .limit(8),
    db
      .select({
        id: hackathonResults.id,
        placement: hackathonResults.placement,
        awardName: hackathonResults.awardName,
        createdAt: hackathonResults.createdAt,
        hackathonName: hackathons.name,
      })
      .from(hackathonResults)
      .innerJoin(hackathons, eq(hackathons.id, hackathonResults.hackathonId))
      .where(
        and(
          eq(hackathonResults.userId, context.user.id),
          or(isNotNull(hackathonResults.placement), isNotNull(hackathonResults.awardName))
        )
      )
      .orderBy(desc(hackathonResults.createdAt))
      .limit(8),
    db
      .select()
      .from(hackathonSubmissions)
      .where(eq(hackathonSubmissions.submittedByUserId, context.user.id))
      .orderBy(desc(hackathonSubmissions.createdAt))
      .limit(8),
    db
      .select({ attendedOn: userHackathonAttendanceDays.attendedOn })
      .from(userHackathonAttendanceDays)
      .where(eq(userHackathonAttendanceDays.userId, context.user.id)),
  ]);
  const cells = activityCells(attendance);

  return (
    <main className="min-h-[calc(100vh-80px)] bg-white px-5 py-8 text-black sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-[1120px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-black/10 bg-[#F7F7F4] p-6">
            <p className={sectionHeadingClassName}>My account</p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold text-black">
                  {[context.user.firstName, context.user.lastName].filter(Boolean).join(" ") || context.user.email}
                </h1>
                <p className="mt-1 text-sm text-[#706F6B]">{context.user.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#660000] bg-white px-4 text-sm font-semibold text-[#660000] transition hover:bg-[#660000] hover:text-white focus-visible:bg-[#660000] focus-visible:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#660000]"
                  href="/account/settings"
                >
                  Account Settings
                </Link>
                <div className="rounded-lg border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black">
                  {attendance.length} attended days
                </div>
              </div>
            </div>
          </section>

          <section id="profile">
            <AccountProfileForm profile={profile ?? null} />
          </section>

          <section id="activity" className="rounded-lg border border-black/10 bg-[#F7F7F4] p-5">
            <h2 className={sectionHeadingClassName}>Activity</h2>
            <div className="mt-4 grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-1">
              {cells.map((cell) => (
                <div
                  className={`size-4 rounded-[4px] ${
                    cell.count > 1 ? "bg-[#660000]" : cell.count === 1 ? "bg-[#B55A5A]" : "bg-black/10"
                  }`}
                  key={cell.key}
                  title={`${cell.key}: ${cell.count} attended hackathon day${cell.count === 1 ? "" : "s"}`}
                />
              ))}
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <section id="saved" className="rounded-lg border border-black/10 bg-[#F7F7F4] p-5">
              <h2 className={sectionHeadingClassName}>Saved hackathons</h2>
              <div className="mt-4 space-y-3">
                {savedHackathons.length ? (
                  savedHackathons.map((hackathon) => (
                    <div className="rounded-lg border border-black/10 bg-white p-4" key={hackathon.id}>
                      <p className="font-semibold text-black">{hackathon.hackathonName}</p>
                      <p className="mt-1 text-sm text-[#706F6B]">
                        {[hackathon.city, hackathon.region, hackathon.country].filter(Boolean).join(", ")} ·{" "}
                        {dateToInputValue(hackathon.startsAt)}
                      </p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#660000]">
                        {hackathon.applicationStatus}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#706F6B]">Saved hackathons will appear here.</p>
                )}
              </div>
            </section>

            <section className="rounded-lg border border-black/10 bg-[#F7F7F4] p-5">
              <h2 className={sectionHeadingClassName}>Verified wins</h2>
              <div className="mt-4 space-y-3">
                {wins.length ? (
                  wins.map((win) => (
                    <div className="rounded-lg border border-black/10 bg-white p-4" key={win.id}>
                      <p className="font-semibold text-black">{win.hackathonName}</p>
                      <p className="mt-1 text-sm text-[#706F6B]">{win.awardName ?? win.placement}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#706F6B]">Verified results from organizers and admins will appear here.</p>
                )}
              </div>
            </section>
          </div>

          <section id="submissions" className="rounded-lg border border-black/10 bg-[#F7F7F4] p-5">
            <h2 className={sectionHeadingClassName}>Submissions</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-black/10 text-xs uppercase tracking-[0.16em] text-[#706F6B]">
                  <tr>
                    <th className="py-3 pr-4">Hackathon</th>
                    <th className="py-3 pr-4">Type</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {submissions.map((submission) => (
                    <tr key={submission.id}>
                      <td className="py-3 pr-4 font-semibold text-black">{submission.normalizedName}</td>
                      <td className="py-3 pr-4 capitalize text-[#706F6B]">{submission.submitterType}</td>
                      <td className="py-3 pr-4 capitalize text-[#660000]">{submission.status}</td>
                      <td className="py-3 pr-4 text-[#706F6B]">{dateToInputValue(submission.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!submissions.length ? <p className="mt-3 text-sm text-[#706F6B]">Your submitted hackathons will appear here.</p> : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
