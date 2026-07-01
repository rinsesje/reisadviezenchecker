'use strict';

// Small in-memory TTL cache. Keeps repeated lookups fast and avoids
// hammering the government sources on every click.
class TtlCache {
  constructor(ttlMs) {
    this.ttlMs = ttlMs;
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key, value) {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  // Returns the cached value if present, otherwise calls fn(), caches the
  // result and returns it. Rejected promises are not cached, so a failed
  // fetch will be retried on the next request.
  async getOrSet(key, fn) {
    const cached = this.get(key);
    if (cached !== undefined) return cached;
    const value = await fn();
    this.set(key, value);
    return value;
  }
}

module.exports = { TtlCache };
