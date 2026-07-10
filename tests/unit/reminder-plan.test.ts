import { describe, expect, it } from "vitest";

import { computeSelectableReminderPlan } from "@/lib/hackathons/reminder-plan";

const now = new Date("2026-07-01T00:00:00Z");

const dates = {
  startsAt: new Date("2026-09-12T15:00:00Z"),
  endsAt: new Date("2026-09-14T20:00:00Z"),
  applicationOpensAt: new Date("2026-07-15T00:00:00Z"),
  applicationClosesAt: new Date("2026-08-20T00:00:00Z"),
  acceptanceAt: new Date("2026-08-28T00:00:00Z"),
};

function types(plan: ReturnType<typeof computeSelectableReminderPlan>) {
  return plan.map((entry) => entry.type);
}

describe("computeSelectableReminderPlan", () => {
  it("returns nothing without dates", () => {
    expect(computeSelectableReminderPlan(null, now)).toEqual([]);
  });

  it("schedules the three selectable email reminders", () => {
    const plan = computeSelectableReminderPlan(dates, now);

    expect(types(plan)).toEqual(["application_open", "hackathon_week_before", "hackathon_day_before"]);
    expect(plan[0].scheduledFor).toEqual(dates.applicationOpensAt);
    expect(plan[1].scheduledFor).toEqual(new Date("2026-09-05T15:00:00Z"));
    expect(plan[2].scheduledFor).toEqual(new Date("2026-09-11T15:00:00Z"));
  });

  it("omits the start-relative reminders when there is no start date", () => {
    const plan = computeSelectableReminderPlan({ ...dates, startsAt: null }, now);

    expect(types(plan)).toEqual(["application_open"]);
  });

  it("drops reminders that are already in the past", () => {
    const afterEverything = new Date("2026-10-01T00:00:00Z");

    expect(computeSelectableReminderPlan(dates, afterEverything)).toEqual([]);
  });

  it("keeps only future-dated entries once the window is partway open", () => {
    const midway = new Date("2026-09-06T00:00:00Z");

    expect(types(computeSelectableReminderPlan(dates, midway))).toEqual(["hackathon_day_before"]);
  });
});
