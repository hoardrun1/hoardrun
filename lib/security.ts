import { Request } from 'express'
import Redis from 'ioredis'
import { logger, logSecurityEvent } from '@/lib/logger'
import { APIError } from '@/middleware/error-handler'
import { RateLimiter } from '@/lib/rate-limiter'
import { createHash, randomBytes, timingSafeEqual } from 'crypto'
import { z } from 'zod'
import geoip from 'geoip-lite'
import UAParser from 'ua-parser-js'

// Interfaces
interface SecurityConfig {
  maxLoginAttempts: number
  lockoutDuration: number
  passwordExpiryDays: number
  sessionDuration: number
  requireMFA: boolean
  ipWhitelist: string[]
  suspiciousIPs: string[]
  deviceTrustDuration: number
}

interface DeviceInfo {
  id: string
  userAgent: string
  ip: string
  location?: {
    country: string
    region: string
    city: string
  }
  lastSeen: Date
  isTrusted: boolean
  trustExpiry?: Date
}

interface SecurityEvent {
  type: string
  userId: string
  deviceInfo: DeviceInfo
  metadata?: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
}

// Default configuration
const DEFAULT_CONFIG: SecurityConfig = {
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60, // 15 minutes
  passwordExpiryDays: 90,
  sessionDuration: 24 * 60 * 60, // 24 hours
  requireMFA: true,
  ipWhitelist: [],
  suspiciousIPs: [],
  deviceTrustDuration: 30 * 24 * 60 * 60, // 30 days
}

