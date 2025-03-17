import { MomoLogger } from '../logger/momo-logger';
import { sendAlert } from '../notifications';
import { prisma } from '../prisma';

export class RateLimitMonitor {
  private static readonly THRESHOLD_PERCENTAGE = 80;
  private static readonly MONITORING_INTERVAL = 5 * 60 * 1000; // 5 minutes

  static async monitorRateLimits(): Promise<void> {
    try {
      const rateLimitStats = await prisma.rateLimitLog.groupBy({
        by: ['userId'],
        _count: {
          id: true
        },
        where: {
          timestamp: {
            gte: new Date(Date.now() - this.MONITORING_INTERVAL)
          }
        }
      });

      for (const stat of rateLimitStats) {
        const usagePercentage = (stat._count.id / Number(process.env.PAYMENT_RATE_LIMIT)) * 100;
        
        if (usagePercentage >= this.THRESHOLD_PERCENTAGE) {
          await this.handleHighUsage(stat.userId, usagePercentage);
        }
      }
    } catch (error) {
      MomoLogger.logError(error, { context: 'Rate Limit Monitoring' });
    }
  }

  private static async handleHighUsage(userId: string, usagePercentage: number): Promise<void> {
    await sendAlert({
      channels: ['EMAIL', 'SLACK'],
      message: `High rate limit usage detected: User ${userId} at ${usagePercentage.toFixed(1)}%`,
      recipients: {
        email: process.env.ALERT_EMAIL_ADDRESSES?.split(',') || [],
        slack: process.env.ALERT_SLACK_WEBHOOK
      },
      severity: 'MEDIUM'
    });
  }
}