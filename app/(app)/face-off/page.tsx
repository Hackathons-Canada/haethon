import type { Metadata } from "next";

import { FaceoffArena } from "@/components/faceoff-arena";
import { getPublicHackathonCatalogSnapshot } from "@/lib/hackathons/catalog";

export const metadata: Metadata = {
  title: "Face Off | Hackathons North America",
  description: "Vote head-to-head on which hackathon should rank higher and watch the Elo leaderboard shift live.",
};

export default async function FaceOffPage() {
  const { cards } = await getPublicHackathonCatalogSnapshot();

  const pool = cards.map((card) => ({
    id: card.id,
    name: card.name,
    slug: card.slug,
    image: card.image,
    eloRating: card.eloRating,
    faceoffWins: card.faceoffWins,
    faceoffLosses: card.faceoffLosses,
    location: card.location,
    date: card.date,
    country: card.country,
  }));

  return (
    <main className="min-h-screen px-5 pb-20 pt-14 text-navy dark:text-wheat sm:px-8 sm:pt-16 lg:px-12">
      <FaceoffArena pool={pool} />
    </main>
  );
}
