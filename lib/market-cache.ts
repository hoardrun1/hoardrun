import { cache } from './cache';

const CACHE_DURATIONS = {
  QUOTE: 60, // 1 minute for real-time quotes
  OVERVIEW: 86400, // 24 hours for company overview
  INTRADAY: 300 // 5 minutes for intraday data
};

export const marketCache = {
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    duration: number
  ): Promise<T> {
    const cached = await cache.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    const data = await fetchFn();
    await cache.set(key, JSON.stringify(data), duration);
    return data;
  }
};