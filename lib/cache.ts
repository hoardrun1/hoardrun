import Redis from 'ioredis'
import { promisify } from 'util'

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
})

redisClient.on('error', (error) => {
  console.error('Redis error:', error)
})

redisClient.on('connect', () => {
  console.log('Connected to Redis')
})

class Cache {
  private client: Redis

  constructor(client: Redis) {
    this.client = client
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key)
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  async set(key: string, value: string, expirySeconds?: number): Promise<void> {
    try {
      if (expirySeconds) {
        await this.client.setex(key, expirySeconds, value)
      } else {
        await this.client.set(key, value)
      }
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key)
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern)
      if (keys.length > 0) {
        await this.client.del(...keys)
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
      return await this.client.incrby(key, amount)
    } catch (error) {
      console.error('Cache increment error:', error)
      return 0
    }
  }

  async decrement(key: string, amount = 1): Promise<number> {
    try {
      return await this.client.decrby(key, amount)
    } catch (error) {
      console.error('Cache decrement error:', error)
      return 0
    }
  }

  async setHash(key: string, data: Record<string, any>): Promise<void> {
    try {
      await this.client.hmset(key, data)
    } catch (error) {
      console.error('Cache setHash error:', error)
    }
  }

  async getHash(key: string): Promise<Record<string, string>> {
    try {
      return await this.client.hgetall(key)
    } catch (error) {
      console.error('Cache getHash error:', error)
      return {}
    }
  }

  async clearAll(): Promise<void> {
    try {
      await this.client.flushall()
    } catch (error) {
      console.error('Cache clearAll error:', error)
    }
  }
}

export const cache = new Cache(redisClient)

// For testing and development
if (process.env.NODE_ENV === 'development') {
  globalThis.cache = cache
}

export default cache 