// lib/security.ts - Minimal version without external dependencies
import { createHash, randomBytes, timingSafeEqual } from 'crypto'
import { prisma } from './prisma'
import { cache } from './cache'

// Simple device info interface
interface DeviceInfo {
  fingerprint: string
  userAgent: string
  timestamp: string
  components?: Record<string, any>
}

// Simplified suspicious activity detection
export async function detectSuspiciousActivity({
  user,
  deviceInfo,
  clientIp
}: {
  user: any
  deviceInfo: DeviceInfo
  clientIp: string
}): Promise<boolean> {
  try {
    // Get recent login attempts for this user
    const recentLogins = await prisma.loginAttempt.findMany({
      where: {
        userId: user.id,
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 10
    })

    // Check for multiple different IPs in short time
    const uniqueIPs = new Set(recentLogins.map(login => login.ipAddress))
    if (uniqueIPs.size > 3) {
      console.log('Suspicious: Multiple IPs detected for user', user.email)
      return true
    }

    // Check for rapid login attempts
    if (recentLogins.length >= 5) {
      const oldestRecentLogin = recentLogins[recentLogins.length - 1]
      const newestLogin = recentLogins[0]
      const timeDiff = newestLogin.createdAt.getTime() - oldestRecentLogin.createdAt.getTime()
      
      if (timeDiff < 10 * 60 * 1000) { // Less than 10 minutes for 5+ attempts
        console.log('Suspicious: Rapid login attempts detected for user', user.email)
        return true
      }
    }

    // Check for new device (not in known devices)
    const knownDevice = user.devices?.find((device: any) => 
      device.fingerprint === deviceInfo.fingerprint
    )
    
    if (!knownDevice && recentLogins.length > 0) {
      console.log('Suspicious: New device detected for user', user.email)
      return true
    }

    return false
  } catch (error) {
    console.error('Error detecting suspicious activity:', error)
    // Return false on error to not block legitimate users
    return false
  }
}

// Simple rate limiting helper
export class SimpleRateLimiter {
  private static instance: SimpleRateLimiter
  private attempts = new Map<string, { count: number; resetTime: number }>()

  static getInstance(): SimpleRateLimiter {
    if (!SimpleRateLimiter.instance) {
      SimpleRateLimiter.instance = new SimpleRateLimiter()
    }
    return SimpleRateLimiter.instance
  }

  checkLimit(key: string, maxAttempts: number, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now()
    const attempt = this.attempts.get(key)

    if (!attempt || now > attempt.resetTime) {
      // Reset or create new entry
      this.attempts.set(key, { count: 0, resetTime: now + windowMs })
      return true
    }

    return attempt.count < maxAttempts
  }

  async increment(key: string, windowMs: number = 15 * 60 * 1000): Promise<number> {
    const now = Date.now()
    const attempt = this.attempts.get(key)

    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs })
      return 1
    }

    attempt.count++
    return attempt.count
  }

  resetLimit(key: string): void {
    this.attempts.delete(key)
  }
}

// Export the rate limiter instance
export const RateLimiter = SimpleRateLimiter.getInstance()

// MFA helpers
export async function validateMFA(userId: string, code: string): Promise<boolean> {
  try {
    // Get the stored 2FA code from database
    const storedCode = await prisma.twoFactorCode.findFirst({
      where: {
        userId,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!storedCode) {
      return false
    }

    // Use timing-safe comparison
    const isValid = timingSafeEqual(
      Buffer.from(code),
      Buffer.from((storedCode as any).code || '')
    )

    if (isValid) {
      // Delete the used code
      await prisma.twoFactorCode.delete({
        where: { id: storedCode.id }
      })
    }

    return isValid
  } catch (error) {
    console.error('Error validating MFA:', error)
    return false
  }
}

export function generateTwoFactorCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Session helpers
export async function createSecureSession(userId: string, deviceInfo: DeviceInfo): Promise<string> {
  const sessionId = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  try {
    await cache.set(
      `session:${sessionId}`,
      JSON.stringify({
        userId,
        deviceInfo,
        createdAt: Date.now(),
        expiresAt: expiresAt.getTime()
      }),
      24 * 60 * 60 // 24 hours in seconds
    )
  } catch (error) {
    console.error('Error creating session in cache:', error)
  }

  return sessionId
}

export async function validateSession(sessionId: string): Promise<any> {
  try {
    const sessionData = await cache.get(`session:${sessionId}`)
    if (!sessionData) return null

    const session = JSON.parse(sessionData.toString())
    if (Date.now() > session.expiresAt) {
      await cache.del(`session:${sessionId}`)
      return null
    }

    return session
  } catch (error) {
    console.error('Error validating session:', error)
    return null
  }
}

// Security logging
export function logSecurityEvent(event: {
  type: string
  userId?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  metadata?: any
}) {
  console.log(`[SECURITY ${event.severity.toUpperCase()}]`, {
    type: event.type,
    userId: event.userId,
    timestamp: new Date().toISOString(),
    metadata: event.metadata
  })

  // In production, you might want to send this to a logging service
  // or store in a security events table
}