import { digestReminderTypes } from "@/lib/hackathons/reminder-plan";

/**
 * Hard cap on notification emails per user per calendar week (Monday 00:00 UTC
 * reset). Enforced when a hacker subscribes — the server refuses any change
 * that would book a sixth email into some week — and re-checked by the crons
 * as a backstop before anything actually sends.
 */
export const WEEKLY_EMAIL_LIMIT = 5;

const DAY_MS = 86_400_000;

/** Monday 00:00 UTC of the calendar week containing `date`. */
export function weekStartUtc(date: Date): Date {
  const startOfDay = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;

  return new Date(startOfDay - daysSinceMonday * DAY_MS);
}

/**
 * Something that occupies one of the week's email slots. Immediate reminders
 * are one email each; digest-type reminders share the week's single Monday
 * digest email no matter how many there are (`occursAt` is the reminder's
 * scheduledFor, or the actual send time for already-sent rows).
 */
export type EmailEvent = {
  type: string;
  occursAt: Date;
};

type WeekBudget = {
  immediateEmails: number;
  hasDigest: boolean;
};

function isDigestType(type: string) {
  return digestReminderTypes.some((digestType) => digestType === type);
}

function bucketByWeek(events: EmailEvent[]): Map<number, WeekBudget> {
  const weeks = new Map<number, WeekBudget>();

  for (const event of events) {
    const key = weekStartUtc(event.occursAt).getTime();
    const week = weeks.get(key) ?? { immediateEmails: 0, hasDigest: false };

    if (isDigestType(event.type)) {
      week.hasDigest = true;
    } else {
      week.immediateEmails += 1;
    }

    weeks.set(key, week);
  }

  return weeks;
}

export function countWeekEmails(events: EmailEvent[], week: Date, hasCountryAlert: boolean): number {
  const budget = bucketByWeek(events).get(weekStartUtc(week).getTime());

  return (budget?.immediateEmails ?? 0) + (budget?.hasDigest || hasCountryAlert ? 1 : 0);
}

/**
 * The first calendar week whose booked emails would exceed the weekly limit,
 * or null when every week fits. A country alert subscription reserves the
 * shared digest slot in every week, since new hackathons can land any week.
 */
export function findWeekOverEmailLimit(events: EmailEvent[], hasCountryAlert: boolean): Date | null {
  for (const [weekStart, budget] of bucketByWeek(events)) {
    const total = budget.immediateEmails + (budget.hasDigest || hasCountryAlert ? 1 : 0);

    if (total > WEEKLY_EMAIL_LIMIT) {
      return new Date(weekStart);
    }
  }

  return null;
}
