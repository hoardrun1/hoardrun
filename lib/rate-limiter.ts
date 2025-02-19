import { Request, Response, NextFunction } from 'express'
import { cache } from './cache'

interface RateLimitOptions {
  windowMs: number
  max: number
  message?: string
  statusCode?: number
  keyGenerator?: (req: Request) => string
  skip?: (req: Request) => boolean
}

const defaultOptions: RateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
  statusCode: 429,
  keyGenerator: (req: Request) => `rate-limit:${req.ip}`,
  skip: () => false,
}

export class RateLimiter {
  private static attempts: Map<string, number> = new Map()
  private static lockouts: Map<string, Date> = new Map()

  static async checkLimit(key: string, maxAttempts = 5): boolean {
    const attempts = this.attempts.get(key) || 0
    const lockoutUntil = this.lockouts.get(key)

    if (lockoutUntil && lockoutUntil > new Date()) {
      return false
    }

    if (attempts >= maxAttempts) {
      const lockoutUntil = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      this.lockouts.set(key, lockoutUntil)
      return false
    }

    this.attempts.set(key, attempts + 1)
    return true
  }

  static resetLimit(key: string): void {
    this.attempts.delete(key)
    this.lockouts.delete(key)
  }

  static isLocked(key: string): boolean {
    const lockoutUntil = this.lockouts.get(key)
    return !!lockoutUntil && lockoutUntil > new Date()
  }

  static getLockoutTime(key: string): Date | null {
    return this.lockouts.get(key) || null
  }
}

export const rateLimit = (options: Partial<RateLimitOptions> = {}) => {
  const opts: RateLimitOptions = { ...defaultOptions, ...options }

  return async (req: Request, res: Response, next: NextFunction) => {
    if (opts.skip!(req)) {
      return next()
    }

    const key = opts.keyGenerator!(req)

    try {
      const current = await cache.increment(key)
      
      // Set expiry on first request
      if (current === 1) {
        await cache.client.pexpire(key, opts.windowMs)
      }

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', opts.max)
      res.setHeader('X-RateLimit-Remaining', Math.max(0, opts.max - current))

      if (current > opts.max) {
        const resetTime = await cache.client.pttl(key)
        res.setHeader('X-RateLimit-Reset', new Date(Date.now() + resetTime).toISOString())
        
        return res.status(opts.statusCode!).json({
          message: opts.message,
          retryAfter: Math.ceil(resetTime / 1000),
        })
      }

      next()
    } catch (error) {
      console.error('Rate limit error:', error)
      next()
    }
  }
}

// Specialized rate limiters
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  keyGenerator: (req: Request) => `auth-rate-limit:${req.ip}:${req.body.email}`,
})

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per minute
  message: 'Too many API requests, please try again later.',
})

export const sensitiveRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 requests per hour
  message: 'Too many sensitive operations, please try again later.',
  keyGenerator: (req: Request) => `sensitive-rate-limit:${req.ip}:${req.user?.id}`,
})

// Export default rate limiter instance
export default rateLimit 