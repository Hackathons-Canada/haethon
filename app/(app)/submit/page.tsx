import { HackathonSubmissionForm } from "@/components/forms/hackathon-submission-form";

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <main className="px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:px-12">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
          <div className="max-w-3xl">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-[#660000]">
              Hackathon submission
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.05] text-black sm:text-5xl">
              Submit a hackathon
            </h1>
            <p className="mt-6 text-base leading-7 text-[#3F3E3B]">
              Send official organizer details or contribute a community tip when you only know the basics.
              Every community submission goes through review before it becomes public.
            </p>
          </div>
          <HackathonSubmissionForm />
        </div>
      </main>
    </div>
  );
}
