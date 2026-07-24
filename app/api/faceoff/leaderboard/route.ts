import { NextResponse } from "next/server";

import { FACEOFF_CACHE_SECONDS, getLiveFaceoffRatings } from "@/lib/hackathons/faceoff-service";

export async function GET() {
  const rows = await getLiveFaceoffRatings();

  return NextResponse.json(
    {
      data: rows,
    },
    {
      headers: {
        "Cache-Control": `public, s-maxage=${FACEOFF_CACHE_SECONDS}, stale-while-revalidate=${FACEOFF_CACHE_SECONDS * 5}`,
      },
    }
  );
}
