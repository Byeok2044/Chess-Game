interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

class TTLCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private inFlight = new Map<string, Promise<unknown>>();

  get<T>(key: string, ttlMs: number): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() - entry.timestamp > ttlMs) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T) {
    this.store.set(key, { value, timestamp: Date.now() });
  }

  invalidate(key: string) {
    this.store.delete(key);
  }

  invalidatePrefix(prefix: string) {
    for (const k of this.store.keys()) {
      if (k.startsWith(prefix)) this.store.delete(k);
    }
  }

  clear() {
    this.store.clear();
  }
}

export const appCache = new TTLCache();

export async function getOrFetch<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = appCache.get<T>(key, ttlMs);
  if (cached !== undefined) return cached;

  const existing = appCache['inFlight'].get(key) as Promise<T> | undefined;
  if (existing) return existing;

  const promise = fetcher()
    .then((value) => {
      appCache.set(key, value);
      appCache['inFlight'].delete(key);
      return value;
    })
    .catch((err) => {
      appCache['inFlight'].delete(key);
      throw err;
    });

  appCache['inFlight'].set(key, promise);
  return promise;
}