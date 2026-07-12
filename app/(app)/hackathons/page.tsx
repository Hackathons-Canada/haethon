import type { Metadata } from "next";

import { HackathonSearch } from "@/components/hackathon-search";
import { getCurrentUserRecord } from "@/lib/auth";
import { CATALOG_PAGE_SIZE, applyUserCardState, getPublicHackathonCatalog } from "@/lib/hackathons/catalog";
import { dateRangeForPeriod, normalizeSearchFilters } from "@/lib/hackathons/search-filters";

export const metadata: Metadata = {
  title: "Hackathons | Hackathons North America",
  description: "Browse upcoming hackathons across North America.",
};

export default async function HackathonsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = normalizeSearchFilters((await searchParams) ?? {});
  const dateRange = dateRangeForPeriod(filters.datePeriod);

  // The public catalog page comes out of the shared cross-request cache; only
  // the signed-in user's saved/vote overlay is computed per request.
  const [{ cards, hasMore }, user] = await Promise.all([
    getPublicHackathonCatalog({
      name: filters.name,
      countries: filters.countries,
      format: filters.format === "any" ? null : filters.format,
      beginnerFriendly: filters.beginnerFriendly === "any" ? null : filters.beginnerFriendly === "on",
      travelReimbursement: filters.travelReimbursement === "any" ? null : filters.travelReimbursement === "on",
      startsAfter: dateRange?.startsAfter ?? null,
      startsBefore: dateRange?.startsBefore ?? null,
      limit: CATALOG_PAGE_SIZE,
      offset: 0,
    }),
    getCurrentUserRecord(),
  ]);

  const hackathonCards = await applyUserCardState(cards, user?.id);

  return (
    <main className="min-h-screen text-navy dark:text-wheat">
      <HackathonSearch initialFilters={filters} initialHackathons={hackathonCards} initialHasMore={hasMore} />
    </main>
  );
}
