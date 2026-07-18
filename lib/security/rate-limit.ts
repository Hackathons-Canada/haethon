import { lt, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { rateLimitBuckets } from "@/lib/db/schema";

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

/**
 * A fixed-window limiter backed by Postgres. The upsert is atomic, so limits
 * remain effective across serverless instances and concurrent requests.
 */
export async function consumeRateLimit({ key, limit, windowMs }: RateLimitOptions) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowMs);

  const [bucket] = await db
    .insert(rateLimitBuckets)
    .values({ key, count: 1, windowStartedAt: now, expiresAt })
    .onConflictDoUpdate({
      target: rateLimitBuckets.key,
      set: {
        count: sql`case when ${rateLimitBuckets.expiresAt} <= ${now} then 1 else ${rateLimitBuckets.count} + 1 end`,
        windowStartedAt: sql`case when ${rateLimitBuckets.expiresAt} <= ${now} then ${now} else ${rateLimitBuckets.windowStartedAt} end`,
        expiresAt: sql`case when ${rateLimitBuckets.expiresAt} <= ${now} then ${expiresAt} else ${rateLimitBuckets.expiresAt} end`,
      },
    })
    .returning({ count: rateLimitBuckets.count, expiresAt: rateLimitBuckets.expiresAt });

  const retryAfterSeconds = Math.max(1, Math.ceil((bucket.expiresAt.getTime() - now.getTime()) / 1000));

  return {
    allowed: bucket.count <= limit,
    remaining: Math.max(0, limit - bucket.count),
    retryAfterSeconds,
  };
}

export async function cleanupExpiredRateLimits(now = new Date()) {
  const deleted = await db
    .delete(rateLimitBuckets)
    .where(lt(rateLimitBuckets.expiresAt, now))
    .returning({ key: rateLimitBuckets.key });

  return deleted.length;
}
