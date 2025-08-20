// AWS Cognito Authentication Service
import { 
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminConfirmSignUpCommand,
  AdminGetUserCommand,
  ResendConfirmationCodeCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  SignUpCommand,
  AdminInitiateAuthCommand,
  AuthFlowType
} from '@aws-sdk/client-cognito-identity-provider'
import { cognitoClient, cognitoConfig } from './aws-cognito-config'
import { prisma } from './prisma'
import { logger } from './logger'
import { AppError, ErrorCode } from './error-handling'
import bcrypt from 'bcryptjs'

export interface CognitoSignupData {
  email: string
  password: string
  name?: string
}

export interface CognitoSigninData {
  email: string
  password: string
}

export interface CognitoUser {
  id: string
  email: string
  name?: string
  emailVerified: boolean
  cognitoUsername: string
}

export class CognitoAuthService {
  /**
   * Sign up a new user with AWS Cognito
   */
  async signUp(data: CognitoSignupData): Promise<{ user: any; needsVerification: boolean; session?: string }> {
    try {
      const { email, password, name } = data

      // Check if user already exists in database
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      })

      if (existingUser) {
        throw new AppError('User already exists', ErrorCode.CONFLICT, 409)
      }

      // Sign up user in Cognito
      const signUpCommand = new SignUpCommand({
        ClientId: cognitoConfig.clientId,
        Username: email.toLowerCase(),
        Password: password,
        UserAttributes: [
          {
            Name: 'email',
            Value: email.toLowerCase()
          },
          ...(name ? [{
            Name: 'name',
            Value: name
          }] : [])
        ]
      })

      const cognitoResponse = await cognitoClient.send(signUpCommand)
      logger.info(`Cognito user created: ${cognitoResponse.UserSub}`)

      // Hash password for local storage (backup)
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create user in database
      const user = await prisma.user.create({
        data: {
          id: cognitoResponse.UserSub!, // Use Cognito UserSub as primary key
          email: email.toLowerCase(),
          password: hashedPassword,
          name: name || email.split('@')[0],
          emailVerified: false
        }
      })

      logger.info(`New user created with Cognito integration: ${user.id}`)

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
          cognitoUsername: email.toLowerCase()
        },
        needsVerification: !cognitoResponse.UserConfirmed,
        session: cognitoResponse.Session
      }
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error
      }
      
      // Handle Cognito-specific errors
      if (error.name === 'UsernameExistsException') {
        throw new AppError('User already exists', ErrorCode.CONFLICT, 409)
      } else if (error.name === 'InvalidPasswordException') {
        throw new AppError('Password does not meet requirements', ErrorCode.VALIDATION_ERROR, 400)
      } else if (error.name === 'InvalidParameterException') {
        throw new AppError('Invalid email format', ErrorCode.VALIDATION_ERROR, 400)
      }
      
      logger.error('Error in Cognito signUp:', error)
      throw new AppError('Failed to create user account', ErrorCode.INTERNAL_ERROR, 500)
    }
  }

  /**
   * Confirm user signup with verification code
   */
  async confirmSignUp(email: string, confirmationCode: string): Promise<{ user: any; confirmed: boolean }> {
    try {
      const confirmCommand = new ConfirmSignUpCommand({
        ClientId: cognitoConfig.clientId,
        Username: email.toLowerCase(),
        ConfirmationCode: confirmationCode
      })

      await cognitoClient.send(confirmCommand)
      logger.info(`User confirmed: ${email}`)

      // Update user in database
      const user = await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: { emailVerified: true }
      })

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified
        },
        confirmed: true
      }
    } catch (error: any) {
      if (error.name === 'CodeMismatchException') {
        throw new AppError('Invalid verification code', ErrorCode.VALIDATION_ERROR, 400)
      } else if (error.name === 'ExpiredCodeException') {
        throw new AppError('Verification code has expired', ErrorCode.VALIDATION_ERROR, 400)
      }
      
      logger.error('Error confirming signup:', error)
      throw new AppError('Failed to confirm signup', ErrorCode.INTERNAL_ERROR, 500)
    }
  }

  /**
   * Resend confirmation code
   */
  async resendConfirmationCode(email: string): Promise<{ codeSent: boolean }> {
    try {
      const resendCommand = new ResendConfirmationCodeCommand({
        ClientId: cognitoConfig.clientId,
        Username: email.toLowerCase()
      })

      await cognitoClient.send(resendCommand)
      logger.info(`Confirmation code resent to: ${email}`)

      return { codeSent: true }
    } catch (error: any) {
      logger.error('Error resending confirmation code:', error)
      throw new AppError('Failed to resend confirmation code', ErrorCode.INTERNAL_ERROR, 500)
    }
  }

  /**
   * Sign in user with AWS Cognito
   */
  async signIn(data: CognitoSigninData): Promise<{ user: any; accessToken: string; refreshToken: string }> {
    try {
      const { email, password } = data

      const authCommand = new InitiateAuthCommand({
        ClientId: cognitoConfig.clientId,
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        AuthParameters: {
          USERNAME: email.toLowerCase(),
          PASSWORD: password
        }
      })

      const authResponse = await cognitoClient.send(authCommand)

      if (!authResponse.AuthenticationResult) {
        throw new AppError('Authentication failed', ErrorCode.UNAUTHORIZED, 401)
      }

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      })

      if (!user) {
        throw new AppError('User not found', ErrorCode.NOT_FOUND, 404)
      }

      logger.info(`User signed in: ${user.id}`)

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified
        },
        accessToken: authResponse.AuthenticationResult.AccessToken!,
        refreshToken: authResponse.AuthenticationResult.RefreshToken!
      }
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error
      }
      
      if (error.name === 'NotAuthorizedException') {
        throw new AppError('Invalid email or password', ErrorCode.UNAUTHORIZED, 401)
      } else if (error.name === 'UserNotConfirmedException') {
        throw new AppError('Please verify your email before signing in', ErrorCode.UNAUTHORIZED, 401)
      }
      
      logger.error('Error in Cognito signIn:', error)
      throw new AppError('Failed to sign in', ErrorCode.INTERNAL_ERROR, 500)
    }
  }

  /**
   * Get user information from access token
   */
  async getUserFromToken(accessToken: string): Promise<CognitoUser> {
    try {
      // Decode the JWT token to get user info
      const payload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString())
      const cognitoUsername = payload.username
      const email = payload.email

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      })

      if (!user) {
        throw new AppError('User not found', ErrorCode.NOT_FOUND, 404)
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        cognitoUsername
      }
    } catch (error: any) {
      logger.error('Error getting user from token:', error)
      throw new AppError('Invalid access token', ErrorCode.UNAUTHORIZED, 401)
    }
  }
}

export const cognitoAuthService = new CognitoAuthService()
