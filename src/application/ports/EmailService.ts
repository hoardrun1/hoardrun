// Port: Email Service
// Interface for sending emails

export interface EmailService {
  sendWelcomeEmail(email: string, name: string): Promise<void>
  sendVerificationEmail(email: string, verificationCode: string): Promise<void>
  sendPasswordResetEmail(email: string, resetToken: string): Promise<void>
  sendTransactionNotification(email: string, transactionDetails: any): Promise<void>
}
