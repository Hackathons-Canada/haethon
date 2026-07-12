"use client";

import { useState } from "react";

/**
 * Global email on/off switch shown on the account page. Mirrors the state a
 * user can also reach through the unsubscribe link in any email footer.
 */
export function EmailPreferencesToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    const next = !enabled;

    setIsSaving(true);
    setError(null);
    setEnabled(next);

    try {
      const response = await fetch("/api/email/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });

      if (!response.ok) {
        throw new Error("Failed to update email preferences.");
      }
    } catch {
      setEnabled(!next);
      setError("Could not save your email preference. Try again in a moment.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-navy/10 dark:border-white/10 bg-ivory dark:bg-white/5 p-5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-navy dark:text-wheat">Email notifications</p>
        <p className="mt-1 text-sm text-navy/55 dark:text-wheat/55">
          {enabled
            ? "Reminders and submission updates are sent to your email."
            : "All Haethon emails are turned off, including your saved reminders."}
        </p>
        {error ? <p className="mt-1 text-sm font-semibold text-cabernet dark:text-[#e4a3ab]">{error}</p> : null}
      </div>
      <button
        aria-pressed={enabled}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cabernet/35 dark:focus-visible:outline-wheat/40 disabled:cursor-wait ${
          enabled ? "bg-cabernet dark:bg-wheat" : "bg-navy/20 dark:bg-white/20"
        }`}
        disabled={isSaving}
        onClick={() => void toggle()}
        type="button"
      >
        <span className="sr-only">{enabled ? "Turn off all emails" : "Turn on emails"}</span>
        <span
          aria-hidden="true"
          className={`inline-block size-5 rounded-full bg-white dark:bg-[#141414] transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