class SecurityService {
  private redis: Redis
  private config: SecurityConfig

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.redis = new Redis(process.env.REDIS_URL)
  }

  // Request validation
  async validateRequest(req: Request): Promise<boolean> {
    try {
      // Check IP whitelist
      if (this.config.ipWhitelist.length > 0 && !this.config.ipWhitelist.includes(req.ip)) {
        this.logSecurityEvent({
          type: 'IP_BLOCKED',
          userId: req.user?.id,
          deviceInfo: await this.getDeviceInfo(req),
          severity: 'medium',
          metadata: { ip: req.ip },
        })
        return false
      }

      // Check suspicious IPs
      if (this.config.suspiciousIPs.includes(req.ip)) {
        this.logSecurityEvent({
          type: 'SUSPICIOUS_IP_DETECTED',
          userId: req.user?.id,
          deviceInfo: await this.getDeviceInfo(req),
          severity: 'high',
          metadata: { ip: req.ip },
        })
        return false
      }

      // Rate limiting check
      const rateLimitKey = `rate-limit:${req.ip}:${req.path}`
      if (!await RateLimiter.checkLimit(rateLimitKey, 100)) {
        this.logSecurityEvent({
          type: 'RATE_LIMIT_EXCEEDED',
          userId: req.user?.id,
          deviceInfo: await this.getDeviceInfo(req),
          severity: 'medium',
          metadata: { path: req.path },
        })
        return false
      }

      return true
    } catch (error) {
      logger.error('Error validating request:', error)
      return false
    }
  }

  // Session validation
  async validateSession(req: Request): Promise<boolean> {
    try {
      const sessionId = req.headers['x-session-id'] as string
      if (!sessionId) return false

      const session = await this.redis.get(`session:${sessionId}`)
      if (!session) return false

      const sessionData = JSON.parse(session)
      if (Date.now() > sessionData.expiresAt) {
        await this.redis.del(`session:${sessionId}`)
        return false
      }

      return true
    } catch (error) {
      logger.error('Error validating session:', error)
      return false
    }
  }

  // Login attempt management
  async checkLoginAttempts(userId: string): Promise<boolean> {
    try {
      const key = `login-attempts:${userId}`
      const attempts = await this.redis.get(key)
      
      if (!attempts) return true

      const attemptsCount = parseInt(attempts)
      if (attemptsCount >= this.config.maxLoginAttempts) {
        this.logSecurityEvent({
          type: 'ACCOUNT_LOCKED',
          userId,
          deviceInfo: null,
          severity: 'high',
          metadata: { attempts: attemptsCount },
        })
        return false
      }

      return true
    } catch (error) {
      logger.error('Error checking login attempts:', error)
      return true
    }
  }

  // Password validation
  async validatePasswordAge(userId: string, passwordUpdatedAt: Date): Promise<boolean> {
    const ageInDays = (Date.now() - passwordUpdatedAt.getTime()) / (1000 * 60 * 60 * 24)
    return ageInDays <= this.config.passwordExpiryDays
  }

  // MFA validation
  async validateMFA(userId: string, code: string): Promise<boolean> {
    try {
      const storedCode = await this.redis.get(`mfa:${userId}`)
      if (!storedCode) return false

      // Use timing-safe comparison to prevent timing attacks
      return timingSafeEqual(
        Buffer.from(code),
        Buffer.from(storedCode)
      )
    } catch (error) {
      logger.error('Error validating MFA:', error)
      return false
    }
  }

  // Device trust management
  async isDeviceTrusted(deviceId: string): Promise<boolean> {
    try {
      const device = await this.redis.get(`device:${deviceId}`)
      if (!device) return false

      const deviceData = JSON.parse(device) as DeviceInfo
      return deviceData.isTrusted && 
             deviceData.trustExpiry && 
             new Date(deviceData.trustExpiry) > new Date()
    } catch (error) {
      logger.error('Error checking device trust:', error)
      return false
    }
  }

  // Trust a device
  async trustDevice(userId: string, deviceInfo: Partial<DeviceInfo>): Promise<void> {
    try {
      const device: DeviceInfo = {
        id: deviceInfo.id || randomBytes(16).toString('hex'),
        userAgent: deviceInfo.userAgent || '',
        ip: deviceInfo.ip || '',
        location: deviceInfo.location,
        lastSeen: new Date(),
        isTrusted: true,
        trustExpiry: new Date(Date.now() + this.config.deviceTrustDuration * 1000),
      }

      await this.redis.set(
        `device:${device.id}`,
        JSON.stringify(device),
        'EX',
        this.config.deviceTrustDuration
      )

      this.logSecurityEvent({
        type: 'DEVICE_TRUSTED',
        userId,
        deviceInfo: device,
        severity: 'low',
      })
    } catch (error) {
      logger.error('Error trusting device:', error)
    }
  }

  // Create a new session
  async createSession(userId: string, deviceInfo: DeviceInfo): Promise<string> {
    try {
      const sessionId = randomBytes(32).toString('hex')
      const session = {
        userId,
        deviceInfo,
        createdAt: Date.now(),
        expiresAt: Date.now() + this.config.sessionDuration * 1000,
      }

      await this.redis.set(
        `session:${sessionId}`,
        JSON.stringify(session),
        'EX',
        this.config.sessionDuration
      )

      return sessionId
    } catch (error) {
      logger.error('Error creating session:', error)
      throw new APIError(500, 'Failed to create session')
    }
  }

  // Get device information from request
  private async getDeviceInfo(req: Request): Promise<DeviceInfo> {
    const ua = new UAParser(req.headers['user-agent'])
    const geo = geoip.lookup(req.ip)

    return {
      id: req.headers['x-device-id'] as string || randomBytes(16).toString('hex'),
      userAgent: req.headers['user-agent'] || '',
      ip: req.ip,
      location: geo ? {
        country: geo.country,
        region: geo.region,
        city: geo.city,
      } : undefined,
      lastSeen: new Date(),
      isTrusted: false,
    }
  }

  // Log security event
  private logSecurityEvent(event: SecurityEvent): void {
    logSecurityEvent({
      type: event.type,
      severity: event.severity,
      message: `Security event: ${event.type}`,
      userId: event.userId,
      metadata: {
        ...event.metadata,
        deviceInfo: event.deviceInfo,
      },
    })
  }

  // Reset login attempts
  async resetLoginAttempts(userId: string): Promise<void> {
    await this.redis.del(`login-attempts:${userId}`)
  }

  // Increment login attempts
  async incrementLoginAttempts(userId: string): Promise<number> {
    const key = `login-attempts:${userId}`
    const attempts = await this.redis.incr(key)
    await this.redis.expire(key, this.config.lockoutDuration)
    return attempts
  }

  // Check for suspicious activity
  async checkSuspiciousActivity(userId: string, deviceInfo: DeviceInfo): Promise<boolean> {
    try {
      const key = `user-locations:${userId}`
      const locations = await this.redis.get(key)
      
      if (!locations) {
        await this.redis.set(key, JSON.stringify([deviceInfo.location]))
        return false
      }

      const knownLocations = JSON.parse(locations)
      if (!deviceInfo.location) return false

      // Check if location is known
      const isKnownLocation = knownLocations.some((loc: any) => 
        loc.country === deviceInfo.location.country &&
        loc.region === deviceInfo.location.region
      )

      if (!isKnownLocation) {
        this.logSecurityEvent({
          type: 'NEW_LOGIN_LOCATION',
          userId,
          deviceInfo,
          severity: 'medium',
          metadata: { location: deviceInfo.location },
        })
        return true
      }

      return false
    } catch (error) {
      logger.error('Error checking suspicious activity:', error)
      return false
    }
  }
}

// Export singleton instance
export const securityService = new SecurityService()
export default securityService 