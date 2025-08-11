import { cache } from './cache'
import { logger } from './logger'
import { AppError, ErrorCode } from './error-handling'
import { Transaction, User } from '@prisma/client'
import geoip from 'geoip-lite'

interface FraudDetectionConfig {
  maxDailyTransactionAmount: number
  maxSingleTransactionAmount: number
  maxDailyTransactionCount: number
  suspiciousCountryCodes: string[]
  velocityCheckWindow: number // in minutes
  velocityCheckThreshold: number
  deviceChangeThreshold: number // in hours
  locationChangeThreshold: number // in kilometers
}

interface TransactionContext {
  userId: string
  amount: number
  type: string
  deviceId: string
  ip: string
  location?: {
    latitude: number
    longitude: number
  }
  metadata?: Record<string, any>
}

interface FraudCheckResult {
  isAllowed: boolean
  riskScore: number
  triggers: string[]
  requiresVerification: boolean
  metadata?: Record<string, any>
}

const DEFAULT_CONFIG: FraudDetectionConfig = {
  maxDailyTransactionAmount: 10000,
  maxSingleTransactionAmount: 5000,
  maxDailyTransactionCount: 20,
  suspiciousCountryCodes: ['XX', 'YY', 'ZZ'], // Add suspicious country codes
  velocityCheckWindow: 5, // 5 minutes
  velocityCheckThreshold: 3, // max 3 transactions in window
  deviceChangeThreshold: 24, // 24 hours
  locationChangeThreshold: 500, // 500 kilometers
}

export class FraudDetectionService {
  private config: FraudDetectionConfig
  private cache: typeof cache

  constructor(config: Partial<FraudDetectionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.cache = cache
  }

  async checkTransaction(context: TransactionContext): Promise<FraudCheckResult> {
    const triggers: string[] = []
    let riskScore = 0

    try {
      // Parallel fraud checks
      const [
        amountCheck,
        velocityCheck,
        locationCheck,
        deviceCheck,
        patternCheck,
      ] = await Promise.all([
        this.checkTransactionAmounts(context),
        this.checkTransactionVelocity(context),
        this.checkLocation(context),
        this.checkDevice(context),
        this.checkTransactionPatterns(context),
      ])

      // Accumulate results
      triggers.push(...amountCheck.triggers)
      triggers.push(...velocityCheck.triggers)
      triggers.push(...locationCheck.triggers)
      triggers.push(...deviceCheck.triggers)
      triggers.push(...patternCheck.triggers)

      riskScore = this.calculateRiskScore([
        amountCheck,
        velocityCheck,
        locationCheck,
        deviceCheck,
        patternCheck,
      ])

      // Log fraud check results
      this.logFraudCheck(context, {
        riskScore,
        triggers,
        metadata: {
          amountCheck,
          velocityCheck,
          locationCheck,
          deviceCheck,
          patternCheck,
        },
      })

      // Determine if transaction should be allowed
      const isAllowed = riskScore < 70 // Threshold for automatic rejection
      const requiresVerification = riskScore >= 40 // Threshold for additional verification

      return {
        isAllowed,
        riskScore,
        triggers,
        requiresVerification,
        metadata: {
          checkTimestamp: Date.now(),
          deviceTrust: deviceCheck.trustScore,
          locationTrust: locationCheck.trustScore,
        },
      }
    } catch (error) {
      logger.error('Fraud check error:', error)
      throw new Error('Failed to complete fraud check')
    }
  }

