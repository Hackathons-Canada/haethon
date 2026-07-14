export const reminderTypeLabels: Record<string, string> = {
  application_open: "Applications open",
  application_week_before: "1 week before applications open",
  application_day_before: "1 day before applications open",
  application_close: "Applications close",
  acceptance_date: "Acceptance decisions",
  hackathon_start: "Hackathon starts",
  hackathon_week_before: "1 week before the hackathon",
  hackathon_day_before: "1 day before the hackathon",
  check_in: "Check in",
  submission_deadline: "Submission deadline",
  follow_up: "Follow up",
  add_to_profile: "Add to profile",
  attendance_check: "Attendance check",
};

export function formatReminderDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
