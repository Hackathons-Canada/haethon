import { describe, expect, it } from "vitest";

import { countWeekEmails, findWeekOverEmailLimit, weekStartUtc, type EmailEvent } from "@/lib/notifications/email-week";

function immediate(occursAt: string): EmailEvent {
  return { type: "application_day_before", occursAt: new Date(occursAt) };
}

function digest(occursAt: string): EmailEvent {
  return { type: "hackathon_week_before", occursAt: new Date(occursAt) };
}

describe("weekStartUtc", () => {
  it("returns the Monday of the week for a mid-week date", () => {
    // 2026-07-16 is a Thursday.
    expect(weekStartUtc(new Date("2026-07-16T18:30:00Z")).toISOString()).toBe("2026-07-13T00:00:00.000Z");
  });

  it("keeps a Monday at midnight as its own week start", () => {
    expect(weekStartUtc(new Date("2026-07-13T00:00:00Z")).toISOString()).toBe("2026-07-13T00:00:00.000Z");
  });

  it("maps a Sunday to the previous Monday", () => {
    expect(weekStartUtc(new Date("2026-07-19T23:59:59Z")).toISOString()).toBe("2026-07-13T00:00:00.000Z");
  });
});

describe("findWeekOverEmailLimit", () => {
  it("allows five individual emails in one week", () => {
    const events = ["-13", "-14", "-15", "-16", "-17"].map((day) => immediate(`2026-07${day}T12:00:00Z`));

    expect(findWeekOverEmailLimit(events, false)).toBeNull();
  });

  it("flags a sixth individual email in the same week", () => {
    const events = ["-13", "-14", "-15", "-16", "-17", "-18"].map((day) => immediate(`2026-07${day}T12:00:00Z`));

    expect(findWeekOverEmailLimit(events, false)?.toISOString()).toBe("2026-07-13T00:00:00.000Z");
  });

  it("counts any number of digest reminders in a week as one shared email", () => {
    const events = [
      digest("2026-07-14T12:00:00Z"),
      digest("2026-07-15T12:00:00Z"),
      digest("2026-07-16T12:00:00Z"),
      ...["-13", "-14", "-15", "-16"].map((day) => immediate(`2026-07${day}T12:00:00Z`)),
    ];

    expect(countWeekEmails(events, new Date("2026-07-16T00:00:00Z"), false)).toBe(5);
    expect(findWeekOverEmailLimit(events, false)).toBeNull();
  });

  it("flags a digest landing in a week already full of individual emails", () => {
    const events = [
      digest("2026-07-14T12:00:00Z"),
      ...["-13", "-14", "-15", "-16", "-17"].map((day) => immediate(`2026-07${day}T12:00:00Z`)),
    ];

    expect(findWeekOverEmailLimit(events, false)?.toISOString()).toBe("2026-07-13T00:00:00.000Z");
  });

  it("reserves the digest slot in every week for a country alert subscription", () => {
    const fullWeek = ["-13", "-14", "-15", "-16", "-17"].map((day) => immediate(`2026-07${day}T12:00:00Z`));

    expect(findWeekOverEmailLimit(fullWeek, true)?.toISOString()).toBe("2026-07-13T00:00:00.000Z");
  });

  it("shares one slot between digest reminders and a country alert", () => {
    const events = [
      digest("2026-07-14T12:00:00Z"),
      ...["-13", "-14", "-15", "-16"].map((day) => immediate(`2026-07${day}T12:00:00Z`)),
    ];

    expect(findWeekOverEmailLimit(events, true)).toBeNull();
  });

  it("does not mix weeks together", () => {
    const events = [
      ...["-13", "-14", "-15", "-16", "-17"].map((day) => immediate(`2026-07${day}T12:00:00Z`)),
      ...["-20", "-21", "-22", "-23", "-24"].map((day) => immediate(`2026-07${day}T12:00:00Z`)),
    ];

    expect(findWeekOverEmailLimit(events, false)).toBeNull();
  });
});
