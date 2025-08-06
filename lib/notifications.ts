import { sendEmail } from './email-service';
import { MomoLogger } from './logger/momo-logger';

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

    // Send email notifications
    if (channels.includes('EMAIL') && recipients.email?.length) {
      for (const email of recipients.email) {
        try {
          await sendEmail(
            email,
            `Alert: ${severity} Severity`,
            `
              <h2>System Alert</h2>
              <p><strong>Severity:</strong> ${severity}</p>
              <p><strong>Message:</strong> ${message}</p>
              <p><strong>Time:</strong> ${new Date().toISOString()}</p>
              ${metadata ? `<p><strong>Details:</strong> <pre>${JSON.stringify(metadata, null, 2)}</pre></p>` : ''}
            `,
            `Alert: ${message}\nSeverity: ${severity}\nTime: ${new Date().toISOString()}`
          );
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
  
  await sendEmail(
    email,
    'Account Recovery Request',
    `
      <h1>Account Recovery</h1>
      <p>You requested account recovery. Click the link below to recover your account:</p>
      <p><a href="${recoveryUrl}" style="color: #007bff; text-decoration: none;">Recover Account</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this recovery, please ignore this email.</p>
    `,
    `Account Recovery: ${recoveryUrl}`
  );
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
  
  await sendEmail(
    email,
    'Password Reset Request',
    `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${resetUrl}" style="color: #007bff; text-decoration: none;">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this reset, please ignore this email.</p>
    `,
    `Password Reset: ${resetUrl}`
  );
}

export async function sendInvestmentNotification(email: string, type: string, details: any): Promise<void> {
  await sendEmail(
    email,
    `Investment ${type}`,
    `
      <h1>Investment Notification</h1>
      <p><strong>Type:</strong> ${type}</p>
      <p><strong>Details:</strong></p>
      <pre>${JSON.stringify(details, null, 2)}</pre>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    `,
    `Investment ${type}: ${JSON.stringify(details)}`
  );
}

export async function sendTransactionAlert(email: string, transaction: any): Promise<void> {
  await sendEmail(
    email,
    'Transaction Alert',
    `
      <h1>Transaction Alert</h1>
      <p>A transaction has been processed on your account:</p>
      <p><strong>Amount:</strong> ${transaction.amount}</p>
      <p><strong>Type:</strong> ${transaction.type}</p>
      <p><strong>Status:</strong> ${transaction.status}</p>
      <p><strong>Time:</strong> ${new Date(transaction.timestamp).toLocaleString()}</p>
    `,
    `Transaction Alert: ${transaction.type} of ${transaction.amount}`
  );
}

export async function sendSecurityAlert(email: string, alertType: string, details: any): Promise<void> {
  await sendEmail(
    email,
    'Security Alert - Suspicious Activity Detected',
    `
      <h1>Security Alert</h1>
      <p>We detected suspicious activity on your account:</p>
      <p><strong>Alert Type:</strong> ${alertType}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Details:</strong> ${JSON.stringify(details, null, 2)}</p>
      <p>If this was you, you can ignore this email. Otherwise, please secure your account immediately.</p>
    `,
    `Security Alert: ${alertType}`
  );
}
