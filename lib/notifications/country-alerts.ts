import { and, asc, eq, gt, inArray, isNull } from "drizzle-orm";

import type { WeeklyDigestCountryItem } from "@/emails/weekly-digest-email";
import { db } from "@/lib/db";
import { countryAlertSubscriptions, hackathonDates, hackathonLocations, hackathons, users } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { formatDateRange, formatLocationParts } from "@/lib/hackathons/card-format";

/* Country alerts are weekly-only: their content rides the Monday digest email
   alongside week-before reminders, so this module just assembles what each
   subscriber should see — the digest cron owns sending and watermarks. */

export type CountryAlertDelivery = {
  subscriptionId: string;
  userId: string;
  email: string;
  firstName: string | null;
  country: string;
  lastNotifiedAt: Date;
  /* Advancing to the newest included publish (not `now`) means anything
     published while the dispatch runs is still caught by the next one. */
  nextWatermark: Date;
  items: WeeklyDigestCountryItem[];
};

/**
 * One delivery per subscriber with hackathons published in their country since
 * their watermark. Past or archived entries (bulk imports include them) never
 * alert anyone, and unsubscribed users are skipped entirely.
 */
export async function getDueCountryAlertDeliveries(): Promise<CountryAlertDelivery[]> {
  const subscriptions = await db
    .select({
      id: countryAlertSubscriptions.id,
      country: countryAlertSubscriptions.country,
      lastNotifiedAt: countryAlertSubscriptions.lastNotifiedAt,
      userId: users.id,
      email: users.email,
      firstName: users.firstName,
    })
    .from(countryAlertSubscriptions)
    .innerJoin(users, eq(users.id, countryAlertSubscriptions.userId))
    .where(isNull(users.emailUnsubscribedAt));

  if (!subscriptions.length) {
    return [];
  }

  const countries = [...new Set(subscriptions.map((subscription) => subscription.country))];
  const oldestWatermark = new Date(
    Math.min(...subscriptions.map((subscription) => subscription.lastNotifiedAt.getTime()))
  );

  // One query covers every subscriber; each one is then narrowed to their own
  // watermark in memory.
  const published = await db
    .select({
      name: hackathons.name,
      slug: hackathons.slug,
      format: hackathons.format,
      venue: hackathons.venue,
      publishedAt: hackathons.publishedAt,
      city: hackathonLocations.city,
      region: hackathonLocations.region,
      country: hackathonLocations.country,
      startsAt: hackathonDates.startsAt,
      endsAt: hackathonDates.endsAt,
    })
    .from(hackathons)
    .innerJoin(hackathonLocations, eq(hackathonLocations.hackathonId, hackathons.id))
    .leftJoin(hackathonDates, eq(hackathonDates.hackathonId, hackathons.id))
    .where(
      and(
        inArray(hackathonLocations.country, countries),
        gt(hackathons.publishedAt, oldestWatermark),
        inArray(hackathons.status, ["upcoming", "live"])
      )
    )
    .orderBy(asc(hackathons.publishedAt));

  const byCountry = new Map<string, typeof published>();
  for (const hackathon of published) {
    const list = byCountry.get(hackathon.country) ?? [];
    list.push(hackathon);
    byCountry.set(hackathon.country, list);
  }

  return subscriptions.flatMap((subscription) => {
    const fresh = (byCountry.get(subscription.country) ?? []).filter(
      (hackathon) => hackathon.publishedAt && hackathon.publishedAt > subscription.lastNotifiedAt
    );

    if (!fresh.length) {
      return [];
    }

    return [
      {
        subscriptionId: subscription.id,
        userId: subscription.userId,
        email: subscription.email,
        firstName: subscription.firstName,
        country: subscription.country,
        lastNotifiedAt: subscription.lastNotifiedAt,
        nextWatermark: new Date(Math.max(...fresh.map((hackathon) => hackathon.publishedAt!.getTime()))),
        items: fresh.map((hackathon) => ({
          name: hackathon.name,
          location: formatLocationParts(hackathon).locality ?? "Location TBA",
          dateRange: formatDateRange(hackathon.startsAt, hackathon.endsAt),
          detailUrl: `${env.NEXT_PUBLIC_APP_URL}/hackathons/${hackathon.slug}`,
        })),
      },
    ];
  });
}

/** Only delivered subscribers advance; the rest retry on the next digest. */
export async function advanceCountryAlertWatermarks(deliveries: CountryAlertDelivery[], now: Date) {
  await Promise.all(
    deliveries.map((delivery) =>
      db
        .update(countryAlertSubscriptions)
        .set({ lastNotifiedAt: delivery.nextWatermark, updatedAt: now })
        .where(eq(countryAlertSubscriptions.id, delivery.subscriptionId))
    )
  );
}
