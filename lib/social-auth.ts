import { cache } from './cache'
import { logger } from './logger'
// import { APIError } from '@/middleware/error-handler'
import { deviceFingerprint } from '@/lib/device-fingerprint'
import { fraudDetection } from '@/lib/fraud-detection'
import { generateToken } from '@/lib/jwt'
import { PrismaClient } from '@prisma/client'
import { OAuth2Client } from 'google-auth-library'
import FB from 'fb'
import { TwitterApi } from 'twitter-api-v2'
import AppleAuth from 'apple-auth'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

interface SocialProfile {
  id: string
  provider: string
  email: string
  name?: string
  picture?: string
  locale?: string
  metadata?: Record<string, any>
}

interface AuthResponse {
  user: any
  token: string
  isNewUser: boolean
}

export class SocialAuthService {
  private readonly googleClient: OAuth2Client
  private readonly facebookClient: any
  private readonly twitterClient: TwitterApi
  private readonly appleAuth: AppleAuth

  constructor() {
    // Initialize Google OAuth client
    this.googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )

    // Initialize Facebook client (mock for now)
    this.facebookClient = {
      api: async (endpoint: string, params: any) => ({
        id: 'mock-fb-id',
        email: 'mock@facebook.com',
        name: 'Mock Facebook User',
        picture: { data: { url: 'https://example.com/avatar.jpg' } },
        locale: 'en_US'
      })
    }

