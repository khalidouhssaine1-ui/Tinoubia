import "server-only";

/**
 * Best-effort in-memory rate limiter for the enquiry endpoint. Serverless
 * instances are ephemeral and multi-region, so this does not guarantee a
 * global cap — it just absorbs casual form-spam bursts hitting one warm
 * instance. Swap for Upstash/Redis if a hard global limit becomes necessary.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  bucket.count += 1;
  if (bucket.count > MAX_REQUESTS) {
    return true;
  }
  return false;
}

// Periodically drop stale buckets so the map doesn't grow unbounded.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}, WINDOW_MS).unref?.();
