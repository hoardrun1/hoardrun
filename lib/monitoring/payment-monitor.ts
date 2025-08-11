import { MomoLogger } from '../logger/momo-logger';
import { sendAlert } from '../notifications';
import { prisma } from '../prisma';

export class PaymentMonitor {
  private static readonly FAILURE_THRESHOLD = 3; // consecutive failures
  private static readonly FAILURE_WINDOW = 15 * 60 * 1000; // 15 minutes

  static async monitorPaymentFailures(): Promise<void> {
    try {
      const recentFailures = await prisma.transaction.findMany({
        where: {
          status: 'FAILED',
          createdAt: {
            gte: new Date(Date.now() - this.FAILURE_WINDOW)
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: this.FAILURE_THRESHOLD
      });

      if (recentFailures.length >= this.FAILURE_THRESHOLD) {
        await this.handleConsecutiveFailures(recentFailures);
      }
    } catch (error) {
      MomoLogger.logError(error as Error, { context: 'Payment Failure Monitoring' });
    }
  }

  private static async handleConsecutiveFailures(failures: any[]): Promise<void> {
    const errorTypes = failures.map(f => f.errorType).join(', ');
    
    await sendAlert({
      channels: ['SMS', 'EMAIL', 'SLACK'],
      message: `Multiple payment failures detected: ${failures.length} consecutive failures. Error types: ${errorTypes}`,
      recipients: {
        sms: process.env.ALERT_PHONE_NUMBERS?.split(',') || [],
        email: process.env.ALERT_EMAIL_ADDRESSES?.split(',') || [],
        slack: process.env.ALERT_SLACK_WEBHOOK
      },
      severity: 'HIGH'
    });
  }
}