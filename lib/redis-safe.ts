// Mock Redis implementation since backend handles caching
// This provides the same interface but uses in-memory storage for frontend compatibility

interface MockRedis {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<string>;
  setex(key: string, ttl: number, value: string): Promise<string>;
  del(...keys: string[]): Promise<number>;
  exists(key: string): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  incrby(key: string, amount: number): Promise<number>;
  decrby(key: string, amount: number): Promise<number>;
  hmset(key: string, data: Record<string, any>): Promise<string>;
  hgetall(key: string): Promise<Record<string, string>>;
  flushall(): Promise<string>;
  quit(): Promise<string>;
  on(event: string, callback: Function): void;
}

// In-memory storage for mock implementation
const mockStorage = new Map<string, { value: string; expiry?: number }>();
const mockCounters = new Map<string, number>();

class MockRedisClient implements MockRedis {
  private eventHandlers = new Map<string, Function[]>();

  async get(key: string): Promise<string | null> {
    const item = mockStorage.get(key);
    if (!item) return null;
    
    // Check expiry
    if (item.expiry && Date.now() > item.expiry) {
      mockStorage.delete(key);
      return null;
    }
    
    return item.value;
  }

  async set(key: string, value: string): Promise<string> {
    mockStorage.set(key, { value });
    return 'OK';
  }

  async setex(key: string, ttl: number, value: string): Promise<string> {
    const expiry = Date.now() + (ttl * 1000);
    mockStorage.set(key, { value, expiry });
    return 'OK';
  }

  async del(...keys: string[]): Promise<number> {
    let deletedCount = 0;
    for (const key of keys) {
      const existed = mockStorage.has(key);
      if (existed) {
        mockStorage.delete(key);
        mockCounters.delete(key);
        deletedCount++;
      }
    }
    return deletedCount;
  }

  async exists(key: string): Promise<number> {
    const item = mockStorage.get(key);
    if (!item) return 0;
    
    // Check expiry
    if (item.expiry && Date.now() > item.expiry) {
      mockStorage.delete(key);
      return 0;
    }
    
    return 1;
  }

  async keys(pattern: string): Promise<string[]> {
    // Simple pattern matching for mock implementation
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Array.from(mockStorage.keys()).filter(key => regex.test(key));
  }

  async incrby(key: string, amount: number): Promise<number> {
    const current = mockCounters.get(key) || 0;
    const newValue = current + amount;
    mockCounters.set(key, newValue);
    return newValue;
  }

  async decrby(key: string, amount: number): Promise<number> {
    const current = mockCounters.get(key) || 0;
    const newValue = current - amount;
    mockCounters.set(key, newValue);
    return newValue;
  }

  async hmset(key: string, data: Record<string, any>): Promise<string> {
    mockStorage.set(key, { value: JSON.stringify(data) });
    return 'OK';
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    const item = mockStorage.get(key);
    if (!item) return {};
    
    try {
      return JSON.parse(item.value);
    } catch {
      return {};
    }
  }

  async flushall(): Promise<string> {
    mockStorage.clear();
    mockCounters.clear();
    return 'OK';
  }

  async quit(): Promise<string> {
    mockStorage.clear();
    mockCounters.clear();
    return 'OK';
  }

  on(event: string, callback: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(callback);
    
    // Simulate connection event
    if (event === 'connect') {
      setTimeout(() => callback(), 100);
    }
  }
}

let redis: MockRedisClient | null = null;

export function getRedis(): MockRedisClient | null {
  // Always return null during build to prevent any issues
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('Skipping Redis during build phase');
    return null;
  }
  
  if (!redis) {
    try {
      redis = new MockRedisClient();
      console.log('Mock Redis client initialized (backend handles actual caching)');
    } catch (error) {
      console.error('Failed to create mock Redis instance:', error);
      return null;
    }
  }
  
  return redis;
}

// Helper function for safe Redis operations
export async function safeRedisOperation<T>(
  operation: (redis: MockRedisClient) => Promise<T>
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
      console.log('Mock Redis connection closed');
    } catch (error) {
      console.error('Error closing mock Redis connection:', error);
    }
  }
}
