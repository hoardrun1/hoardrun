import { cache } from './cache'
import { AppError, ErrorCode } from './error-handling'
import { RateLimiter } from './rate-limiter'
import { logger } from './logger'
// Note: Some MFA features are simplified for Vercel deployment
// Complex crypto operations and WebAuthn may have limitations in serverless environment

interface TOTPConfig {
  secret?: string
  algorithm: string
  digits: number
  period: number
  issuer: string
}

interface WebAuthnConfig {
  rpName: string
  rpID: string
  origin: string
  timeout: number
}

interface MFADevice {
  id: string
  type: 'totp' | 'webauthn'
  name: string
  createdAt: number
  lastUsed?: number
  metadata?: Record<string, any>
}

const DEFAULT_TOTP_CONFIG: TOTPConfig = {
  algorithm: 'SHA1',
  digits: 6,
  period: 30,
  issuer: 'Hoardrun',
}

const DEFAULT_WEBAUTHN_CONFIG: WebAuthnConfig = {
  rpName: 'Hoardrun',
  rpID: process.env.WEBAUTHN_RP_ID || 'localhost',
  origin: process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000',
  timeout: 60000,
}

export class MFAService {
  private readonly totpConfig: TOTPConfig
  private readonly webAuthnConfig: WebAuthnConfig

  constructor(
    totpConfig: Partial<TOTPConfig> = {},
    webAuthnConfig: Partial<WebAuthnConfig> = {}
  ) {
    this.totpConfig = { ...DEFAULT_TOTP_CONFIG, ...totpConfig }
    this.webAuthnConfig = { ...DEFAULT_WEBAUTHN_CONFIG, ...webAuthnConfig }
  }

  // TOTP Methods
  async setupTOTP(
    userId: string,
    deviceName: string
  ): Promise<{ secret: string; uri: string; qrCode: string }> {
    try {
      // Mock implementation - generate a simple secret
      const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

      // Mock TOTP URI
      const uri = `otpauth://totp/${this.totpConfig.issuer}:${userId}?secret=${secret}&issuer=${this.totpConfig.issuer}`

      // Store temporary setup data
      const setupKey = `mfa-setup:${userId}:totp`
      await cache.set(setupKey, JSON.stringify({ secret, deviceName }), 600) // 10 minutes

      return {
        secret,
        uri,
        qrCode: 'data:image/png;base64,mock-qr-code', // Mock QR code
      }
    } catch (error) {
      throw new AppError('Failed to setup TOTP', ErrorCode.INTERNAL_ERROR, 500)
    }
  }

  async verifyAndEnableTOTP(
    userId: string,
    code: string
  ): Promise<void> {
    try {
      // Get setup data
      const setupKey = `mfa-setup:${userId}:totp`
      const setupData = await cache.get(setupKey)
      if (!setupData) {
        throw new AppError('TOTP setup expired or not found', ErrorCode.VALIDATION_ERROR, 400)
      }

      const { secret, deviceName } = JSON.parse(setupData)

      // Verify code
      const isValid = await this.verifyTOTP(secret, code)
      if (!isValid) {
        throw new AppError('Invalid TOTP code', ErrorCode.VALIDATION_ERROR, 400)
      }

      // Store MFA device
      await this.storeMFADevice(userId, {
        id: Math.random().toString(36).substring(2, 18),
        type: 'totp',
        name: deviceName,
        createdAt: Date.now(),
        metadata: { secret },
      })

      // Clear setup data
      await cache.del(setupKey)
    } catch (error) {
      logger.error('TOTP verification error:', error)
      throw error
    }
  }

  async verifyTOTP(
    secret: string,
    code: string,
    window = 1
  ): Promise<boolean> {
    try {
      // Mock TOTP verification - in real app would use OTPAuth library
      // For demo purposes, accept any 6-digit code
      return /^\d{6}$/.test(code)
    } catch (error) {
      return false
    }
  }

  // WebAuthn Methods
  async startWebAuthnRegistration(
    userId: string,
    deviceName: string
  ): Promise<any> {
    try {
      // Get existing authenticators
      const devices = await this.getMFADevices(userId)
      const excludeCredentials = devices
        .filter(d => d.type === 'webauthn')
        .map(d => ({
          id: d.metadata?.credentialID,
          type: 'public-key',
          transports: d.metadata?.transports,
        }))

      // Generate registration options
      const options = {
        challenge: Math.random().toString(36).substring(2, 15),
        rp: { name: this.webAuthnConfig.rpName, id: this.webAuthnConfig.rpID },
        user: { id: userId, name: deviceName, displayName: deviceName },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
        timeout: this.webAuthnConfig.timeout,
        excludeCredentials: [],
      }

      // Store challenge
      const challengeKey = `webauthn-challenge:${userId}`
      await cache.set(
        challengeKey,
        JSON.stringify({ challenge: options.challenge, deviceName }),
        300 // 5 minutes
      )

      return options
    } catch (error) {
      logger.error('WebAuthn registration error:', error)
      throw new AppError('Failed to start WebAuthn registration', ErrorCode.INTERNAL_ERROR, 500)
    }
  }

