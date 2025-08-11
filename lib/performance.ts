import { cache } from './cache'
import { logger } from './logger'
// import { APIError } from '@/middleware/error-handler'
import { createHash } from 'crypto'
// import { gzip, ungzip } from 'node-gzip'
import { performance as perfHooks } from 'perf_hooks'

interface CacheConfig {
  ttl: number
  compress?: boolean
  staleWhileRevalidate?: boolean
  tags?: string[]
}

interface PerformanceMetrics {
  timestamp: number
  duration: number
  memory?: {
    heapUsed: number
    heapTotal: number
    external: number
  }
  cpu?: {
    user: number
    system: number
  }
  context: {
    operation: string
    userId?: string
    metadata?: Record<string, any>
  }
}

interface ResourceHints {
  preload?: string[]
  prefetch?: string[]
  preconnect?: string[]
  dnsPrefetch?: string[]
}

export class PerformanceService {
  private readonly DEFAULT_CACHE_TTL = 3600 // 1 hour
  private readonly DEFAULT_METRICS_RETENTION = 7 * 24 * 60 * 60 // 7 days
  private readonly COMPRESSION_THRESHOLD = 1024 // 1KB
  private readonly SLOW_THRESHOLD = 1000 // 1 second

  // Cache Management
  async cacheData<T>(
    key: string,
    data: T,
    config: Partial<CacheConfig> = {}
  ): Promise<void> {
    try {
      const finalConfig: CacheConfig = {
        ttl: config.ttl || this.DEFAULT_CACHE_TTL,
        compress: config.compress || false,
        staleWhileRevalidate: config.staleWhileRevalidate || false,
        tags: config.tags || [],
      }

      let serializedData = JSON.stringify(data)

      // Mock compression - just encode to base64
      if (finalConfig.compress && serializedData.length > this.COMPRESSION_THRESHOLD) {
        serializedData = Buffer.from(serializedData).toString('base64')
      }

      const cacheEntry = {
        data: serializedData,
        compressed: finalConfig.compress && serializedData.length > this.COMPRESSION_THRESHOLD,
        timestamp: Date.now(),
        tags: finalConfig.tags,
      }

      await cache.set(
        this.getCacheKey(key),
        JSON.stringify(cacheEntry),
        finalConfig.ttl
      )

      // Store cache tags for invalidation
      if (finalConfig.tags && finalConfig.tags.length > 0) {
        await this.storeCacheTags(key, finalConfig.tags)
      }
    } catch (error) {
      logger.error('Cache data error:', error)
      throw error
    }
  }

  async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const cacheKey = this.getCacheKey(key)
      const rawData = await cache.get(cacheKey)

      if (!rawData) return null

      const cacheEntry = JSON.parse(rawData)
      let data = cacheEntry.data

      // Mock decompression - just decode from base64
      if (cacheEntry.compressed) {
        data = Buffer.from(data, 'base64').toString()
      }

