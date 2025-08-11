import { z } from 'zod'
import { cache } from './cache'
import { logger } from './logger'
// import { APIError } from '@/middleware/error-handler'
import { createHash, randomBytes } from 'crypto'

interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  preventReuse: number // Number of previous passwords to check
  expiryDays: number
  maxAttempts: number
}

interface PasswordStrength {
  score: number // 0-100
  feedback: string[]
  isStrong: boolean
}

const DEFAULT_POLICY: PasswordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventReuse: 5,
  expiryDays: 90,
  maxAttempts: 5,
}

// Common password patterns to check against
const COMMON_PATTERNS = [
  /^password\d*$/i,
  /^12345\d*$/,
  /^qwerty\d*$/i,
  /^letme\w*$/i,
  /^welcome\d*$/i,
]

// List of commonly used passwords (top 1000)
const COMMON_PASSWORDS = new Set([
  'password',
  'password123',
  '123456',
  'qwerty',
  // ... add more common passwords
])

export class PasswordPolicyService {
  private policy: PasswordPolicy
  private cache: typeof cache

  constructor(policy: Partial<PasswordPolicy> = {}) {
    this.policy = { ...DEFAULT_POLICY, ...policy }
    this.cache = cache
  }

  async validatePassword(
    password: string,
    userId: string,
    isNewUser = false
  ): Promise<PasswordStrength> {
    const feedback: string[] = []
    let score = 100

    // Check length
    if (password.length < this.policy.minLength) {
      feedback.push(`Password must be at least ${this.policy.minLength} characters long`)
      score -= 20
    }

    // Check character requirements
    if (this.policy.requireUppercase && !/[A-Z]/.test(password)) {
      feedback.push('Password must contain at least one uppercase letter')
      score -= 15
    }

    if (this.policy.requireLowercase && !/[a-z]/.test(password)) {
      feedback.push('Password must contain at least one lowercase letter')
      score -= 15
    }

    if (this.policy.requireNumbers && !/\d/.test(password)) {
      feedback.push('Password must contain at least one number')
      score -= 15
    }

    if (this.policy.requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
      feedback.push('Password must contain at least one special character')
      score -= 15
    }

    // Check for common patterns
    if (COMMON_PATTERNS.some(pattern => pattern.test(password))) {
      feedback.push('Password contains a common pattern')
      score -= 25
    }

    // Check against common passwords
    if (COMMON_PASSWORDS.has(password.toLowerCase())) {
      feedback.push('Password is too common')
      score -= 50
    }

    // Check password entropy
    const entropy = this.calculatePasswordEntropy(password)
    if (entropy < 50) {
      feedback.push('Password is not complex enough')
      score -= Math.min(30, (50 - entropy))
    }

    // Check previous passwords if not a new user
    if (!isNewUser) {
      const isReused = await this.checkPreviousPasswords(userId, password)
      if (isReused) {
        feedback.push(`Password was used in the last ${this.policy.preventReuse} changes`)
        score -= 50
      }
    }

    // Check for sequential characters
    if (this.hasSequentialCharacters(password)) {
      feedback.push('Password contains sequential characters')
      score -= 20
    }

    // Check for repeated characters
    if (this.hasRepeatedCharacters(password)) {
      feedback.push('Password contains too many repeated characters')
      score -= 20
    }

    // Normalize score
    score = Math.max(0, Math.min(100, score))

    return {
      score,
      feedback,
      isStrong: score >= 70 && feedback.length === 0,
    }
  }

  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex')
    const hash = createHash('sha256')
      .update(password + salt)
      .digest('hex')
    return `${salt}:${hash}`
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const [salt, hash] = hashedPassword.split(':')
    const calculatedHash = createHash('sha256')
      .update(password + salt)
      .digest('hex')
    return hash === calculatedHash
  }

  async storePasswordHistory(userId: string, hashedPassword: string): Promise<void> {
    try {
      const key = `password-history:${userId}`
      const history = await this.cache.get(key) || '[]'
      const passwords = JSON.parse(history)

      // Add new password and keep only the last N passwords
      passwords.unshift(hashedPassword)
      if (passwords.length > this.policy.preventReuse) {
        passwords.pop()
      }

      await this.cache.set(key, JSON.stringify(passwords))
    } catch (error) {
      logger.error('Error storing password history:', error)
      throw new Error('Failed to store password history')
    }
  }

  async checkPasswordExpiry(userId: string, lastChanged: Date): Promise<boolean> {
    const daysSinceChange = Math.floor(
      (Date.now() - lastChanged.getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysSinceChange <= this.policy.expiryDays
  }

  private async checkPreviousPasswords(
    userId: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      const key = `password-history:${userId}`
      const history = await this.cache.get(key) || '[]'
      const passwords = JSON.parse(history)

      // Check if the new password matches any previous passwords
      for (const hashedPassword of passwords) {
        if (await this.verifyPassword(newPassword, hashedPassword)) {
          return true
        }
      }

      return false
    } catch (error) {
      logger.error('Error checking password history:', error)
      return false
    }
  }

  private calculatePasswordEntropy(password: string): number {
    const charsets = {
      uppercase: /[A-Z]/.test(password) ? 26 : 0,
      lowercase: /[a-z]/.test(password) ? 26 : 0,
      numbers: /\d/.test(password) ? 10 : 0,
      special: /[^A-Za-z0-9]/.test(password) ? 32 : 0,
    }

    const poolSize = Object.values(charsets).reduce((sum, size) => sum + size, 0)
    return Math.log2(Math.pow(poolSize, password.length))
  }

  private hasSequentialCharacters(password: string): boolean {
    const sequences = [
      'abcdefghijklmnopqrstuvwxyz',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      '0123456789',
      'qwertyuiop',
      'asdfghjkl',
      'zxcvbnm',
    ]

    return sequences.some(seq => {
      for (let i = 0; i < seq.length - 2; i++) {
        const chunk = seq.slice(i, i + 3)
        if (password.includes(chunk)) return true
      }
      return false
    })
  }

  private hasRepeatedCharacters(password: string): boolean {
    const charCounts = new Map<string, number>()
    for (const char of password) {
      charCounts.set(char, (charCounts.get(char) || 0) + 1)
      if (charCounts.get(char)! > 3) return true
    }
    return false
  }

  // Password generation
  generateStrongPassword(): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?'

    let password = ''
    
    // Ensure at least one character from each required set
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += special[Math.floor(Math.random() * special.length)]

    // Fill remaining length with random characters
    const allChars = lowercase + uppercase + numbers + special
    while (password.length < this.policy.minLength) {
      password += allChars[Math.floor(Math.random() * allChars.length)]
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('')
  }
}

// Export singleton instance
export const passwordPolicy = new PasswordPolicyService()
export default passwordPolicy 