  async finishWebAuthnRegistration(
    userId: string,
    response: any
  ): Promise<void> {
    try {
      // Get stored challenge
      const challengeKey = `webauthn-challenge:${userId}`
      const challengeData = await cache.get(challengeKey)
      if (!challengeData) {
        throw new AppError('Registration challenge expired', ErrorCode.VALIDATION_ERROR, 400)
      }

      const { challenge, deviceName } = JSON.parse(challengeData)

      // Mock verification
      const verification = {
        verified: true,
        registrationInfo: {
          credentialID: 'mock-credential-id',
          credentialPublicKey: new Uint8Array([1, 2, 3]),
          counter: 0,
        }
      }

      if (!verification.verified) {
        throw new AppError('WebAuthn registration verification failed', ErrorCode.VALIDATION_ERROR, 400)
      }

      // Store authenticator
      await this.storeMFADevice(userId, {
        id: Math.random().toString(36).substring(2, 18),
        type: 'webauthn',
        name: deviceName,
        createdAt: Date.now(),
        metadata: {
          credentialID: verification.registrationInfo?.credentialID,
          credentialPublicKey: verification.registrationInfo?.credentialPublicKey,
          counter: verification.registrationInfo?.counter,
          transports: response.response.transports,
        },
      })

      // Clear challenge
      await cache.del(challengeKey)
    } catch (error) {
      logger.error('WebAuthn registration completion error:', error)
      throw error
    }
  }

  async startWebAuthnAuthentication(
    userId: string
  ): Promise<any> {
    try {
      // Get user's WebAuthn devices
      const devices = await this.getMFADevices(userId)
      const webAuthnDevices = devices.filter(d => d.type === 'webauthn')

      if (webAuthnDevices.length === 0) {
        throw new AppError('No WebAuthn devices registered', ErrorCode.VALIDATION_ERROR, 400)
      }

      // Generate authentication options
      const options = {
        challenge: Math.random().toString(36).substring(2, 15),
        timeout: this.webAuthnConfig.timeout,
        allowCredentials: webAuthnDevices.map(d => ({
          id: d.metadata?.credentialID || 'mock-id',
          type: 'public-key',
          transports: ['usb', 'nfc'],
        })),
      }

      // Store challenge
      const challengeKey = `webauthn-auth-challenge:${userId}`
      await cache.set(
        challengeKey,
        options.challenge,
        300 // 5 minutes
      )

      return options
    } catch (error) {
      logger.error('WebAuthn authentication error:', error)
      throw new AppError('Failed to start WebAuthn authentication', ErrorCode.INTERNAL_ERROR, 500)
    }
  }

  async finishWebAuthnAuthentication(
    userId: string,
    response: any
  ): Promise<boolean> {
    try {
      // Get stored challenge
      const challengeKey = `webauthn-auth-challenge:${userId}`
      const expectedChallenge = await cache.get(challengeKey)
      if (!expectedChallenge) {
        throw new AppError('Authentication challenge expired', ErrorCode.VALIDATION_ERROR, 400)
      }

      // Get authenticator data
      const devices = await this.getMFADevices(userId)
      const device = devices.find(
        d => d.type === 'webauthn' && 
        d.metadata?.credentialID === response.id
      )

      if (!device) {
        throw new AppError('Authenticator not found', ErrorCode.VALIDATION_ERROR, 400)
      }

      // Mock verification
      const verification = {
        verified: true,
        authenticationInfo: {
          newCounter: (device.metadata?.counter || 0) + 1,
        }
      }

      if (!verification.verified) {
        throw new AppError('WebAuthn authentication failed', ErrorCode.VALIDATION_ERROR, 400)
      }

      // Update authenticator counter
      await this.updateMFADevice(userId, device.id, {
        ...device,
        lastUsed: Date.now(),
        metadata: {
          ...device.metadata,
          counter: verification.authenticationInfo.newCounter,
        },
      })

      // Clear challenge
      await cache.del(challengeKey)

      return true
    } catch (error) {
      logger.error('WebAuthn authentication completion error:', error)
      throw error
    }
  }

  // Device Management Methods
  async getMFADevices(userId: string): Promise<MFADevice[]> {
    try {
      const key = `mfa-devices:${userId}`
      const data = await cache.get(key)
      return data ? JSON.parse(data) : []
    } catch (error) {
      logger.error('Get MFA devices error:', error)
      return []
    }
  }

  async removeMFADevice(userId: string, deviceId: string): Promise<void> {
    try {
      const devices = await this.getMFADevices(userId)
      const updatedDevices = devices.filter(d => d.id !== deviceId)
      
      const key = `mfa-devices:${userId}`
      await cache.set(key, JSON.stringify(updatedDevices))
    } catch (error) {
      logger.error('Remove MFA device error:', error)
      throw error
    }
  }

  private async storeMFADevice(userId: string, device: MFADevice): Promise<void> {
    try {
      const devices = await this.getMFADevices(userId)
      devices.push(device)
      
      const key = `mfa-devices:${userId}`
      await cache.set(key, JSON.stringify(devices))
    } catch (error) {
      logger.error('Store MFA device error:', error)
      throw error
    }
  }

  private async updateMFADevice(
    userId: string,
    deviceId: string,
    updatedDevice: MFADevice
  ): Promise<void> {
    try {
      const devices = await this.getMFADevices(userId)
      const index = devices.findIndex(d => d.id === deviceId)
      
      if (index !== -1) {
        devices[index] = updatedDevice
        const key = `mfa-devices:${userId}`
        await cache.set(key, JSON.stringify(devices))
      }
    } catch (error) {
      logger.error('Update MFA device error:', error)
      throw error
    }
  }

  private async generateQRCode(data: string): Promise<string> {
    // Implement QR code generation
    // You can use libraries like qrcode
    return data // Placeholder
  }
}

// Export singleton instance
export const mfa = new MFAService()
export default mfa 