      return JSON.parse(data)
    } catch (error) {
      logger.error('Get cached data error:', error)
      return null
    }
  }

  async invalidateCache(key: string): Promise<void> {
    try {
      await cache.del(this.getCacheKey(key))
    } catch (error) {
      logger.error('Cache invalidation error:', error)
      throw error
    }
  }

  async invalidateCacheByTags(tags: string[]): Promise<void> {
    try {
      const keys = await this.getCacheKeysByTags(tags)
      await Promise.all(keys.map(key => this.invalidateCache(key)))
    } catch (error) {
      logger.error('Cache tag invalidation error:', error)
      throw error
    }
  }

  // Performance Monitoring
  async measurePerformance<T>(
    operation: string,
    fn: () => Promise<T>,
    context: { userId?: string; metadata?: Record<string, any> } = {}
  ): Promise<T> {
    const start = perfHooks.now()
    const startMemory = process.memoryUsage()
    const startCpu = process.cpuUsage()

    try {
      const result = await fn()
      
      const duration = perfHooks.now() - start
      const endMemory = process.memoryUsage()
      const endCpu = process.cpuUsage(startCpu)

      const metrics: PerformanceMetrics = {
        timestamp: Date.now(),
        duration,
        memory: {
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal,
          external: endMemory.external - startMemory.external,
        },
        cpu: {
          user: endCpu.user,
          system: endCpu.system,
        },
        context: {
          operation,
          userId: context.userId,
          metadata: context.metadata,
        },
      }

      await this.storeMetrics(metrics)

      // Log slow operations
      if (duration > this.SLOW_THRESHOLD) {
        logger.warn('Slow operation detected:', {
          operation,
          duration,
          context,
        })
      }

      return result
    } catch (error) {
      logger.error('Performance measurement error:', error)
      throw error
    }
  }

  async getPerformanceMetrics(
    filter: {
      operation?: string
      userId?: string
      startTime?: number
      endTime?: number
    } = {}
  ): Promise<PerformanceMetrics[]> {
    try {
      const key = 'performance-metrics'
      const data = await cache.get(key)
      let metrics: PerformanceMetrics[] = data ? JSON.parse(data) : []

      // Apply filters
      metrics = metrics.filter(metric => {
        if (filter.operation && metric.context.operation !== filter.operation) {
          return false
        }
        if (filter.userId && metric.context.userId !== filter.userId) {
          return false
        }
        if (filter.startTime && metric.timestamp < filter.startTime) {
          return false
        }
        if (filter.endTime && metric.timestamp > filter.endTime) {
          return false
        }
        return true
      })

      return metrics
    } catch (error) {
      logger.error('Get performance metrics error:', error)
      return []
    }
  }

  // Resource Optimization
  generateResourceHints(
    resources: {
      critical?: string[]
      prefetch?: string[]
      domains?: string[]
    }
  ): ResourceHints {
    const hints: ResourceHints = {}

    // Critical resources should be preloaded
    if (resources.critical?.length) {
      hints.preload = resources.critical.map(resource => {
        const type = this.getResourceType(resource)
        return `<${resource}>; rel=preload; as=${type}`
      })
    }

    // Non-critical resources can be prefetched
    if (resources.prefetch?.length) {
      hints.prefetch = resources.prefetch.map(resource => {
        return `<${resource}>; rel=prefetch`
      })
    }

    // External domains should use preconnect
    if (resources.domains?.length) {
      hints.preconnect = resources.domains.map(domain => {
        return `<${domain}>; rel=preconnect`
      })
      hints.dnsPrefetch = resources.domains.map(domain => {
        return `<${domain}>; rel=dns-prefetch`
      })
    }

    return hints
  }

  // Private Helper Methods
  private getCacheKey(key: string): string {
    return `cache:${createHash('md5').update(key).digest('hex')}`
  }

  private async storeCacheTags(key: string, tags: string[]): Promise<void> {
    try {
      const tagKey = `cache-tags:${key}`
      await cache.set(tagKey, JSON.stringify(tags))

      // Store reverse lookup
      await Promise.all(
        tags.map(async (tag) => {
          const taggedKeys = await this.getTaggedKeys(tag)
          if (!taggedKeys.includes(key)) {
            taggedKeys.push(key)
            await cache.set(`tag:${tag}`, JSON.stringify(taggedKeys))
          }
        })
      )
    } catch (error) {
      logger.error('Store cache tags error:', error)
    }
  }

  private async getTaggedKeys(tag: string): Promise<string[]> {
    try {
      const data = await cache.get(`tag:${tag}`)
      return data ? JSON.parse(data) : []
    } catch (error) {
      logger.error('Get tagged keys error:', error)
      return []
    }
  }

  private async getCacheKeysByTags(tags: string[]): Promise<string[]> {
    try {
      const keyArrays = await Promise.all(
        tags.map(tag => this.getTaggedKeys(tag))
      )
      return Array.from(new Set(keyArrays.flat()))
    } catch (error) {
      logger.error('Get cache keys by tags error:', error)
      return []
    }
  }

  private async storeMetrics(metrics: PerformanceMetrics): Promise<void> {
    try {
      const key = 'performance-metrics'
      const data = await cache.get(key)
      let allMetrics: PerformanceMetrics[] = data ? JSON.parse(data) : []

      // Add new metrics
      allMetrics.push(metrics)

      // Remove old metrics
      const cutoff = Date.now() - this.DEFAULT_METRICS_RETENTION * 1000
      allMetrics = allMetrics.filter(m => m.timestamp > cutoff)

      await cache.set(key, JSON.stringify(allMetrics))
    } catch (error) {
      logger.error('Store metrics error:', error)
    }
  }

  private getResourceType(resource: string): string {
    const extension = resource.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'css':
        return 'style'
      case 'js':
        return 'script'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return 'image'
      case 'woff':
      case 'woff2':
      case 'ttf':
      case 'otf':
        return 'font'
      default:
        return 'fetch'
    }
  }
}

// Export singleton instance
export const performance = new PerformanceService()
export default performance 