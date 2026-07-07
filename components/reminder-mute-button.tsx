"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BellOff } from "lucide-react";

function handleUnauthenticated() {
  window.location.href = "/sign-in";
}

export function ReminderMuteButton({ reminderId, label }: { reminderId: string; label: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function mute() {
    if (pending) {
      return;
    }

    setPending(true);

    try {
      const response = await fetch(`/api/reminders/${encodeURIComponent(reminderId)}`, { method: "DELETE" });

      if (response.status === 401) {
        handleUnauthenticated();
        return;
      }

      if (response.ok) {
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      aria-label={`Mute reminder: ${label}`}
      className="grid size-7 place-items-center text-[#706F6B] transition-colors hover:text-[#660000] disabled:cursor-wait disabled:opacity-60"
      disabled={pending}
      onClick={mute}
      title="Mute this reminder"
      type="button"
    >
      <BellOff aria-hidden="true" className="size-3.5" />
    </button>
  );
}
