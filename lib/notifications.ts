import { MomoLogger } from './logger/momo-logger';
import { apiClient } from './api-client';

export interface AlertRecipients {
  email?: string[];
  sms?: string[];
  slack?: string;
}

export interface AlertOptions {
  channels: ('EMAIL' | 'SMS' | 'SLACK')[];
  message: string;
  recipients: AlertRecipients;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
  metadata?: any;
}

export class NotificationService {
  static async sendNotification(userId: string, message: string, type: string = 'info'): Promise<void> {
    // Mock implementation
    console.log(`Notification sent to user ${userId}: ${message} (${type})`);
  }

  static async sendEmail(to: string, subject: string, body: string): Promise<void> {
    // Mock implementation
    console.log(`Email sent to ${to}: ${subject}`);
  }

  static async sendSMS(to: string, message: string): Promise<void> {
    // Mock implementation
    console.log(`SMS sent to ${to}: ${message}`);
  }

  static async sendAccountNotification(userId: string, notification: any): Promise<void> {
    // Mock implementation
    console.log(`Account notification sent to user ${userId}:`, notification);
  }

  static async sendUrgentNotification(userId: string, notification: any): Promise<void> {
    // Mock implementation
    console.log(`Urgent notification sent to user ${userId}:`, notification);
  }
}

export async function sendAlert(options: AlertOptions): Promise<void> {
  try {
    const { channels, message, recipients, severity = 'MEDIUM', metadata } = options;

    // Log the alert
    MomoLogger.logError(new Error(`Alert: ${message}`), {
      context: 'Alert System',
      severity,
      metadata,
      channels,
      recipients
    });

    // Send email notifications via backend API
    if (channels.includes('EMAIL') && recipients.email?.length) {
      for (const email of recipients.email) {
        try {
          await apiClient.createNotification({
            title: `Alert: ${severity} Severity`,
            message: `${message}\nSeverity: ${severity}\nTime: ${new Date().toISOString()}`,
            type: 'alert',
            priority: severity.toLowerCase(),
            channels: ['email'],
            metadata: { email, ...metadata }
          });
        } catch (emailError) {
          console.error('Failed to send email alert:', emailError);
        }
      }
    }

    // Send SMS notifications (placeholder - implement with your SMS provider)
    if (channels.includes('SMS') && recipients.sms?.length) {
      for (const phone of recipients.sms) {
        try {
          // TODO: Implement SMS sending logic
          console.log(`SMS Alert to ${phone}: ${message}`);
        } catch (smsError) {
          console.error('Failed to send SMS alert:', smsError);
        }
      }
    }

    // Send Slack notifications
    if (channels.includes('SLACK') && recipients.slack) {
      try {
        const slackPayload = {
          text: `🚨 ${severity} Alert`,
          attachments: [
            {
              color: severity === 'HIGH' ? 'danger' : severity === 'MEDIUM' ? 'warning' : 'good',
              fields: [
                {
                  title: 'Message',
                  value: message,
                  short: false
                },
                {
                  title: 'Severity',
                  value: severity,
                  short: true
                },
                {
                  title: 'Time',
                  value: new Date().toISOString(),
                  short: true
                }
              ]
            }
          ]
        };

        const response = await fetch(recipients.slack, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(slackPayload),
        });

        if (!response.ok) {
          throw new Error(`Slack webhook failed: ${response.statusText}`);
        }
      } catch (slackError) {
        console.error('Failed to send Slack alert:', slackError);
      }
    }

  } catch (error) {
    console.error('Failed to send alert:', error);
    // Don't throw here to prevent cascading failures
  }
}

// Specific notification functions for different use cases
export async function sendRecoveryEmail(email: string, recoveryToken: string): Promise<void> {
  const recoveryUrl = `${process.env.NEXTAUTH_URL}/recover-account?token=${recoveryToken}`;
  
  await apiClient.createNotification({
    title: 'Account Recovery Request',
    message: `You requested account recovery. Use this link: ${recoveryUrl}`,
    type: 'account_recovery',
    priority: 'high',
    channels: ['email'],
    metadata: { email, recoveryToken, recoveryUrl }
  });
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
  
  await apiClient.createNotification({
    title: 'Password Reset Request',
    message: `You requested a password reset. Use this link: ${resetUrl}`,
    type: 'password_reset',
    priority: 'high',
    channels: ['email'],
    metadata: { email, resetToken, resetUrl }
  });
}

export async function sendInvestmentNotification(email: string, type: string, details: any): Promise<void> {
  await apiClient.createNotification({
    title: `Investment ${type}`,
    message: `Investment notification: ${type}`,
    type: 'investment',
    priority: 'medium',
    channels: ['email'],
    metadata: { email, investmentType: type, details }
  });
}

export async function sendTransactionAlert(email: string, transaction: any): Promise<void> {
  await apiClient.createNotification({
    title: 'Transaction Alert',
    message: `Transaction processed: ${transaction.type} of ${transaction.amount}`,
    type: 'transaction',
    priority: 'medium',
    channels: ['email'],
    metadata: { email, transaction }
  });
}

export async function sendSecurityAlert(email: string, alertType: string, details: any): Promise<void> {
  await apiClient.createNotification({
    title: 'Security Alert - Suspicious Activity Detected',
    message: `Security alert: ${alertType}`,
    type: 'security',
    priority: 'high',
    channels: ['email'],
    metadata: { email, alertType, details }
  });
}