  private async checkTransactionAmounts(
    context: TransactionContext
  ): Promise<{ triggers: string[]; riskScore: number }> {
    try {
      const triggers: string[] = [];
      let riskScore = 0;

      // Validate input
      if (!context.userId || !context.amount) {
        throw new AppError(
          'Invalid transaction context',
          ErrorCode.VALIDATION_ERROR,
          400
        );
      }

      // Check single transaction amount
      if (context.amount > this.config.maxSingleTransactionAmount) {
        triggers.push('HIGH_SINGLE_TRANSACTION_AMOUNT')
        riskScore += 30
      }

      // Check daily transaction total
      const dailyTotal = await this.getDailyTransactionTotal(context.userId)
      if (dailyTotal + context.amount > this.config.maxDailyTransactionAmount) {
        triggers.push('DAILY_AMOUNT_EXCEEDED')
        riskScore += 25
      }

      // Check daily transaction count
      const dailyCount = await this.getDailyTransactionCount(context.userId)
      if (dailyCount >= this.config.maxDailyTransactionCount) {
        triggers.push('DAILY_COUNT_EXCEEDED')
        riskScore += 20
      }

      return { triggers, riskScore };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        'Fraud check failed',
        ErrorCode.INTERNAL_ERROR,
        500
      );
    }
  }

  private async checkTransactionVelocity(
    context: TransactionContext
  ): Promise<{ triggers: string[]; riskScore: number; trustScore: number }> {
    const triggers: string[] = []
    let riskScore = 0
    let trustScore = 100

    const windowKey = `velocity:${context.userId}:${context.type}`
    const recentTransactions = await this.getRecentTransactions(windowKey)

    // Check transaction frequency
    if (recentTransactions.length >= this.config.velocityCheckThreshold) {
      triggers.push('HIGH_VELOCITY')
      riskScore += 35
      trustScore -= 30
    }

    // Check for rapid small transactions
    const smallTransactions = recentTransactions.filter(t => t.amount < 100)
    if (smallTransactions.length >= 3) {
      triggers.push('RAPID_SMALL_TRANSACTIONS')
      riskScore += 25
      trustScore -= 20
    }

    // Store current transaction
    await this.storeTransactionVelocity(windowKey, {
      amount: context.amount,
      timestamp: Date.now(),
    })

    return { triggers, riskScore, trustScore }
  }

  private async checkLocation(
    context: TransactionContext
  ): Promise<{ triggers: string[]; riskScore: number; trustScore: number }> {
    const triggers: string[] = []
    let riskScore = 0
    let trustScore = 100

    // Get location info from IP
    const geoData = geoip.lookup(context.ip)
    if (!geoData) {
      triggers.push('UNKNOWN_LOCATION')
      riskScore += 20
      trustScore -= 20
      return { triggers, riskScore, trustScore }
    }

    // Check suspicious countries
    if (this.config.suspiciousCountryCodes.includes(geoData.country)) {
      triggers.push('SUSPICIOUS_COUNTRY')
      riskScore += 40
      trustScore -= 40
    }

    // Check for location change
    const lastLocation = await this.getLastKnownLocation(context.userId)
    if (lastLocation && context.location) {
      const distance = this.calculateDistance(
        lastLocation.latitude,
        lastLocation.longitude,
        context.location.latitude,
        context.location.longitude
      )

      if (distance > this.config.locationChangeThreshold) {
        triggers.push('SIGNIFICANT_LOCATION_CHANGE')
        riskScore += 30
        trustScore -= 25
      }
    }

    // Store current location
    if (context.location) {
      await this.storeLocation(context.userId, context.location)
    }

    return { triggers, riskScore, trustScore }
  }

  private async checkDevice(
    context: TransactionContext
  ): Promise<{ triggers: string[]; riskScore: number; trustScore: number }> {
    const triggers: string[] = []
    let riskScore = 0
    let trustScore = 100

    // Get device history
    const deviceHistory = await this.getDeviceHistory(context.userId)
    const lastDevice = deviceHistory[0]

    // Check for device change
    if (lastDevice && lastDevice.deviceId !== context.deviceId) {
      const hoursSinceLastDevice = (Date.now() - lastDevice.timestamp) / (1000 * 60 * 60)
      
      if (hoursSinceLastDevice < this.config.deviceChangeThreshold) {
        triggers.push('RECENT_DEVICE_CHANGE')
        riskScore += 25
        trustScore -= 20
      }
    }

    // Check for multiple devices
    const recentDevices = new Set(
      deviceHistory
        .filter(d => Date.now() - d.timestamp < 24 * 60 * 60 * 1000)
        .map(d => d.deviceId)
    )

    if (recentDevices.size > 3) {
      triggers.push('MULTIPLE_DEVICES')
      riskScore += 20
      trustScore -= 15
    }

    // Store current device
    await this.storeDevice(context.userId, {
      deviceId: context.deviceId,
      timestamp: Date.now(),
    })

    return { triggers, riskScore, trustScore }
  }

  private async checkTransactionPatterns(
    context: TransactionContext
  ): Promise<{ triggers: string[]; riskScore: number }> {
    const triggers: string[] = []
    let riskScore = 0

    // Get recent transactions
    const recentTransactions = await this.getRecentTransactions(
      `transactions:${context.userId}`
    )

    // Check for repeated transactions
    const similarTransactions = recentTransactions.filter(
      t => Math.abs(t.amount - context.amount) < 1
    )

    if (similarTransactions.length >= 2) {
      triggers.push('REPEATED_TRANSACTIONS')
      riskScore += 15
    }

    // Check for round amounts
    if (context.amount % 100 === 0 && context.amount > 1000) {
      triggers.push('ROUND_AMOUNT')
      riskScore += 10
    }

    return { triggers, riskScore }
  }

  private calculateRiskScore(checks: { riskScore: number }[]): number {
    const totalRiskScore = checks.reduce((sum, check) => sum + check.riskScore, 0)
    return Math.min(100, totalRiskScore)
  }

  private async getDailyTransactionTotal(userId: string): Promise<number> {
    const key = `daily-total:${userId}`
    const total = await this.cache.get(key)
    return total ? parseFloat(total) : 0
  }

  private async getDailyTransactionCount(userId: string): Promise<number> {
    const key = `daily-count:${userId}`
    const count = await this.cache.get(key)
    return count ? parseInt(count) : 0
  }

  private async getRecentTransactions(key: string): Promise<any[]> {
    const data = await this.cache.get(key)
    return data ? JSON.parse(data) : []
  }

  private async storeTransactionVelocity(
    key: string,
    transaction: { amount: number; timestamp: number }
  ): Promise<void> {
    const transactions = await this.getRecentTransactions(key)
    
    // Add new transaction and remove old ones
    transactions.unshift(transaction)
    const windowMs = this.config.velocityCheckWindow * 60 * 1000
    const validTransactions = transactions.filter(
      t => Date.now() - t.timestamp < windowMs
    )

    await this.cache.set(key, JSON.stringify(validTransactions), windowMs / 1000)
  }

  private async getLastKnownLocation(
    userId: string
  ): Promise<{ latitude: number; longitude: number } | null> {
    const key = `last-location:${userId}`
    const data = await this.cache.get(key)
    return data ? JSON.parse(data) : null
  }

  private async storeLocation(
    userId: string,
    location: { latitude: number; longitude: number }
  ): Promise<void> {
    const key = `last-location:${userId}`
    await this.cache.set(key, JSON.stringify(location))
  }

  private async getDeviceHistory(userId: string): Promise<any[]> {
    const key = `device-history:${userId}`
    const data = await this.cache.get(key)
    return data ? JSON.parse(data) : []
  }

  private async storeDevice(
    userId: string,
    device: { deviceId: string; timestamp: number }
  ): Promise<void> {
    const key = `device-history:${userId}`
    const devices = await this.getDeviceHistory(userId)
    
    devices.unshift(device)
    if (devices.length > 10) {
      devices.pop()
    }

    await this.cache.set(key, JSON.stringify(devices))
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1)
    const dLon = this.toRad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180
  }

  private logFraudCheck(
    context: TransactionContext,
    result: {
      riskScore: number
      triggers: string[]
      metadata?: Record<string, any>
    }
  ): void {
    logger.info('Fraud check completed', {
      userId: context.userId,
      deviceId: context.deviceId,
      amount: context.amount,
      type: context.type,
      riskScore: result.riskScore,
      triggers: result.triggers,
      metadata: result.metadata,
    })
  }
}

// Export singleton instance
export const fraudDetection = new FraudDetectionService()
export default fraudDetection 