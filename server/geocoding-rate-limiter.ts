/**
 * Rate limiter for geocoding API calls
 * Prevents excessive API calls to Nominatim
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class GeocodingRateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private readonly MAX_REQUESTS_PER_MINUTE = 1; // Nominatim allows 1 request per second, we use 1 per minute to be safe
  private readonly WINDOW_MS = 60 * 1000; // 1 minute

  canMakeRequest(identifier: string = "default"): boolean {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    if (!entry || now > entry.resetTime) {
      // Reset or create new entry
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.WINDOW_MS,
      });
      return true;
    }

    if (entry.count >= this.MAX_REQUESTS_PER_MINUTE) {
      return false;
    }

    entry.count++;
    return true;
  }

  getRemainingTime(identifier: string = "default"): number {
    const entry = this.requests.get(identifier);
    if (!entry) {
      return 0;
    }

    const now = Date.now();
    if (now > entry.resetTime) {
      return 0;
    }

    return entry.resetTime - now;
  }

  reset(identifier?: string): void {
    if (identifier) {
      this.requests.delete(identifier);
    } else {
      this.requests.clear();
    }
  }
}

export const geocodingRateLimiter = new GeocodingRateLimiter();

