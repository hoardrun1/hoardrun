import { cache } from './cache'
import { logger } from './logger'
import { APIError } from '@/middleware/error-handler'
import { RateLimiter } from '@/lib/rate-limiter'
import * as OTPAuth from 'otpauth'
import { generateSecret } from '@/lib/crypto'
import * as base32 from 'hi-base32'
import * as cbor from 'cbor'
import { 
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import type {
  GenerateRegistrationOptionsOpts,
  GenerateAuthenticationOptionsOpts,
  VerifyRegistrationResponseOpts,
  VerifyAuthenticationResponseOpts,
} from '@simplewebauthn/server'
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/typescript-types'

interface TOTPConfig {
  secret: string
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
      // Generate secret
      const secret = base32.encode(generateSecret(20))

      // Create TOTP object
      const totp = new OTPAuth.TOTP({
        secret,
        algorithm: this.totpConfig.algorithm,
        digits: this.totpConfig.digits,
        period: this.totpConfig.period,
        issuer: this.totpConfig.issuer,
        label: userId,
      })

      // Store temporary setup data
      const setupKey = `mfa-setup:${userId}:totp`
      await cache.set(setupKey, JSON.stringify({ secret, deviceName }), 600) // 10 minutes

      return {
        secret,
        uri: totp.toString(),
        qrCode: await this.generateQRCode(totp.toString()),
      }
    } catch (error) {
      logger.error('TOTP setup error:', error)
      throw new APIError(500, 'Failed to setup TOTP', 'TOTP_SETUP_FAILED')
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
        throw new APIError(400, 'TOTP setup expired or not found', 'INVALID_SETUP')
      }

      const { secret, deviceName } = JSON.parse(setupData)

      // Verify code
      const isValid = await this.verifyTOTP(secret, code)
      if (!isValid) {
        throw new APIError(400, 'Invalid TOTP code', 'INVALID_CODE')
      }

      // Store MFA device
      await this.storeMFADevice(userId, {
        id: generateSecret(16),
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
      const totp = new OTPAuth.TOTP({
        secret,
        algorithm: this.totpConfig.algorithm,
        digits: this.totpConfig.digits,
        period: this.totpConfig.period,
      })

      return totp.validate({ token: code, window })
    } catch (error) {
      logger.error('TOTP verification error:', error)
      return false
    }
  }

  // WebAuthn Methods
  async startWebAuthnRegistration(
    userId: string,
    deviceName: string
  ): Promise<PublicKeyCredentialCreationOptions> {
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
      const options = await generateRegistrationOptions({
        rpName: this.webAuthnConfig.rpName,
        rpID: this.webAuthnConfig.rpID,
        userID: userId,
        userName: deviceName,
        timeout: this.webAuthnConfig.timeout,
        attestationType: 'none',
        excludeCredentials,
      })

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
      throw new APIError(500, 'Failed to start WebAuthn registration', 'WEBAUTHN_REGISTRATION_FAILED')
    }
  }

  async finishWebAuthnRegistration(
    userId: string,
    response: RegistrationResponseJSON
  ): Promise<void> {
    try {
      // Get stored challenge
      const challengeKey = `webauthn-challenge:${userId}`
      const challengeData = await cache.get(challengeKey)
      if (!challengeData) {
        throw new APIError(400, 'Registration challenge expired', 'CHALLENGE_EXPIRED')
      }

      const { challenge, deviceName } = JSON.parse(challengeData)

      // Verify registration
      const verification = await verifyRegistrationResponse({
        response,
        expectedChallenge: challenge,
        expectedOrigin: this.webAuthnConfig.origin,
        expectedRPID: this.webAuthnConfig.rpID,
      })

      if (!verification.verified) {
        throw new APIError(400, 'WebAuthn registration verification failed', 'VERIFICATION_FAILED')
      }

      // Store authenticator
      await this.storeMFADevice(userId, {
        id: generateSecret(16),
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
  ): Promise<PublicKeyCredentialRequestOptions> {
    try {
      // Get user's WebAuthn devices
      const devices = await this.getMFADevices(userId)
      const webAuthnDevices = devices.filter(d => d.type === 'webauthn')

      if (webAuthnDevices.length === 0) {
        throw new APIError(400, 'No WebAuthn devices registered', 'NO_DEVICES')
      }

      // Generate authentication options
      const options = await generateAuthenticationOptions({
        timeout: this.webAuthnConfig.timeout,
        allowCredentials: webAuthnDevices.map(d => ({
          id: d.metadata?.credentialID,
          type: 'public-key',
          transports: d.metadata?.transports,
        })),
        userVerification: 'preferred',
        rpID: this.webAuthnConfig.rpID,
      })

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
      throw new APIError(500, 'Failed to start WebAuthn authentication', 'WEBAUTHN_AUTH_FAILED')
    }
  }

  async finishWebAuthnAuthentication(
    userId: string,
    response: AuthenticationResponseJSON
  ): Promise<boolean> {
    try {
      // Get stored challenge
      const challengeKey = `webauthn-auth-challenge:${userId}`
      const expectedChallenge = await cache.get(challengeKey)
      if (!expectedChallenge) {
        throw new APIError(400, 'Authentication challenge expired', 'CHALLENGE_EXPIRED')
      }

      // Get authenticator data
      const devices = await this.getMFADevices(userId)
      const device = devices.find(
        d => d.type === 'webauthn' && 
        d.metadata?.credentialID === response.id
      )

      if (!device) {
        throw new APIError(400, 'Authenticator not found', 'DEVICE_NOT_FOUND')
      }

      // Verify authentication
      const verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge,
        expectedOrigin: this.webAuthnConfig.origin,
        expectedRPID: this.webAuthnConfig.rpID,
        authenticator: {
          credentialID: device.metadata?.credentialID,
          credentialPublicKey: device.metadata?.credentialPublicKey,
          counter: device.metadata?.counter,
        },
      })

      if (!verification.verified) {
        throw new APIError(400, 'WebAuthn authentication failed', 'VERIFICATION_FAILED')
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