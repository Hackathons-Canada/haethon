export type ReminderType =
  | "application_open"
  | "application_close"
  | "acceptance_date"
  | "hackathon_start"
  | "hackathon_week_before"
  | "hackathon_day_before"
  | "check_in"
  | "submission_deadline"
  | "follow_up"
  | "add_to_profile"
  | "attendance_check";

export const selectableReminderTypes = [
  "application_open",
  "hackathon_week_before",
  "hackathon_day_before",
] as const satisfies readonly ReminderType[];

export type SelectableReminderType = (typeof selectableReminderTypes)[number];

export type SelectableReminderPlanEntry = {
  type: SelectableReminderType;
  scheduledFor: Date;
};

export type HackathonDatesInput = {
  startsAt: Date | null;
  endsAt: Date | null;
  applicationOpensAt: Date | null;
  applicationClosesAt: Date | null;
  acceptanceAt: Date | null;
};

const DAY_MS = 86_400_000;

function daysBefore(date: Date, days: number) {
  return new Date(date.getTime() - days * DAY_MS);
}

export function computeSelectableReminderPlan(
  dates: HackathonDatesInput | null,
  now = new Date()
): SelectableReminderPlanEntry[] {
  if (!dates) {
    return [];
  }

  const plan: SelectableReminderPlanEntry[] = [];
  const push = (type: SelectableReminderType, scheduledFor: Date | null) => {
    if (scheduledFor && scheduledFor > now) {
      plan.push({ type, scheduledFor });
    }
  };

  push("application_open", dates.applicationOpensAt);

  if (dates.startsAt) {
    push("hackathon_week_before", daysBefore(dates.startsAt, 7));
    push("hackathon_day_before", daysBefore(dates.startsAt, 1));
  }

  return plan;
}
