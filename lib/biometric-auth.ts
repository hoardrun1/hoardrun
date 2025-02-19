import { cache } from './cache'
import { logger } from './logger'
import { APIError } from '@/middleware/error-handler'
import * as faceapi from 'face-api.js'
import { createHash } from 'crypto'

interface BiometricData {
  type: 'face' | 'fingerprint'
  data: string
  timestamp: number
  deviceId: string
}

interface BiometricVerificationResult {
  success: boolean
  confidence: number
  metadata?: Record<string, any>
  error?: string
}

interface FaceDescriptor {
  descriptor: Float32Array
  timestamp: number
}

export class BiometricAuthService {
  private cache: typeof cache
  private readonly FACE_MATCH_THRESHOLD = 0.6
  private readonly CACHE_DURATION = 30 * 24 * 60 * 60 // 30 days

  constructor() {
    this.cache = cache
    this.initializeFaceAPI()
  }

  private async initializeFaceAPI() {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      ])
    } catch (error) {
      logger.error('Failed to initialize face-api:', error)
      throw new APIError(500, 'Failed to initialize biometric service')
    }
  }

  async enrollFace(userId: string, imageData: string, deviceId: string): Promise<void> {
    try {
      // Validate image data
      if (!this.isValidImageData(imageData)) {
        throw new APIError(400, 'Invalid image data format')
      }

      // Detect and extract face features
      const detection = await this.detectFace(imageData)
      if (!detection) {
        throw new APIError(400, 'No face detected in the image')
      }

      // Get face descriptor
      const descriptor = await this.getFaceDescriptor(imageData)
      if (!descriptor) {
        throw new APIError(400, 'Failed to extract face features')
      }

      // Store face data
      const biometricData: BiometricData = {
        type: 'face',
        data: this.serializeDescriptor(descriptor),
        timestamp: Date.now(),
        deviceId,
      }

      await this.storeBiometricData(userId, biometricData)
      logger.info('Face enrolled successfully', { userId, deviceId })
    } catch (error) {
      logger.error('Face enrollment error:', error)
      throw error
    }
  }

  async verifyFace(
    userId: string,
    imageData: string,
    deviceId: string
  ): Promise<BiometricVerificationResult> {
    try {
      // Get stored face data
      const storedData = await this.getBiometricData(userId, 'face')
      if (!storedData) {
        throw new APIError(404, 'No enrolled face data found')
      }

      // Detect face in the new image
      const detection = await this.detectFace(imageData)
      if (!detection) {
        return {
          success: false,
          confidence: 0,
          error: 'No face detected in the verification image',
        }
      }

      // Get face descriptor for the new image
      const newDescriptor = await this.getFaceDescriptor(imageData)
      if (!newDescriptor) {
        return {
          success: false,
          confidence: 0,
          error: 'Failed to extract face features',
        }
      }

      // Compare face descriptors
      const storedDescriptor = this.deserializeDescriptor(storedData.data)
      const distance = faceapi.euclideanDistance(newDescriptor, storedDescriptor)
      const confidence = 1 - distance
      const success = confidence >= this.FACE_MATCH_THRESHOLD

      // Log verification attempt
      this.logVerificationAttempt(userId, 'face', success, {
        deviceId,
        confidence,
        timestamp: Date.now(),
      })

      return {
        success,
        confidence,
        metadata: {
          deviceId,
          lastVerification: Date.now(),
        },
      }
    } catch (error) {
      logger.error('Face verification error:', error)
      throw error
    }
  }

  async enrollFingerprint(
    userId: string,
    fingerprintData: string,
    deviceId: string
  ): Promise<void> {
    try {
      // Validate fingerprint data
      if (!this.isValidFingerprintData(fingerprintData)) {
        throw new APIError(400, 'Invalid fingerprint data format')
      }

      // Hash fingerprint data for secure storage
      const hashedData = this.hashFingerprintData(fingerprintData)

      // Store fingerprint data
      const biometricData: BiometricData = {
        type: 'fingerprint',
        data: hashedData,
        timestamp: Date.now(),
        deviceId,
      }

      await this.storeBiometricData(userId, biometricData)
      logger.info('Fingerprint enrolled successfully', { userId, deviceId })
    } catch (error) {
      logger.error('Fingerprint enrollment error:', error)
      throw error
    }
  }

  async verifyFingerprint(
    userId: string,
    fingerprintData: string,
    deviceId: string
  ): Promise<BiometricVerificationResult> {
    try {
      // Get stored fingerprint data
      const storedData = await this.getBiometricData(userId, 'fingerprint')
      if (!storedData) {
        throw new APIError(404, 'No enrolled fingerprint data found')
      }

      // Hash and compare fingerprint data
      const hashedData = this.hashFingerprintData(fingerprintData)
      const success = storedData.data === hashedData

      // Log verification attempt
      this.logVerificationAttempt(userId, 'fingerprint', success, {
        deviceId,
        timestamp: Date.now(),
      })

      return {
        success,
        confidence: success ? 1 : 0,
        metadata: {
          deviceId,
          lastVerification: Date.now(),
        },
      }
    } catch (error) {
      logger.error('Fingerprint verification error:', error)
      throw error
    }
  }

  private async detectFace(imageData: string): Promise<faceapi.FaceDetection | null> {
    const image = await faceapi.fetchImage(imageData)
    const detections = await faceapi.detectSingleFace(
      image,
      new faceapi.TinyFaceDetectorOptions()
    )
    return detections || null
  }

  private async getFaceDescriptor(imageData: string): Promise<Float32Array | null> {
    const image = await faceapi.fetchImage(imageData)
    const detection = await faceapi.detectSingleFace(image)
      .withFaceLandmarks()
      .withFaceDescriptor()

    return detection?.descriptor || null
  }

  private serializeDescriptor(descriptor: Float32Array): string {
    return Array.from(descriptor).join(',')
  }

  private deserializeDescriptor(data: string): Float32Array {
    return new Float32Array(data.split(',').map(Number))
  }

  private hashFingerprintData(data: string): string {
    return createHash('sha256').update(data).digest('hex')
  }

  private async storeBiometricData(userId: string, data: BiometricData): Promise<void> {
    const key = `biometric:${userId}:${data.type}`
    await this.cache.set(key, JSON.stringify(data), this.CACHE_DURATION)
  }

  private async getBiometricData(
    userId: string,
    type: 'face' | 'fingerprint'
  ): Promise<BiometricData | null> {
    const key = `biometric:${userId}:${type}`
    const data = await this.cache.get(key)
    return data ? JSON.parse(data) : null
  }

  private async logVerificationAttempt(
    userId: string,
    type: 'face' | 'fingerprint',
    success: boolean,
    metadata: Record<string, any>
  ): Promise<void> {
    logger.info('Biometric verification attempt', {
      userId,
      type,
      success,
      ...metadata,
    })

    // Store verification attempt in cache for rate limiting
    const key = `biometric-attempts:${userId}:${type}`
    const attempts = JSON.parse(await this.cache.get(key) || '[]')
    attempts.unshift({ success, timestamp: Date.now(), ...metadata })

    // Keep only last 10 attempts
    if (attempts.length > 10) {
      attempts.pop()
    }

    await this.cache.set(key, JSON.stringify(attempts))
  }

  private isValidImageData(data: string): boolean {
    return data.startsWith('data:image/')
  }

  private isValidFingerprintData(data: string): boolean {
    // Implement fingerprint data validation logic
    return data.length > 0
  }

  async removeBiometricData(userId: string, type: 'face' | 'fingerprint'): Promise<void> {
    const key = `biometric:${userId}:${type}`
    await this.cache.del(key)
    logger.info('Biometric data removed', { userId, type })
  }

  async getBiometricStatus(userId: string): Promise<{
    face: boolean
    fingerprint: boolean
  }> {
    const [faceData, fingerprintData] = await Promise.all([
      this.getBiometricData(userId, 'face'),
      this.getBiometricData(userId, 'fingerprint'),
    ])

    return {
      face: !!faceData,
      fingerprint: !!fingerprintData,
    }
  }
}

// Export singleton instance
export const biometricAuth = new BiometricAuthService()
export default biometricAuth 