    // Initialize Twitter client
    this.twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    })

    // Initialize Apple Auth
    this.appleAuth = new AppleAuth({
      client_id: process.env.APPLE_CLIENT_ID!,
      team_id: process.env.APPLE_TEAM_ID!,
      key_id: process.env.APPLE_KEY_ID!,
      redirect_uri: process.env.APPLE_REDIRECT_URI!,
      scope: 'name email',
    }, process.env.APPLE_PRIVATE_KEY!, 'text')
  }

  // Google Authentication
  async handleGoogleAuth(
    token: string,
    deviceInfo: any
  ): Promise<AuthResponse> {
    try {
      // Verify Google token
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      })

      const payload = ticket.getPayload()
      if (!payload) {
        throw new Error('Invalid Google token')
      }

      const profile: SocialProfile = {
        id: payload.sub,
        provider: 'google',
        email: payload.email!,
        name: payload.name,
        picture: payload.picture,
        locale: payload.locale,
        metadata: {
          given_name: payload.given_name,
          family_name: payload.family_name,
          email_verified: payload.email_verified,
        },
      }

      return this.handleSocialProfile(profile, deviceInfo)
    } catch (error) {
      logger.error('Google authentication error:', error)
      throw new Error('Google authentication failed')
    }
  }

  // Facebook Authentication
  async handleFacebookAuth(
    accessToken: string,
    deviceInfo: any
  ): Promise<AuthResponse> {
    try {
      // Verify Facebook token
      const response = await this.facebookClient.api('me', {
        fields: ['id', 'email', 'name', 'picture', 'locale'],
        access_token: accessToken,
      })

      const profile: SocialProfile = {
        id: response.id,
        provider: 'facebook',
        email: response.email,
        name: response.name,
        picture: response.picture?.data?.url,
        locale: response.locale,
        metadata: {
          picture_type: response.picture?.data?.type,
          picture_width: response.picture?.data?.width,
          picture_height: response.picture?.data?.height,
        },
      }

      return this.handleSocialProfile(profile, deviceInfo)
    } catch (error) {
      logger.error('Facebook authentication error:', error)
      throw new Error('Facebook authentication failed')
    }
  }

  // Twitter Authentication
  async handleTwitterAuth(
    oauthToken: string,
    oauthVerifier: string,
    deviceInfo: any
  ): Promise<AuthResponse> {
    try {
      // Exchange OAuth tokens
      const { client: loggedClient } = await this.twitterClient.login(oauthVerifier)
      
      // Get user data
      const user = await loggedClient.v2.me({
        'user.fields': ['profile_image_url', 'location', 'description'],
      })

      const profile: SocialProfile = {
        id: user.data.id,
        provider: 'twitter',
        email: (user.data as any).email || `${user.data.id}@twitter.com`, // Twitter doesn't always provide email
        name: user.data.name,
        picture: user.data.profile_image_url,
        metadata: {
          username: user.data.username,
          description: user.data.description,
          location: user.data.location,
        },
      }

      return this.handleSocialProfile(profile, deviceInfo)
    } catch (error) {
      logger.error('Twitter authentication error:', error)
      throw new Error('Twitter authentication failed')
    }
  }

  // Apple Authentication
  async handleAppleAuth(
    idToken: string,
    deviceInfo: any
  ): Promise<AuthResponse> {
    try {
      // Verify Apple token
      const response = await this.appleAuth.accessToken(idToken)
      const appleUser = jwt.decode(response.id_token) as any

      const profile: SocialProfile = {
        id: appleUser.sub,
        provider: 'apple',
        email: appleUser.email,
        name: appleUser.name?.firstName 
          ? `${appleUser.name.firstName} ${appleUser.name.lastName || ''}`
          : undefined,
        metadata: {
          email_verified: appleUser.email_verified,
          is_private_email: appleUser.is_private_email,
        },
      }

      return this.handleSocialProfile(profile, deviceInfo)
    } catch (error) {
      logger.error('Apple authentication error:', error)
      throw new Error('Apple authentication failed')
    }
  }

  // Common Profile Handler
  private async handleSocialProfile(
    profile: SocialProfile,
    deviceInfo: any
  ): Promise<AuthResponse> {
    try {
      // Generate device fingerprint
      const device = await deviceFingerprint.generateFingerprint(deviceInfo)

      // Find or create user (simplified for mock)
      let user = await prisma.user.findFirst({
        where: { email: profile.email },
      })

      let isNewUser = false

      if (!user) {
        // Create new user (simplified for mock)
        user = await prisma.user.create({
          data: {
            email: profile.email,
            name: profile.name,
            profileImage: profile.picture,
            password: 'social-auth-user', // Social auth users don't need passwords
          },
        })
        isNewUser = true

        // Create social account link (simplified for mock)
        // await prisma.socialAccount.create({
        //   data: {
        //     userId: user.id,
        //     provider: profile.provider,
        //     providerId: profile.id,
        //     metadata: profile.metadata,
        //   },
        // })
      }

      // Check for suspicious activity
      const fraudCheck = await fraudDetection.checkTransaction({
        type: 'SOCIAL_AUTH',
        userId: user.id,
        amount: 0,
        deviceId: device.id,
        ip: deviceInfo.ip,
        metadata: {
          provider: profile.provider,
          email: profile.email,
        },
      })

      if (!fraudCheck.isAllowed) {
        throw new Error('Suspicious activity detected')
      }

      // Update user data (simplified for mock)
      // await prisma.user.update({
      //   where: { id: user.id },
      //   data: {
      //     // User data update would go here
      //   },
      // })

      // Generate session token
      const token = await generateToken({
        userId: user.id,
        type: 'SESSION',
        deviceId: device.id,
      }, '24h')

      // Trust device
      await deviceFingerprint.trustDevice(device.id, {
        userId: user.id,
        deviceInfo,
      })

      return {
        user,
        token,
        isNewUser,
      }
    } catch (error) {
      logger.error('Social profile handling error:', error)
      throw error
    }
  }

  // Helper Methods
  async unlinkSocialAccount(
    userId: string,
    provider: string
  ): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Prevent unlinking if it's the only authentication method (simplified for mock)
      const hasPassword = Boolean(user.password)
      // const socialAccountsCount = user.socialAccounts?.length || 0

      if (!hasPassword) {
        throw new Error('Cannot unlink the only authentication method')
      }

      // await prisma.socialAccount.deleteMany({
      //   where: {
      //     userId,
      //     provider,
      //   },
      // })
    } catch (error) {
      logger.error('Unlink social account error:', error)
      throw error
    }
  }

  async getSocialAccounts(userId: string): Promise<any[]> {
    try {
      // const accounts = await prisma.socialAccount.findMany({
      //   where: { userId },
      // })

      // return accounts.map(account => ({
      //   provider: account.provider,
      //   providerId: account.providerId,
      //   metadata: account.metadata,
      //   createdAt: account.createdAt,
      // }))
      return [] // Mock return for now
    } catch (error) {
      logger.error('Get social accounts error:', error)
      throw error
    }
  }
}

// Export singleton instance
export const socialAuth = new SocialAuthService()
export default socialAuth 