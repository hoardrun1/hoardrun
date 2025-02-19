import { cache } from './cache'
import { logger } from './logger'
import { APIError } from '@/middleware/error-handler'
import { createHash } from 'crypto'
import geoip from 'geoip-lite'
import UAParser from 'ua-parser-js'

interface DeviceComponents {
  userAgent: string
  language: string
  colorDepth: number
  deviceMemory?: number
  hardwareConcurrency?: number
  screenResolution: [number, number]
  availableScreenResolution: [number, number]
  timezoneOffset: number
  timezone: string
  sessionStorage: boolean
  localStorage: boolean
  indexedDb: boolean
  addBehavior: boolean
  openDatabase: boolean
  cpuClass?: string
  platform: string
  plugins?: string[]
  canvas?: string
  webgl?: string
  webglVendorAndRenderer?: string
  adBlock?: boolean
  hasLiedLanguages?: boolean
  hasLiedResolution?: boolean
  hasLiedOs?: boolean
  hasLiedBrowser?: boolean
  touchSupport?: [number, boolean, boolean]
  fonts?: string[]
  audio?: string
}

interface DeviceInfo {
  id: string
  userId?: string
  components: DeviceComponents
  fingerprint: string
  createdAt: number
  lastSeen: number
  trustScore: number
  metadata: {
    browser: {
      name?: string
      version?: string
      engine?: string
    }
    os: {
      name?: string
      version?: string
    }
    device: {
      type?: string
      model?: string
      vendor?: string
    }
    ip?: string
    location?: {
      country?: string
      region?: string
      city?: string
    }
  }
}

interface TrustFactors {
  consistentComponents: number
  knownLocation: number
  recentActivity: number
  browserFingerprint: number
  anomalyScore: number
}

export class DeviceFingerprintService {
  private readonly TRUST_THRESHOLD = 0.7
  private readonly CACHE_DURATION = 30 * 24 * 60 * 60 // 30 days
  private readonly RECENT_ACTIVITY_WINDOW = 7 * 24 * 60 * 60 * 1000 // 7 days

  async generateFingerprint(
    components: DeviceComponents,
    userId?: string
  ): Promise<DeviceInfo> {
    try {
      // Generate fingerprint hash
      const fingerprint = this.hashComponents(components)

      // Parse user agent
      const uaParser = new UAParser(components.userAgent)
      const browser = uaParser.getBrowser()
      const os = uaParser.getOS()
      const device = uaParser.getDevice()

      // Get IP and location info
      const ip = this.getClientIP()
      const location = ip ? geoip.lookup(ip) : null

      // Create device info
      const deviceInfo: DeviceInfo = {
        id: createHash('sha256')
          .update(fingerprint + (userId || ''))
          .digest('hex'),
        userId,
        components,
        fingerprint,
        createdAt: Date.now(),
        lastSeen: Date.now(),
        trustScore: 0,
        metadata: {
          browser: {
            name: browser.name,
            version: browser.version,
            engine: uaParser.getEngine().name,
          },
          os: {
            name: os.name,
            version: os.version,
          },
          device: {
            type: device.type,
            model: device.model,
            vendor: device.vendor,
          },
          ip,
          location: location ? {
            country: location.country,
            region: location.region,
            city: location.city,
          } : undefined,
        },
      }

      // Calculate initial trust score
      deviceInfo.trustScore = await this.calculateTrustScore(deviceInfo)

      // Store device info
      await this.storeDeviceInfo(deviceInfo)

      return deviceInfo
    } catch (error) {
      logger.error('Device fingerprint generation error:', error)
      throw new APIError(500, 'Failed to generate device fingerprint')
    }
  }

  async isDeviceTrusted(deviceId: string): Promise<boolean> {
    try {
      const deviceInfo = await this.getDeviceInfo(deviceId)
      if (!deviceInfo) return false

      const trustScore = await this.calculateTrustScore(deviceInfo)
      return trustScore >= this.TRUST_THRESHOLD
    } catch (error) {
      logger.error('Device trust check error:', error)
      return false
    }
  }

  async trustDevice(deviceId: string, data: { userId: string; deviceInfo: any }): Promise<void> {
    try {
      const device = await this.getDeviceInfo(deviceId)
      if (!device) {
        throw new APIError(404, 'Device not found')
      }

      // Update device info
      device.userId = data.userId
      device.trustScore = 1
      device.lastSeen = Date.now()

      await this.storeDeviceInfo(device)
    } catch (error) {
      logger.error('Device trust error:', error)
      throw error
    }
  }

  async getDevicesByUser(userId: string): Promise<DeviceInfo[]> {
    try {
      const pattern = `device:*:${userId}`
      const keys = await cache.client.keys(pattern)
      
      const devices = await Promise.all(
        keys.map(async (key) => {
          const data = await cache.get(key)
          return data ? JSON.parse(data) : null
        })
      )

      return devices.filter(Boolean)
    } catch (error) {
      logger.error('Get user devices error:', error)
      return []
    }
  }

