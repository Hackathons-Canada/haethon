import { NextResponse } from "next/server";

import { getLiveFaceoffRatings } from "@/lib/hackathons/faceoff-service";

export async function GET() {
  const rows = await getLiveFaceoffRatings();

  return NextResponse.json(
    {
      data: rows,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
