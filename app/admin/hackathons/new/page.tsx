import { HackathonCreateForm } from "@/components/admin/hackathon-create-form";

export default function AdminAddHackathonPage() {
  return (
    <div className="space-y-6">
      <section className="border border-ink/15 bg-paper p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pine">Instant add</p>
        <h1 className="mt-2 text-4xl font-medium tracking-tight text-ink">
          Add a hackathon
        </h1>
        <p className="mt-2 max-w-3xl text-base leading-7 text-ink/55">
          Publishes straight to the public catalog — no review queue. Status comes from the dates, so an event with
          last year&apos;s dates is recorded as a past hackathon; tick &ldquo;Repeats yearly&rdquo; to keep it visible to
          users as an event that will return.
        </p>
      </section>

      <HackathonCreateForm />
    </div>
  );
}
