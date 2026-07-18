import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { hackathons } from "@/lib/db/schema";
import { fetchSafeRemoteImage } from "@/lib/security/remote-image";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const MAX_LOGO_BYTES = 4 * 1024 * 1024;
export const runtime = "nodejs";

/* Same-origin proxy for hackathon logos. Most logo hosts (e.g. the Devpost
   CDN) don't send CORS headers, which taints the canvas the card uses to
   sample the logo's dominant color. Serving the bytes from our own origin
   keeps the canvas readable, and the long cache header means each logo is
   fetched upstream at most once per client per day. */
export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const [hackathon] = await db
    .select({ imageUrl: hackathons.imageUrl })
    .from(hackathons)
    .where(eq(hackathons.id, id))
    .limit(1);

  if (!hackathon?.imageUrl) {
    return NextResponse.json({ error: "Logo not found." }, { status: 404 });
  }

  try {
    const image = await fetchSafeRemoteImage(hackathon.imageUrl, MAX_LOGO_BYTES);

    return new NextResponse(image.bytes, {
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
        "Content-Length": String(image.bytes.byteLength),
        "Content-Security-Policy": "default-src 'none'; sandbox",
        "Content-Type": image.contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Logo unavailable." }, { status: 502 });
  }
}
