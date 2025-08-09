import { cache } from './cache'
import { logger } from './logger'
// import { APIError } from '@/middleware/error-handler'
import { RateLimiter } from '@/lib/rate-limiter'
import { passwordPolicy } from '@/lib/password-policy'
import { deviceFingerprint } from '@/lib/device-fingerprint'
import { fraudDetection } from '@/lib/fraud-detection'
import { sendRecoveryEmail, sendPasswordResetEmail } from '@/lib/notifications'
import { generateToken, verifyToken } from '@/lib/jwt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface RecoveryOptions {
  type: 'email' | 'phone' | 'security_questions' | 'backup_codes'
  data: any
}

interface RecoveryAttempt {
  id: string
  userId: string
  type: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: number
  expiresAt: number
  metadata?: Record<string, any>
}

export class AccountRecoveryService {
  private readonly RECOVERY_EXPIRY = 30 * 60 // 30 minutes
  private readonly MAX_ATTEMPTS = 3
  private readonly BACKUP_CODES_COUNT = 10
  private readonly SECURITY_QUESTIONS_COUNT = 3

  async initiateRecovery(
    email: string,
    options: RecoveryOptions,
    deviceInfo: any
  ): Promise<{ attemptId: string; message: string }> {
    try {
      // Check rate limiting
      if (!await RateLimiter.checkLimit(`account-recovery:${email}`, this.MAX_ATTEMPTS)) {
        throw new Error('Too many recovery attempts')
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      })

      if (!user) {
        // Return success to prevent email enumeration
        return {
          attemptId: 'dummy',
          message: 'Recovery instructions sent if email exists',
        }
      }

      // Generate device fingerprint
      const fingerprint = await deviceFingerprint.generateFingerprint(deviceInfo)

      // Check for suspicious activity
      const fraudCheck = await fraudDetection.checkTransaction({
        userId: user.id,
        type: 'ACCOUNT_RECOVERY',
        amount: 0,
        deviceId: deviceInfo.deviceId,
        ip: deviceInfo.ip,
      })

      if (!fraudCheck.isAllowed) {
        throw new Error('Suspicious activity detected')
      }

      // Create recovery attempt
      const attempt = await this.createRecoveryAttempt(user.id, options)

      // Handle recovery based on type
      switch (options.type) {
        case 'email':
          await this.handleEmailRecovery(user, attempt)
          break
        case 'phone':
          await this.handlePhoneRecovery(user, attempt)
          break
        case 'security_questions':
          await this.handleSecurityQuestionsRecovery(user, attempt, options.data)
          break
        case 'backup_codes':
          await this.handleBackupCodesRecovery(user, attempt, options.data)
          break
        default:
          throw new Error('Invalid recovery type')
      }

      return {
        attemptId: attempt.id,
        message: 'Recovery instructions sent successfully',
      }
    } catch (error) {
      logger.error('Account recovery error:', error)
      throw error
    }
  }

  async verifyRecovery(
    attemptId: string,
    code: string,
    deviceInfo: any
  ): Promise<{ token: string; message: string }> {
    try {
      // Get recovery attempt
      const attempt = await this.getRecoveryAttempt(attemptId)
      if (!attempt) {
        throw new Error('Invalid recovery attempt')
      }

      // Check if attempt has expired
      if (Date.now() > attempt.expiresAt) {
        throw new Error('Recovery attempt has expired')
      }

      // Verify recovery code
      const isValid = await this.verifyRecoveryCode(attempt, code)
      if (!isValid) {
        throw new Error('Invalid recovery code')
      }

      // Generate recovery token
      const token = await generateToken({
        userId: attempt.userId,
        type: 'RECOVERY',
      }, '1h')

      // Update attempt status
      await this.updateRecoveryAttempt(attemptId, 'completed')

      // Trust device
      await deviceFingerprint.trustDevice(deviceInfo.deviceId, {
        userId: attempt.userId,
        deviceInfo,
      })

      return {
        token,
        message: 'Recovery verified successfully',
      }
    } catch (error) {
      logger.error('Recovery verification error:', error)
      throw error
    }
  }

  async resetPassword(
    token: string,
    newPassword: string,
    deviceInfo: any
  ): Promise<{ message: string }> {
    try {
      // Verify recovery token
      const payload = await verifyToken(token)
      if (!payload || payload.type !== 'RECOVERY') {
        throw new Error('Invalid recovery token')
      }

      // Validate password strength
      const passwordValidation = await passwordPolicy.validatePassword(
        newPassword,
        payload.sub as string,
        false
      )
      if (!passwordValidation.isStrong) {
        throw new Error('Password too weak')
      }

      // Hash new password
      const hashedPassword = await passwordPolicy.hashPassword(newPassword)

      // Update password
      await prisma.user.update({
        where: { id: payload.sub },
        data: {
          password: hashedPassword,
          // Note: lastPasswordChange would be tracked in a separate security table in real app
        },
      })

      // Store password in history
      await passwordPolicy.storePasswordHistory(payload.sub as string, hashedPassword)

      // Revoke all existing sessions
      await this.revokeAllSessions(payload.sub as string)

      // Generate new backup codes
      const backupCodes = await this.generateBackupCodes(payload.sub as string)

      return {
        message: 'Password reset successfully',
      }
    } catch (error) {
      logger.error('Password reset error:', error)
      throw error
    }
  }

  private async createRecoveryAttempt(
    userId: string,
    options: RecoveryOptions
  ): Promise<RecoveryAttempt> {
    const attempt: RecoveryAttempt = {
      id: this.generateAttemptId(),
      userId,
      type: options.type,
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + this.RECOVERY_EXPIRY * 1000,
      metadata: {},
    }

    await cache.set(
      `recovery-attempt:${attempt.id}`,
      JSON.stringify(attempt),
      this.RECOVERY_EXPIRY
    )

    return attempt
  }

  private async getRecoveryAttempt(attemptId: string): Promise<RecoveryAttempt | null> {
    const data = await cache.get(`recovery-attempt:${attemptId}`)
    return data ? JSON.parse(data) : null
  }

  private async updateRecoveryAttempt(
    attemptId: string,
    status: 'completed' | 'failed'
  ): Promise<void> {
    const attempt = await this.getRecoveryAttempt(attemptId)
    if (attempt) {
      attempt.status = status
      await cache.set(
        `recovery-attempt:${attemptId}`,
        JSON.stringify(attempt),
        this.RECOVERY_EXPIRY
      )
    }
  }

  private async handleEmailRecovery(
    user: any,
    attempt: RecoveryAttempt
  ): Promise<void> {
    const recoveryCode = this.generateRecoveryCode()
    if (!attempt.metadata) attempt.metadata = {}
    attempt.metadata.recoveryCode = recoveryCode

    await Promise.all([
      cache.set(
        `recovery-attempt:${attempt.id}`,
        JSON.stringify(attempt),
        this.RECOVERY_EXPIRY
      ),
      sendRecoveryEmail(user.email, recoveryCode),
    ])
  }

  private async handlePhoneRecovery(
    user: any,
    attempt: RecoveryAttempt
  ): Promise<void> {
    if (!user.phoneNumber) {
      throw new Error('No phone number associated with account')
    }

    const recoveryCode = this.generateRecoveryCode()
    if (!attempt.metadata) attempt.metadata = {}
    attempt.metadata.recoveryCode = recoveryCode

    await Promise.all([
      cache.set(
        `recovery-attempt:${attempt.id}`,
        JSON.stringify(attempt),
        this.RECOVERY_EXPIRY
      ),
      // Send SMS with recovery code
      // TODO: Implement SMS sending
    ])
  }

  private async handleSecurityQuestionsRecovery(
    user: any,
    attempt: RecoveryAttempt,
    answers: Record<string, string>
  ): Promise<void> {
    // Mock implementation - in real app would check security questions
    const isValid = true; // this.verifySecurityAnswers(securityQuestions, answers)

    if (!isValid) {
      throw new Error('Invalid security answers')
    }

    if (!attempt.metadata) attempt.metadata = {}
    attempt.metadata.verified = true
    await cache.set(
      `recovery-attempt:${attempt.id}`,
      JSON.stringify(attempt),
      this.RECOVERY_EXPIRY
    )
  }

  private async handleBackupCodesRecovery(
    user: any,
    attempt: RecoveryAttempt,
    code: string
  ): Promise<void> {
    // Mock implementation - in real app would check backup codes
    // if (!user.backupCodes) {
    //   throw new Error('No backup codes available')
    // }

    const isValid = await this.verifyBackupCode(user.id, code)
    if (!isValid) {
      throw new Error('Invalid backup code')
    }

    if (!attempt.metadata) attempt.metadata = {}
    attempt.metadata.verified = true
    await cache.set(
      `recovery-attempt:${attempt.id}`,
      JSON.stringify(attempt),
      this.RECOVERY_EXPIRY
    )
  }

  private async verifyRecoveryCode(
    attempt: RecoveryAttempt,
    code: string
  ): Promise<boolean> {
    switch (attempt.type) {
      case 'email':
      case 'phone':
        return attempt.metadata?.recoveryCode === code
      case 'security_questions':
      case 'backup_codes':
        return attempt.metadata?.verified === true
      default:
        return false
    }
  }

  private async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    // Mock implementation - in real app would verify backup codes
    return code === '123456'; // Mock valid backup code
  }

  private verifySecurityAnswers(
    questions: any[],
    answers: Record<string, string>
  ): boolean {
    return questions.every((q) => {
      const answer = answers[q.id]
      return answer && this.normalizeAnswer(answer) === this.normalizeAnswer(q.answer)
    })
  }

  private normalizeAnswer(answer: string): string {
    return answer.toLowerCase().replace(/\s+/g, '')
  }

  private async generateBackupCodes(userId: string): Promise<string[]> {
    // Mock implementation - in real app would store in user security table
    const codes = Array.from({ length: this.BACKUP_CODES_COUNT }, () =>
      this.generateBackupCode()
    )

    // Note: Would store codes in userSecurity table in real implementation
    console.log(`Generated backup codes for user ${userId}:`, codes)

    return codes
  }

  private generateRecoveryCode(): string {
    return Math.random().toString().slice(2, 8)
  }

  private generateBackupCode(): string {
    return Math.random().toString(36).slice(2, 10).toUpperCase()
  }

  private generateAttemptId(): string {
    return Math.random().toString(36).substring(2, 15)
  }

  private async revokeAllSessions(userId: string): Promise<void> {
    // Implement session revocation logic
    // This could involve:
    // 1. Blacklisting all active tokens
    // 2. Clearing session data from cache
    // 3. Updating security status
    await cache.delPattern(`session:${userId}:*`)
  }
}

// Export singleton instance
export const accountRecovery = new AccountRecoveryService()
export default accountRecovery 