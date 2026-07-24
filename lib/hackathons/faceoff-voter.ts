import { createHash, randomUUID } from "node:crypto";

import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

const VOTER_COOKIE = "faceoff_voter_id";
const VOTER_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function anonymousFingerprint(anonymousId: string): string {
  const digest = createHash("sha256").update(anonymousId).digest("base64url");
  return `a:${digest}`;
}

export async function resolveFaceoffVoter(userId: string | null): Promise<{
  fingerprint: string;
  anonymousIdToSet?: string;
}> {
  if (userId) {
    return { fingerprint: `u:${userId}` };
  }

  const cookieStore = await cookies();
  const existing = cookieStore.get(VOTER_COOKIE)?.value;

  if (existing) {
    return { fingerprint: anonymousFingerprint(existing) };
  }

  const anonymousIdToSet = randomUUID();

  return {
    anonymousIdToSet,
    fingerprint: anonymousFingerprint(anonymousIdToSet),
  };
}

export function setFaceoffVoterCookie(response: NextResponse, anonymousId: string | undefined) {
  if (!anonymousId) {
    return;
  }

  response.cookies.set(VOTER_COOKIE, anonymousId, {
    httpOnly: true,
    maxAge: VOTER_COOKIE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
