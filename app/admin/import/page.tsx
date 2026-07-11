import { HackathonJsonImporter } from "@/components/admin/hackathon-json-importer";

export default function AdminImportPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-white/[0.06] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rust">Admin import</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-[-0.02em] text-navy dark:text-wheat">Review imported cards</h1>
        <p className="mt-2 max-w-3xl text-base leading-7 text-navy/55 dark:text-wheat/55">
          Paste a JSON batch, review each generated website card, then choose yes to import it or no to skip it.
        </p>
      </section>

      <section className="rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-white/[0.06] p-6">
        <HackathonJsonImporter />
      </section>
    </div>
  );
}
