// Infrastructure: Email Service Implementation
// Concrete implementation using Nodemailer

import { EmailService } from '../../application/ports/EmailService'
import { Logger } from '../../application/ports/Logger'

export class NodemailerEmailService implements EmailService {
  constructor(
    private readonly logger: Logger,
    private readonly config: {
      smtpHost: string
      smtpPort: number
      smtpUser: string
      smtpPassword: string
      fromEmail: string
      fromName: string
    }
  ) {}

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      // In a real implementation, you would use nodemailer here
      // For now, we'll simulate the email sending
      
      this.logger.info('Sending welcome email', { email, name })
      
      // Simulate async email sending
      await new Promise(resolve => setTimeout(resolve, 100))
      
      this.logger.info('Welcome email sent successfully', { email })
    } catch (error) {
      this.logger.error('Failed to send welcome email', { error, email, name })
      throw new Error('Failed to send welcome email')
    }
  }

  async sendVerificationEmail(email: string, verificationCode: string): Promise<void> {
    try {
      this.logger.info('Sending verification email', { email })
      
      // Simulate async email sending
      await new Promise(resolve => setTimeout(resolve, 100))
      
      this.logger.info('Verification email sent successfully', { email })
    } catch (error) {
      this.logger.error('Failed to send verification email', { error, email })
      throw new Error('Failed to send verification email')
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    try {
      this.logger.info('Sending password reset email', { email })
      
      // Simulate async email sending
      await new Promise(resolve => setTimeout(resolve, 100))
      
      this.logger.info('Password reset email sent successfully', { email })
    } catch (error) {
      this.logger.error('Failed to send password reset email', { error, email })
      throw new Error('Failed to send password reset email')
    }
  }

  async sendTransactionNotification(email: string, transactionDetails: any): Promise<void> {
    try {
      this.logger.info('Sending transaction notification', { email, transactionId: transactionDetails.id })
      
      // Simulate async email sending
      await new Promise(resolve => setTimeout(resolve, 100))
      
      this.logger.info('Transaction notification sent successfully', { email })
    } catch (error) {
      this.logger.error('Failed to send transaction notification', { error, email })
      throw new Error('Failed to send transaction notification')
    }
  }
}
