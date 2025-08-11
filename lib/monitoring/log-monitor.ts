import { MomoLogger } from '../logger/momo-logger';
import { sendAlert } from '../notifications';
import { prisma } from '../prisma';

export class LogMonitor {
  private static readonly ERROR_THRESHOLD = 5; // Number of errors within timeframe
  private static readonly ERROR_TIMEFRAME = 5 * 60 * 1000; // 5 minutes
  private static readonly errorCounts = new Map<string, number[]>();

  static async monitorPaymentErrors(error: Error, context: any): Promise<void> {
    const now = Date.now();
    const errorKey = `payment_${context.type}`;
    
    // Get existing errors within timeframe
    let errors = this.errorCounts.get(errorKey) || [];
    errors = errors.filter(timestamp => now - timestamp < this.ERROR_TIMEFRAME);
    errors.push(now);
    this.errorCounts.set(errorKey, errors);

    // Check if threshold exceeded
    if (errors.length >= this.ERROR_THRESHOLD) {
      await this.handleErrorThresholdExceeded(errorKey, errors.length);
    }

    // Log to database (mock - errorLog table doesn't exist)
    console.log('Payment error logged:', {
      type: 'PAYMENT_ERROR',
      message: error.message,
      stack: error.stack,
      context: context,
      timestamp: new Date()
    });
  }

  private static async handleErrorThresholdExceeded(errorKey: string, count: number): Promise<void> {
    await sendAlert({
      channels: ['SMS', 'EMAIL', 'SLACK'],
      message: `High error rate detected: ${count} ${errorKey} errors in last 5 minutes`,
      recipients: {
        sms: process.env.ALERT_PHONE_NUMBERS?.split(',') || [],
        email: process.env.ALERT_EMAIL_ADDRESSES?.split(',') || [],
        slack: process.env.ALERT_SLACK_WEBHOOK
      },
      severity: 'HIGH'
    });
  }
}