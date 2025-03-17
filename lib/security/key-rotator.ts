import { prisma } from '../prisma';
import { MomoLogger } from '../logger/momo-logger';
import { sendAlert } from '../notifications';

export class ApiKeyRotator {
  private static readonly KEY_ROTATION_INTERVAL = 90; // days
  private static readonly WARNING_DAYS = 14; // days before expiry

  static async checkKeyRotation(): Promise<void> {
    try {
      const keys = await prisma.apiKey.findMany({
        where: {
          provider: 'MASTERCARD',
          isActive: true
        }
      });

      for (const key of keys) {
        const daysSinceCreation = Math.floor(
          (Date.now() - key.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceCreation >= this.KEY_ROTATION_INTERVAL) {
          await this.rotateKey(key.id);
        } else if (daysSinceCreation >= (this.KEY_ROTATION_INTERVAL - this.WARNING_DAYS)) {
          await this.sendRotationWarning(key.id, this.KEY_ROTATION_INTERVAL - daysSinceCreation);
        }
      }
    } catch (error) {
      MomoLogger.logError(error, { context: 'API Key Rotation' });
    }
  }

  private static async rotateKey(keyId: string): Promise<void> {
    // Implement key rotation logic here
    await sendAlert({
      channels: ['EMAIL', 'SLACK'],
      message: `API Key ${keyId} requires immediate rotation`,
      recipients: {
        email: process.env.ALERT_EMAIL_ADDRESSES?.split(',') || [],
        slack: process.env.ALERT_SLACK_WEBHOOK
      },
      severity: 'HIGH'
    });
  }

  private static async sendRotationWarning(keyId: string, daysRemaining: number): Promise<void> {
    await sendAlert({
      channels: ['EMAIL'],
      message: `API Key ${keyId} needs rotation in ${daysRemaining} days`,
      recipients: {
        email: process.env.ALERT_EMAIL_ADDRESSES?.split(',') || []
      },
      severity: 'MEDIUM'
    });
  }
}