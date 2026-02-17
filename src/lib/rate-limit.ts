type RateLimitContext = {
  count: number;
  startTime: number;
};

const ipMap = new Map<string, RateLimitContext>();

interface RateLimitOptions {
  interval: number; // in milliseconds
  uniqueTokenPerInterval: number; // Max unique IPs to track (to prevent memory leaks)
}

export class RateLimit {
  private interval: number;
  private uniqueTokenPerInterval: number;

  constructor(options: RateLimitOptions) {
    this.interval = options.interval;
    this.uniqueTokenPerInterval = options.uniqueTokenPerInterval;
  }

  check(limit: number, token: string): Promise<boolean> {
    return new Promise((resolve) => {
      const now = Date.now();
      const record = ipMap.get(token);

      if (!record) {
        if (ipMap.size >= this.uniqueTokenPerInterval) {
          // Simple cleanup strategy: clear old entries or just clear all
          // For simplicity in this POC, we'll clear all if limit reached to avoid OOM
          // meaningful only if we have high traffic
          ipMap.clear();
        }
        ipMap.set(token, { count: 1, startTime: now });
        resolve(true);
        return;
      }

      const windowStart = now - this.interval;

      if (record.startTime < windowStart) {
        // Reset window
        record.count = 1;
        record.startTime = now;
        resolve(true);
      } else {
        if (record.count >= limit) {
          resolve(false);
        } else {
          record.count++;
          resolve(true);
        }
      }
    });
  }
}

export const rateLimiter = new RateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});
