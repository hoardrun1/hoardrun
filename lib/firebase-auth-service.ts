// Firebase Authentication Service
import { adminAuth } from './firebase-admin'
import { prisma } from './prisma'
import { logger } from './logger'
import { AppError, ErrorCode } from './error-handling'
import bcrypt from 'bcryptjs'

export interface FirebaseUser {
  uid: string
  email: string
  name?: string
  emailVerified: boolean
}

export interface SignupData {
  email: string
  password: string
  name?: string
}

export interface SigninData {
  email: string
  password: string
}

export class FirebaseAuthService {
  /**
   * Create a custom Firebase token for an existing user
   */
  async createCustomToken(userId: string, additionalClaims?: Record<string, any>): Promise<string> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        throw new AppError('User not found', ErrorCode.NOT_FOUND, 404)
      }

      // Create custom token with user data
      const customToken = await adminAuth.createCustomToken(userId, {
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        ...additionalClaims
      })

      logger.info(`Custom token created for user: ${userId}`)
      return customToken
    } catch (error) {
      logger.error('Error creating custom token:', error)
      throw new AppError('Failed to create authentication token', ErrorCode.INTERNAL_ERROR, 500)
    }
  }

  /**
   * Verify Firebase ID token and get user data
   */
  async verifyIdToken(idToken: string): Promise<FirebaseUser> {
    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken)
      
      return {
        uid: decodedToken.uid,
        email: decodedToken.email!,
        name: decodedToken.name,
        emailVerified: decodedToken.email_verified || false
      }
    } catch (error) {
      logger.error('Error verifying ID token:', error)
      throw new AppError('Invalid authentication token', ErrorCode.UNAUTHORIZED, 401)
    }
  }

  /**
   * Sign up a new user with Firebase email verification
   * Note: This creates the user but doesn't automatically send verification email
   * The client should use Firebase Client SDK to trigger automatic email sending
   */
  async signUp(data: SignupData): Promise<{ user: any; customToken: string; needsEmailVerification: boolean; verificationLink?: string }> {
    try {
      const { email, password, name } = data

      // Check if user already exists in database
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      })

      if (existingUser) {
        throw new AppError('User already exists', ErrorCode.CONFLICT, 409)
      }

      // Create user in Firebase first
      let firebaseUser
      try {
        firebaseUser = await adminAuth.createUser({
          email: email.toLowerCase(),
          password: password,
          displayName: name || email.split('@')[0],
          emailVerified: false
        })
        logger.info(`Firebase user created: ${firebaseUser.uid}`)
      } catch (firebaseError: any) {
        if (firebaseError.code === 'auth/email-already-exists') {
          throw new AppError('User already exists', ErrorCode.CONFLICT, 409)
        }
        logger.error('Firebase user creation error:', firebaseError)
        throw new AppError('Failed to create Firebase user', ErrorCode.INTERNAL_ERROR, 500)
      }

      // Hash password for local storage
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create user in database with Firebase UID
      const user = await prisma.user.create({
        data: {
          id: firebaseUser.uid, // Use Firebase UID as primary key
          email: email.toLowerCase(),
          password: hashedPassword,
          name: name || email.split('@')[0],
          emailVerified: false
        }
      })

      // Generate email verification link (for manual sending or development)
      let verificationLink
      try {
        verificationLink = await adminAuth.generateEmailVerificationLink(email.toLowerCase())
        logger.info(`Email verification link generated for: ${email}`)
      } catch (linkError) {
        logger.error('Failed to generate verification link:', linkError)
        // Don't fail the signup if link generation fails
      }

      // Create custom Firebase token
      const customToken = await this.createCustomToken(user.id, {
        emailVerified: false,
        needsVerification: true
      })

      logger.info(`New user created with Firebase integration: ${user.id}`)

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified
        },
        customToken,
        needsEmailVerification: true,
        ...(verificationLink && { verificationLink })
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      logger.error('Error in signUp:', error)
      throw new AppError('Failed to create user account', ErrorCode.INTERNAL_ERROR, 500)
    }
  }

  /**
   * Sign in existing user and create Firebase custom token
   */
  async signIn(data: SigninData): Promise<{ user: any; customToken: string }> {
    try {
      const { email, password } = data

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      })

      if (!user) {
        throw new AppError('Invalid email or password', ErrorCode.UNAUTHORIZED, 401)
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        throw new AppError('Invalid email or password', ErrorCode.UNAUTHORIZED, 401)
      }

      // Create custom Firebase token
      const customToken = await this.createCustomToken(user.id)

      logger.info(`User signed in: ${user.id}`)

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified
        },
        customToken
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      logger.error('Error in signIn:', error)
      throw new AppError('Failed to sign in', ErrorCode.INTERNAL_ERROR, 500)
    }
  }

  /**
   * Verify email with Firebase
   */
  async verifyEmail(idToken: string): Promise<{ user: any; verified: boolean }> {
    try {
      // Verify the ID token
      const decodedToken = await adminAuth.verifyIdToken(idToken)

      // Get the latest user data from Firebase
      const firebaseUser = await adminAuth.getUser(decodedToken.uid)

      // Update user in database
      const user = await prisma.user.update({
        where: { id: decodedToken.uid },
        data: {
          emailVerified: firebaseUser.emailVerified
        }
      })

      logger.info(`Email verification status updated for user: ${user.id}, verified: ${firebaseUser.emailVerified}`)

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified
        },
        verified: firebaseUser.emailVerified
      }
    } catch (error) {
      logger.error('Error verifying email:', error)
      throw new AppError('Failed to verify email', ErrorCode.INTERNAL_ERROR, 500)
    }
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(email: string): Promise<{ verificationLink: string }> {
    try {
      const verificationLink = await adminAuth.generateEmailVerificationLink(email.toLowerCase())
      logger.info(`Email verification link regenerated for: ${email}`)

      return { verificationLink }
    } catch (error) {
      logger.error('Error resending email verification:', error)
      throw new AppError('Failed to resend verification email', ErrorCode.INTERNAL_ERROR, 500)
    }
  }

  /**
   * Get or create user from Firebase token
   */
  async getOrCreateUserFromToken(idToken: string): Promise<any> {
    try {
      const firebaseUser = await this.verifyIdToken(idToken)

      // Try to find existing user
      let user = await prisma.user.findUnique({
        where: { id: firebaseUser.uid }
      })

      // Create user if doesn't exist
      if (!user) {
        user = await prisma.user.create({
          data: {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.name || firebaseUser.email.split('@')[0],
            emailVerified: firebaseUser.emailVerified,
            password: '' // Empty password for Firebase-only users
          }
        })
        logger.info(`New user created from Firebase token: ${user.id}`)
      } else {
        // Update email verification status
        user = await prisma.user.update({
          where: { id: firebaseUser.uid },
          data: {
            emailVerified: firebaseUser.emailVerified
          }
        })
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      logger.error('Error getting/creating user from token:', error)
      throw new AppError('Failed to process authentication', ErrorCode.INTERNAL_ERROR, 500)
    }
  }
}

export const firebaseAuthService = new FirebaseAuthService()