  async updateDeviceActivity(deviceId: string): Promise<void> {
    try {
      const device = await this.getDeviceInfo(deviceId)
      if (device) {
        device.lastSeen = Date.now()
        await this.storeDeviceInfo(device)
      }
    } catch (error) {
      logger.error('Update device activity error:', error)
    }
  }

  private async calculateTrustScore(device: DeviceInfo): Promise<number> {
    const factors = await this.evaluateTrustFactors(device)
    
    // Weight factors
    const weights = {
      consistentComponents: 0.3,
      knownLocation: 0.2,
      recentActivity: 0.2,
      browserFingerprint: 0.2,
      anomalyScore: 0.1,
    }

    // Calculate weighted average
    const score = Object.entries(factors).reduce(
      (sum, [factor, value]) => sum + value * weights[factor as keyof TrustFactors],
      0
    )

    return Math.min(Math.max(score, 0), 1)
  }

  private async evaluateTrustFactors(device: DeviceInfo): Promise<TrustFactors> {
    const factors: TrustFactors = {
      consistentComponents: 1,
      knownLocation: 0,
      recentActivity: 0,
      browserFingerprint: 1,
      anomalyScore: 1,
    }

    // Check location
    if (device.metadata.location) {
      const knownLocations = await this.getKnownLocations(device.userId)
      factors.knownLocation = knownLocations.some(
        loc => loc.country === device.metadata.location?.country
      ) ? 1 : 0.5
    }

    // Check recent activity
    const lastSeen = device.lastSeen || device.createdAt
    const timeSinceLastSeen = Date.now() - lastSeen
    factors.recentActivity = Math.max(
      0,
      1 - (timeSinceLastSeen / this.RECENT_ACTIVITY_WINDOW)
    )

    // Check for anomalies
    const anomalies = this.detectAnomalies(device)
    factors.anomalyScore = Math.max(0, 1 - (anomalies.length * 0.2))

    return factors
  }

  private detectAnomalies(device: DeviceInfo): string[] {
    const anomalies: string[] = []

    // Check for inconsistent user agent data
    const { browser, os, device: deviceMeta } = device.metadata
    const ua = new UAParser(device.components.userAgent)

    if (browser.name !== ua.getBrowser().name) {
      anomalies.push('inconsistent_browser')
    }

    if (os.name !== ua.getOS().name) {
      anomalies.push('inconsistent_os')
    }

    // Check for suspicious component values
    if (device.components.hasLiedBrowser) {
      anomalies.push('browser_spoofing')
    }

    if (device.components.hasLiedOs) {
      anomalies.push('os_spoofing')
    }

    if (device.components.hasLiedResolution) {
      anomalies.push('resolution_spoofing')
    }

    // Check for bot indicators
    if (!device.components.localStorage || !device.components.sessionStorage) {
      anomalies.push('storage_disabled')
    }

    if (typeof device.components.webgl === 'undefined') {
      anomalies.push('no_webgl')
    }

    return anomalies
  }

  private async getKnownLocations(userId?: string): Promise<Array<{ country: string }>> {
    if (!userId) return []

    try {
      const key = `known-locations:${userId}`
      const data = await cache.get(key)
      return data ? JSON.parse(data) : []
    } catch (error) {
      logger.error('Get known locations error:', error)
      return []
    }
  }

  private async storeDeviceInfo(device: DeviceInfo): Promise<void> {
    try {
      const key = `device:${device.id}${device.userId ? `:${device.userId}` : ''}`
      await cache.set(key, JSON.stringify(device), this.CACHE_DURATION)

      // Update known locations if location info exists
      if (device.userId && device.metadata.location) {
        await this.updateKnownLocations(
          device.userId,
          device.metadata.location
        )
      }
    } catch (error) {
      logger.error('Store device info error:', error)
      throw error
    }
  }

  private async updateKnownLocations(
    userId: string,
    location: { country?: string }
  ): Promise<void> {
    if (!location.country) return

    try {
      const key = `known-locations:${userId}`
      const locations = await this.getKnownLocations(userId)

      if (!locations.some(loc => loc.country === location.country)) {
        locations.push({ country: location.country })
        await cache.set(key, JSON.stringify(locations))
      }
    } catch (error) {
      logger.error('Update known locations error:', error)
    }
  }

  private async getDeviceInfo(deviceId: string): Promise<DeviceInfo | null> {
    try {
      const pattern = `device:${deviceId}*`
      const keys = await cache.client.keys(pattern)
      
      if (keys.length === 0) return null

      const data = await cache.get(keys[0])
      return data ? JSON.parse(data) : null
    } catch (error) {
      logger.error('Get device info error:', error)
      return null
    }
  }

  private hashComponents(components: DeviceComponents): string {
    const values = Object.entries(components)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, value]) => {
        if (Array.isArray(value)) {
          return value.join(',')
        }
        return String(value)
      })
      .join('|')

    return createHash('sha256').update(values).digest('hex')
  }

  private getClientIP(): string | undefined {
    // Implement IP detection logic
    // This would typically come from request headers in a real implementation
    return undefined
  }
}

// Export singleton instance
export const deviceFingerprint = new DeviceFingerprintService()
export default deviceFingerprint 