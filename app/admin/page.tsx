import { redirect } from "next/navigation";

import { requireAdmin, syncCurrentUser } from "@/lib/auth";

export default async function AdminPage() {
  await syncCurrentUser();

  const gate = await requireAdmin();

  if (gate.reason === "unauthenticated") {
    redirect("/sign-in");
  }

  if (gate.reason === "forbidden") {
    redirect("/");
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-14 md:px-10">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.25em] text-amber-300">Admin console</p>
        <h1 className="text-4xl font-semibold text-white">Import review and operations surface</h1>
        <p className="max-w-2xl text-base text-stone-300">
          This route is already protected by Clerk middleware and a role check. Use it for import queue review, duplicate merging, lead management, and reminder operations.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          "Pending import batches",
          "Open organizer claims",
          "Reminder jobs due today",
        ].map((item) => (
          <div key={item} className="rounded-3xl border border-white/10 bg-white/5 p-6 text-stone-100">
            <p className="text-sm text-stone-400">{item}</p>
            <p className="mt-3 text-3xl font-semibold">0</p>
          </div>
        ))}
      </div>
    </main>
  );
}
