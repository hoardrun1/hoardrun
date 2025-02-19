import { cache } from './cache'
import { logger } from './logger'
import { APIError } from '@/middleware/error-handler'
import { RateLimiter } from '@/lib/rate-limiter'
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

interface PhoneVerificationResult {
  success: boolean
  message: string
  attemptId?: string
}

export class PhoneVerificationService {
  private readonly VERIFICATION_EXPIRY = 10 * 60 // 10 minutes
  private readonly MAX_ATTEMPTS = 3
  private readonly COOLDOWN_PERIOD = 24 * 60 * 60 // 24 hours

  async sendVerificationCode(
    phoneNumber: string,
    userId: string
  ): Promise<PhoneVerificationResult> {
    try {
      // Check rate limiting
      if (!await RateLimiter.checkLimit(`phone-verification:${userId}`, this.MAX_ATTEMPTS)) {
        throw new APIError(
          429,
          `Maximum verification attempts reached. Please try again after ${this.COOLDOWN_PERIOD / 3600} hours`,
          'RATE_LIMIT_EXCEEDED'
        )
      }

      // Validate phone number format
      if (!this.isValidPhoneNumber(phoneNumber)) {
        throw new APIError(400, 'Invalid phone number format', 'INVALID_PHONE_NUMBER')
      }

      // Generate verification code
      const verificationCode = this.generateVerificationCode()
      const attemptId = this.generateAttemptId()

      // Store verification data
      await this.storeVerificationData(userId, phoneNumber, verificationCode, attemptId)

      // Send SMS
      await this.sendSMS(phoneNumber, verificationCode)

      // Increment attempt counter
      await RateLimiter.increment(`phone-verification:${userId}`)

      return {
        success: true,
        message: 'Verification code sent successfully',
        attemptId,
      }
    } catch (error) {
      logger.error('Phone verification error:', error)
      throw error
    }
  }

  async verifyCode(
    userId: string,
    code: string,
    attemptId: string
  ): Promise<PhoneVerificationResult> {
    try {
      // Get verification data
      const verificationData = await this.getVerificationData(userId, attemptId)
      if (!verificationData) {
        throw new APIError(400, 'Invalid or expired verification attempt', 'INVALID_ATTEMPT')
      }

      // Check if code matches
      if (verificationData.code !== code) {
        throw new APIError(400, 'Invalid verification code', 'INVALID_CODE')
      }

      // Check if code has expired
      if (Date.now() > verificationData.expiresAt) {
        throw new APIError(400, 'Verification code has expired', 'CODE_EXPIRED')
      }

      // Clear verification data
      await this.clearVerificationData(userId, attemptId)

      return {
        success: true,
        message: 'Phone number verified successfully',
      }
    } catch (error) {
      logger.error('Phone verification error:', error)
      throw error
    }
  }

  async resendVerificationCode(
    userId: string,
    attemptId: string
  ): Promise<PhoneVerificationResult> {
    try {
      // Get existing verification data
      const verificationData = await this.getVerificationData(userId, attemptId)
      if (!verificationData) {
        throw new APIError(400, 'Invalid verification attempt', 'INVALID_ATTEMPT')
      }

      // Check rate limiting
      if (!await RateLimiter.checkLimit(`phone-verification-resend:${userId}`, 2)) {
        throw new APIError(
          429,
          'Too many resend attempts. Please try again later.',
          'RATE_LIMIT_EXCEEDED'
        )
      }

      // Generate new verification code
      const newCode = this.generateVerificationCode()

      // Update verification data
      await this.updateVerificationData(userId, attemptId, newCode)

      // Send SMS
      await this.sendSMS(verificationData.phoneNumber, newCode)

      return {
        success: true,
        message: 'Verification code resent successfully',
        attemptId,
      }
    } catch (error) {
      logger.error('Phone verification resend error:', error)
      throw error
    }
  }

  private async storeVerificationData(
    userId: string,
    phoneNumber: string,
    code: string,
    attemptId: string
  ): Promise<void> {
    const key = `phone-verification:${userId}:${attemptId}`
    const data = {
      phoneNumber,
      code,
      attemptId,
      expiresAt: Date.now() + this.VERIFICATION_EXPIRY * 1000,
    }
    await cache.set(key, JSON.stringify(data), this.VERIFICATION_EXPIRY)
  }

  private async getVerificationData(
    userId: string,
    attemptId: string
  ): Promise<any | null> {
    const key = `phone-verification:${userId}:${attemptId}`
    const data = await cache.get(key)
    return data ? JSON.parse(data) : null
  }

  private async updateVerificationData(
    userId: string,
    attemptId: string,
    newCode: string
  ): Promise<void> {
    const key = `phone-verification:${userId}:${attemptId}`
    const data = await this.getVerificationData(userId, attemptId)
    if (data) {
      data.code = newCode
      data.expiresAt = Date.now() + this.VERIFICATION_EXPIRY * 1000
      await cache.set(key, JSON.stringify(data), this.VERIFICATION_EXPIRY)
    }
  }

  private async clearVerificationData(
    userId: string,
    attemptId: string
  ): Promise<void> {
    const key = `phone-verification:${userId}:${attemptId}`
    await cache.del(key)
  }

  private async sendSMS(phoneNumber: string, code: string): Promise<void> {
    try {
      await client.messages.create({
        body: `Your Hoardrun verification code is: ${code}. Valid for ${this.VERIFICATION_EXPIRY / 60} minutes.`,
        to: phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER,
      })
    } catch (error) {
      logger.error('SMS sending error:', error)
      throw new APIError(500, 'Failed to send verification SMS', 'SMS_SEND_FAILED')
    }
  }

  private generateVerificationCode(): string {
    return Math.random().toString().slice(2, 8)
  }

  private generateAttemptId(): string {
    return Math.random().toString(36).substring(2, 15)
  }

  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Basic phone number validation (E.164 format)
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    return phoneRegex.test(phoneNumber)
  }

  async validatePhoneNumber(phoneNumber: string): Promise<boolean> {
    try {
      const lookup = await client.lookups.v2.phoneNumbers(phoneNumber).fetch()
      return lookup.valid
    } catch (error) {
      logger.error('Phone number validation error:', error)
      return false
    }
  }

  async getPhoneNumberInfo(phoneNumber: string): Promise<any> {
    try {
      const lookup = await client.lookups.v2.phoneNumbers(phoneNumber)
        .fetch({ type: ['carrier', 'caller-name'] })
      return {
        valid: lookup.valid,
        countryCode: lookup.countryCode,
        carrier: lookup.carrier,
        callerName: lookup.callerName,
      }
    } catch (error) {
      logger.error('Phone number info lookup error:', error)
      throw new APIError(500, 'Failed to get phone number info', 'PHONE_LOOKUP_FAILED')
    }
  }
}

// Export singleton instance
export const phoneVerification = new PhoneVerificationService()
export default phoneVerification 