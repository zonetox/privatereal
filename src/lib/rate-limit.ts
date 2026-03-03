// Basic in-memory rate limiting (Note: resets on server restart/hot-reload)
// For a production-grade distributed app, Redis or a DB table would be used.
const ipCache = new Map<string, { count: number; lastReset: number }>();

const LIMIT = 5; // 5 submissions
const WINDOW = 60 * 60 * 1000; // per hour

export function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = ipCache.get(ip);

    if (!entry || (now - entry.lastReset > WINDOW)) {
        ipCache.set(ip, { count: 1, lastReset: now });
        return true;
    }

    if (entry.count >= LIMIT) {
        return false;
    }

    entry.count += 1;
    return true;
}
