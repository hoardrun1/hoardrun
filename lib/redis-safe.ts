import Redis from 'ioredis';

let redis: Redis | null = null;

export function getRedis(): Redis | null {
  // Don't initialize Redis during build time
  if (process.env.NODE_ENV === 'production' && !process.env.REDIS_URL) {
    console.log('Redis not available during build');
    return null;
  }
  
  // Skip Redis in build environment
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('Skipping Redis during build phase');
    return null;
  }
  
  if (!redis) {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        connectTimeout: 10000,
        commandTimeout: 5000,
        enableOfflineQueue: false,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });
      
      redis.on('error', (err) => {
        console.error('Redis connection error:', err.message);
        // Don't throw, just log
      });
      
      redis.on('connect', () => {
        console.log('Redis connected successfully');
      });
      
    } catch (error) {
      console.error('Failed to create Redis instance:', error);
      return null;
    }
  }
  
  return redis;
}

// Helper function for safe Redis operations
export async function safeRedisOperation<T>(
  operation: (redis: Redis) => Promise<T>
): Promise<T | null> {
  const redisClient = getRedis();
  if (!redisClient) {
    console.log('Redis not available, skipping operation');
    return null;
  }
  
  try {
    return await operation(redisClient);
  } catch (error) {
    console.error('Redis operation failed:', error);
    return null;
  }
}

// Safe cache operations
export const safeCache = {
  async get(key: string): Promise<string | null> {
    return safeRedisOperation(async (redis) => {
      return await redis.get(key);
    });
  },
  
  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    const result = await safeRedisOperation(async (redis) => {
      if (ttl) {
        return await redis.setex(key, ttl, value);
      } else {
        return await redis.set(key, value);
      }
    });
    return result === 'OK';
  },
  
  async del(key: string): Promise<boolean> {
    const result = await safeRedisOperation(async (redis) => {
      return await redis.del(key);
    });
    return (result || 0) > 0;
  },
  
  async exists(key: string): Promise<boolean> {
    const result = await safeRedisOperation(async (redis) => {
      return await redis.exists(key);
    });
    return (result || 0) > 0;
  }
};

// Graceful shutdown
export async function closeRedis(): Promise<void> {
  if (redis) {
    try {
      await redis.quit();
      redis = null;
      console.log('Redis connection closed');
    } catch (error) {
      console.error('Error closing Redis connection:', error);
    }
  }
}
