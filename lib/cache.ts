import { safeCache, getRedis } from './redis-safe'

class Cache {
  async get(key: string): Promise<string | null> {
    try {
      return await safeCache.get(key)
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  async set(key: string, value: string, expirySeconds?: number): Promise<void> {
    try {
      await safeCache.set(key, value, expirySeconds)
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  async del(key: string): Promise<void> {
    try {
      await safeCache.del(key)
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const redis = getRedis()
      if (!redis) {
        console.log('Redis not available for pattern deletion')
        return
      }
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error)
    }
  }

  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    expirySeconds?: number
  ): Promise<T> {
    try {
      const cached = await this.get(key)
      if (cached) {
        return JSON.parse(cached)
      }

      const data = await fetchFn()
      await this.set(key, JSON.stringify(data), expirySeconds)
      return data
    } catch (error) {
      console.error('Cache getOrSet error:', error)
      return await fetchFn()
    }
  }

  async increment(key: string, amount = 1): Promise<number> {
    try {
      const redis = getRedis()
      if (!redis) return 0
      return await redis.incrby(key, amount)
    } catch (error) {
      console.error('Cache increment error:', error)
      return 0
    }
  }

  async decrement(key: string, amount = 1): Promise<number> {
    try {
      const redis = getRedis()
      if (!redis) return 0
      return await redis.decrby(key, amount)
    } catch (error) {
      console.error('Cache decrement error:', error)
      return 0
    }
  }

  async setHash(key: string, data: Record<string, any>): Promise<void> {
    try {
      const redis = getRedis()
      if (!redis) return
      await redis.hmset(key, data)
    } catch (error) {
      console.error('Cache setHash error:', error)
    }
  }

  async getHash(key: string): Promise<Record<string, string>> {
    try {
      const redis = getRedis()
      if (!redis) return {}
      return await redis.hgetall(key)
    } catch (error) {
      console.error('Cache getHash error:', error)
      return {}
    }
  }

  async clearAll(): Promise<void> {
    try {
      const redis = getRedis()
      if (!redis) return
      await redis.flushall()
    } catch (error) {
      console.error('Cache clearAll error:', error)
    }
  }
}

export const cache = new Cache()

// For testing and development
if (process.env.NODE_ENV === 'development') {
  (globalThis as any).cache = cache
}

export default cache 