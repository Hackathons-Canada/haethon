import { describe, expect, it } from "vitest";

import { computeReminderPlan } from "@/lib/hackathons/reminder-plan";

const now = new Date("2026-07-01T00:00:00Z");

const dates = {
  startsAt: new Date("2026-09-12T15:00:00Z"),
  endsAt: new Date("2026-09-14T20:00:00Z"),
  applicationOpensAt: new Date("2026-07-15T00:00:00Z"),
  applicationClosesAt: new Date("2026-08-20T00:00:00Z"),
  acceptanceAt: new Date("2026-08-28T00:00:00Z"),
};

function types(plan: ReturnType<typeof computeReminderPlan>) {
  return plan.map((entry) => entry.type);
}

describe("computeReminderPlan", () => {
  it("returns nothing without dates", () => {
    expect(computeReminderPlan("interested", null, now)).toEqual([]);
  });

  it("reminds interested hackers about the application window", () => {
    const plan = computeReminderPlan("interested", dates, now);

    expect(types(plan)).toEqual(["application_open", "application_close"]);
    expect(plan[0].scheduledFor).toEqual(dates.applicationOpensAt);
    expect(plan[1].scheduledFor).toEqual(new Date("2026-08-18T00:00:00Z"));
  });

  it("falls back to the close date when the heads-up moment already passed", () => {
    const lateNow = new Date("2026-08-19T00:00:00Z");
    const plan = computeReminderPlan("interested", dates, lateNow);

    expect(types(plan)).toEqual(["application_close"]);
    expect(plan[0].scheduledFor).toEqual(dates.applicationClosesAt);
  });

  it("reminds applied hackers about acceptance decisions", () => {
    const plan = computeReminderPlan("applied", dates, now);

    expect(types(plan)).toEqual(["acceptance_date", "hackathon_start"]);
    expect(plan[0].scheduledFor).toEqual(dates.acceptanceAt);
  });

  it("reminds accepted hackers about the start and check-in", () => {
    expect(types(computeReminderPlan("accepted", dates, now))).toEqual(["hackathon_start", "check_in"]);
  });

  it("adds an attendance check for attending hackers", () => {
    expect(types(computeReminderPlan("attending", dates, now))).toEqual([
      "hackathon_start",
      "check_in",
      "attendance_check",
    ]);
  });

  it("nudges attended hackers to update their profile", () => {
    const plan = computeReminderPlan("attended", dates, now);

    expect(types(plan)).toEqual(["add_to_profile"]);
    expect(plan[0].scheduledFor).toEqual(new Date("2026-09-15T20:00:00Z"));
  });

  it("drops reminders that are already in the past", () => {
    const afterEverything = new Date("2026-10-01T00:00:00Z");

    expect(computeReminderPlan("attending", dates, afterEverything)).toEqual([]);
    expect(computeReminderPlan("interested", dates, afterEverything)).toEqual([]);
  });
});
