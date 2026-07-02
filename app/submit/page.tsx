import { HackathonSubmissionForm } from "@/components/forms/hackathon-submission-form";

export default function SubmitPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-14 md:px-10">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.25em] text-amber-300">Organizer workflow</p>
        <h1 className="text-4xl font-semibold text-white">Submit a hackathon</h1>
        <p className="max-w-2xl text-stone-300">
          This is the first RHF + Zod form scaffold. Hook it to a server action or route handler once you decide whether submissions land directly in `hackathons` or in `import_items` for review.
        </p>
      </div>
      <HackathonSubmissionForm />
    </main>
  );
}
