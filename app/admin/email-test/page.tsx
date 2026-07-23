import { desc, eq, sql } from "drizzle-orm";

import { EmailTestForm } from "@/components/admin/email-test-form";
import { db } from "@/lib/db";
import { hackathonDates, hackathons } from "@/lib/db/schema";

export default async function AdminEmailTestPage() {
  const hackathonRows = await db
    .select({
      id: hackathons.id,
      name: hackathons.name,
      startsAt: hackathonDates.startsAt,
    })
    .from(hackathons)
    .leftJoin(hackathonDates, eq(hackathonDates.hackathonId, hackathons.id))
    .orderBy(sql`${hackathonDates.startsAt} desc nulls last`, desc(hackathons.createdAt))
    .limit(300);

  const options = hackathonRows.map((row) => ({
    id: row.id,
    name: row.name,
    startsAt: row.startsAt ? row.startsAt.toISOString() : null,
  }));

  return (
    <div className="space-y-6">
      <section className="border border-ink/15 bg-paper p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pine">Admin tools</p>
        <h1 className="mt-2 text-4xl font-medium tracking-tight text-ink">Test reminder emails</h1>
        <p className="mt-2 max-w-3xl text-base leading-7 text-ink/55">
          Send yourself the exact email a hacker would receive for a given hackathon and reminder type. The message is
          rendered from the same template the daily cron uses, so what you see here is what ships.
        </p>
      </section>

      <section className="border border-ink/15 bg-paper p-6">
        <EmailTestForm hackathons={options} />
      </section>
    </div>
  );
}
