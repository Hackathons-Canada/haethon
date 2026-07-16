import { render } from "@react-email/render";

import {
  WeeklyDigestEmail,
  type WeeklyDigestCountryItem,
  type WeeklyDigestReminderItem,
} from "@/emails/weekly-digest-email";
import { formatReminderDate } from "@/lib/hackathons/reminder-labels";
import type { SelectableReminderType } from "@/lib/hackathons/reminder-plan";

const DAY_MS = 86_400_000;

/* Digest reminders are "week before" heads-ups: the moment they point at is a
   week after their scheduledFor. The digest states that date outright because
   a Monday send can be up to two weeks ahead of it. */
const digestAnchorOffsetsMs: Partial<Record<SelectableReminderType, number>> = {
  application_week_before: 7 * DAY_MS,
  hackathon_week_before: 7 * DAY_MS,
};

function digestHeadline(type: string, scheduledFor: Date) {
  const anchor = new Date(scheduledFor.getTime() + (digestAnchorOffsetsMs[type as SelectableReminderType] ?? 0));
  const dateLabel = formatReminderDate(anchor);

  return type === "application_week_before" ? `Applications open ${dateLabel}` : `Starts ${dateLabel}`;
}

export type WeeklyDigestReminderRow = {
  type: string;
  scheduledFor: Date;
  hackathonName: string;
  hackathonSlug: string;
};

export type BuildWeeklyDigestEmailInput = {
  firstName?: string | null;
  reminderRows: WeeklyDigestReminderRow[];
  country: string | null;
  countryItems: WeeklyDigestCountryItem[];
  appUrl: string;
  unsubscribeUrl: string;
};

function buildSubject({ reminderRows, country, countryItems }: BuildWeeklyDigestEmailInput) {
  if (reminderRows.length && countryItems.length) {
    return `Your week ahead · ${reminderRows.length + countryItems.length} updates`;
  }

  if (reminderRows.length) {
    return reminderRows.length === 1
      ? `Coming up · ${reminderRows[0].hackathonName}`
      : `Coming up · ${reminderRows.length} hackathon updates`;
  }

  return countryItems.length === 1
    ? `New hackathon in ${country}: ${countryItems[0].name}`
    : `${countryItems.length} new hackathons in ${country}`;
}

/**
 * Render the Monday digest — every week-before reminder landing in the coming
 * week plus new hackathons for the user's country alert — as one email.
 */
export async function buildWeeklyDigestEmail(input: BuildWeeklyDigestEmailInput) {
  const reminderItems: WeeklyDigestReminderItem[] = input.reminderRows.map((row) => ({
    hackathonName: row.hackathonName,
    headline: digestHeadline(row.type, row.scheduledFor),
    detailUrl: `${input.appUrl}/hackathons/${row.hackathonSlug}`,
  }));

  const element = (
    <WeeklyDigestEmail
      browseUrl={`${input.appUrl}/hackathons`}
      country={input.country}
      countryItems={input.countryItems}
      greetingName={input.firstName ?? "hacker"}
      pipelineUrl={`${input.appUrl}/my`}
      reminderItems={reminderItems}
      unsubscribeUrl={input.unsubscribeUrl}
    />
  );

  const [html, text] = await Promise.all([render(element), render(element, { plainText: true })]);

  return {
    subject: buildSubject(input),
    html,
    text,
  };
}
