import { z } from "zod";
import { config } from "@/lib/config";

export const questionSchema = z
  .string()
  .trim()
  .min(config.limits.minQuestionLength, {
    message: "Please enter a more complete question.",
  })
  .max(config.limits.maxQuestionLength, {
    message: `Questions are limited to ${config.limits.maxQuestionLength} characters.`,
  });

export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(200),
});

// -------------------------------------------------------------------------
// Very small in-memory rate limiter. Suitable for a single-instance MVP.
// For multi-instance production, back this with Redis or Upstash.
// -------------------------------------------------------------------------
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfterMs: number } {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterMs: 0 };
  }
  if (bucket.count >= limit) {
    return { ok: false, retryAfterMs: bucket.resetAt - now };
  }
  bucket.count += 1;
  return { ok: true, retryAfterMs: 0 };
}
