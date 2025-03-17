import { prisma } from '../prisma';
import { MomoLogger } from '../logger/momo-logger';
import { sendAlert } from '../notifications';

interface TransactionAlert {
  type: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  metadata?: any;
}

export class TransactionMonitor {
  private static readonly ALERT_THRESHOLDS = {
    LARGE_AMOUNT: Number(process.env.TRANSACTION_AMOUNT_THRESHOLD) || 5000,
    HIGH_FREQUENCY: Number(process.env.TRANSACTION_FREQUENCY_THRESHOLD) || 10,
    SUSPICIOUS_PATTERN: Number(process.env.SUSPICIOUS_PATTERN_THRESHOLD) || 0.8,
  };

  static async monitorTransaction(transaction: any): Promise<void> {
    const alerts: TransactionAlert[] = [];
    const timestamp = new Date();

    // Check for large amounts
    if (transaction.amount > this.ALERT_THRESHOLDS.LARGE_AMOUNT) {
      alerts.push({
        type: 'LARGE_AMOUNT',
        message: `Large transaction detected: ${transaction.amount}`,
        severity: 'HIGH',
        metadata: { transaction, timestamp },
      });
    }

    // Check transaction frequency
    const recentTransactions = await prisma.transaction.count({
      where: {
        userId: transaction.userId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    if (recentTransactions > this.ALERT_THRESHOLDS.HIGH_FREQUENCY) {
      alerts.push({
        type: 'HIGH_FREQUENCY',
        message: `High transaction frequency detected for user`,
        severity: 'MEDIUM',
        metadata: { userId: transaction.userId, count: recentTransactions, timestamp },
      });
    }

    // Process alerts
    for (const alert of alerts) {
      await this.processAlert(alert);
      await this.createAuditLog(transaction, alert);
    }
  }

  private static async processAlert(alert: TransactionAlert): Promise<void> {
    // Log alert
    MomoLogger.logTransaction({
      type: 'ALERT',
      status: alert.severity,
      amount: alert.metadata?.transaction?.amount,
      userId: alert.metadata?.userId,
      referenceId: alert.metadata?.transaction?.referenceId,
      metadata: alert,
      timestamp: new Date(),
    });

    // Send notifications based on severity
    if (alert.severity === 'HIGH') {
      const recipients = {
        sms: process.env.ALERT_PHONE_NUMBERS?.split(',') || [],
        email: process.env.ALERT_EMAIL_ADDRESSES?.split(',') || [],
        slack: process.env.ALERT_SLACK_WEBHOOK,
      };

      await sendAlert({
        channels: ['SMS', 'EMAIL', 'SLACK'],
        message: alert.message,
        recipients,
        metadata: alert.metadata,
      });
    }

    // Store alert in database
    await prisma.transactionAlert.create({
      data: {
        type: alert.type,
        message: alert.message,
        severity: alert.severity,
        metadata: alert.metadata,
        timestamp: new Date(),
      },
    });
  }

  private static async createAuditLog(transaction: any, alert: TransactionAlert): Promise<void> {
    await prisma.auditLog.create({
      data: {
        userId: transaction.userId,
        action: 'TRANSACTION_ALERT',
        details: JSON.stringify({
          transactionId: transaction.id,
          alertType: alert.type,
          severity: alert.severity,
          timestamp: new Date(),
        }),
      },
    });
  }
}
