export type ApplicationStatus = "interested" | "applied" | "accepted" | "attending" | "attended" | "won";

export type ReminderType =
  | "application_open"
  | "application_close"
  | "acceptance_date"
  | "hackathon_start"
  | "check_in"
  | "submission_deadline"
  | "follow_up"
  | "add_to_profile"
  | "attendance_check";

export type ReminderPlanEntry = {
  type: ReminderType;
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

function daysAfter(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_MS);
}

/**
 * The reminders a hacker should get for a hackathon, derived from where they
 * are in the pipeline. Users manage status, never individual reminders.
 * Only future-dated entries are returned.
 */
export function computeReminderPlan(
  status: ApplicationStatus,
  dates: HackathonDatesInput | null,
  now = new Date()
): ReminderPlanEntry[] {
  if (!dates) {
    return [];
  }

  const plan: ReminderPlanEntry[] = [];
  const push = (type: ReminderType, scheduledFor: Date | null) => {
    if (scheduledFor && scheduledFor > now) {
      plan.push({ type, scheduledFor });
    }
  };

  switch (status) {
    case "interested":
      push("application_open", dates.applicationOpensAt);
      if (dates.applicationClosesAt) {
        const headsUp = daysBefore(dates.applicationClosesAt, 2);
        push("application_close", headsUp > now ? headsUp : dates.applicationClosesAt);
      }
      break;
    case "applied":
      push("acceptance_date", dates.acceptanceAt);
      if (dates.startsAt) {
        push("hackathon_start", daysBefore(dates.startsAt, 7));
      }
      break;
    case "accepted":
    case "attending":
      if (dates.startsAt) {
        push("hackathon_start", daysBefore(dates.startsAt, 3));
        push("check_in", dates.startsAt);
      }
      if (status === "attending") {
        push("attendance_check", dates.endsAt);
      }
      break;
    case "attended":
    case "won":
      if (dates.endsAt) {
        push("add_to_profile", daysAfter(dates.endsAt, 1));
      }
      break;
  }

  return plan;
}
