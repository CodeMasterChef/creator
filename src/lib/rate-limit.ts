/**
 * Simple in-memory rate limiting
 * For production with multiple instances, consider using @upstash/ratelimit with Vercel KV
 */

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

const store: RateLimitStore = {};

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach(key => {
        if (store[key].resetTime < now) {
            delete store[key];
        }
    });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
    interval: number; // milliseconds
    limit: number; // max requests per interval
}

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function rateLimit(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    const now = Date.now();
    const key = identifier;

    // Initialize or reset if expired
    if (!store[key] || store[key].resetTime < now) {
        store[key] = {
            count: 0,
            resetTime: now + config.interval
        };
    }

    // Increment count
    store[key].count++;

    const remaining = Math.max(0, config.limit - store[key].count);
    const success = store[key].count <= config.limit;

    return {
        success,
        limit: config.limit,
        remaining,
        reset: store[key].resetTime
    };
}

/**
 * Get client IP from request headers
 */
export function getClientIp(request: Request): string {
    // Try various headers in order of preference
    const headers = request.headers;
    
    return (
        headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        headers.get('x-real-ip') ||
        headers.get('cf-connecting-ip') || // Cloudflare
        'unknown'
    );
}

// Predefined rate limit configs
export const RATE_LIMITS = {
    // Strict limits for sensitive operations
    LOGIN: { interval: 15 * 60 * 1000, limit: 5 }, // 5 attempts per 15 minutes
    GENERATE: { interval: 60 * 60 * 1000, limit: 10 }, // 10 generations per hour
    
    // Moderate limits for API endpoints
    API_WRITE: { interval: 60 * 1000, limit: 30 }, // 30 requests per minute
    API_READ: { interval: 60 * 1000, limit: 100 }, // 100 requests per minute
};


