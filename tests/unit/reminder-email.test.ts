import { describe, expect, it } from "vitest";

import { buildReminderEmail } from "@/lib/notifications/reminder-email";

describe("buildReminderEmail", () => {
  it("renders the subject, html, and text for a selectable reminder", async () => {
    const email = await buildReminderEmail({
      type: "hackathon_week_before",
      firstName: "Ada",
      hackathonName: "HackNight 2026",
      hackathonSlug: "hacknight-2026",
      scheduledFor: new Date("2026-09-05T15:00:00Z"),
      appUrl: "https://haethon.dev",
    });

    expect(email.subject).toBe("1 week before · HackNight 2026");
    expect(email.html).toContain("HackNight 2026");
    expect(email.html).toContain("https://haethon.dev/hackathons/hacknight-2026");
    expect(email.html).toContain("https://haethon.dev/my");
    expect(email.text).toContain("Hey Ada,");
    expect(email.text).toContain("The event starts in a week");
  });

  it("renders the application-open reminder copy", async () => {
    const email = await buildReminderEmail({
      type: "application_week_before",
      firstName: "Ada",
      hackathonName: "HackNight 2026",
      hackathonSlug: "hacknight-2026",
      scheduledFor: new Date("2026-07-08T00:00:00Z"),
      appUrl: "https://haethon.dev",
    });

    expect(email.subject).toBe("1 week before applications open · HackNight 2026");
    expect(email.text).toContain("Applications open in a week");
  });

  it("falls back to a generic greeting and the label when copy is missing", async () => {
    const email = await buildReminderEmail({
      type: "add_to_profile",
      firstName: null,
      hackathonName: "HackNight 2026",
      hackathonSlug: "hacknight-2026",
      scheduledFor: new Date("2026-09-16T00:00:00Z"),
      appUrl: "https://haethon.dev",
    });

    expect(email.subject).toBe("Add to profile · HackNight 2026");
    expect(email.text).toContain("Hey hacker,");
  });
});
