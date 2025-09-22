import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis connection
// If Upstash env vars are not available, use in-memory fallback for development
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : undefined;

// Rate limiters for different endpoints
export const loginRateLimit = new Ratelimit({
  redis: redis!,
  limiter: Ratelimit.slidingWindow(10, "5 m"), // 10 attempts per 5 minutes
  analytics: true,
  prefix: "eventra:login",
});

export const registerRateLimit = new Ratelimit({
  redis: redis!,
  limiter: Ratelimit.slidingWindow(5, "10 m"), // 5 registrations per 10 minutes
  analytics: true,
  prefix: "eventra:register",
});

export const eventCreateRateLimit = new Ratelimit({
  redis: redis!,
  limiter: Ratelimit.slidingWindow(20, "1 h"), // 20 events per hour
  analytics: true,
  prefix: "eventra:event-create",
});

export const resetPasswordRateLimit = new Ratelimit({
  redis: redis!,
  limiter: Ratelimit.slidingWindow(3, "10 m"), // 3 reset attempts per 10 minutes
  analytics: true,
  prefix: "eventra:reset",
});

/**
 * Get client IP address from request headers
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const clientIP = forwarded ? forwarded.split(',')[0] : realIP;
  return clientIP || "anonymous";
}

/**
 * Apply rate limiting to an endpoint
 */
export async function applyRateLimit(
  ratelimit: Ratelimit,
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  if (!redis) {
    // In development without Redis, allow all requests
    console.warn("Rate limiting disabled: Redis not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for production.");
    return { success: true, limit: 999, remaining: 999, reset: Date.now() + 300000 };
  }

  const result = await ratelimit.limit(identifier);
  return result;
}