import { CertificateManager } from '../security/cert-manager';
import { ApiKeyRotator } from '../security/key-rotator';
import { RateLimitMonitor } from './rate-limit-monitor';
import { PaymentMonitor } from './payment-monitor';
import { MomoLogger } from '../logger/momo-logger';

export class MonitoringScheduler {
  static initializeMonitoring(): void {
    // Certificate expiry check - daily
    setInterval(() => {
      CertificateManager.checkCertificateExpiry().catch(error => 
        MomoLogger.logError(error, { context: 'Certificate Monitoring' })
      );
    }, 24 * 60 * 60 * 1000);

    // API key rotation check - daily
    setInterval(() => {
      ApiKeyRotator.checkKeyRotation().catch(error => 
        MomoLogger.logError(error, { context: 'Key Rotation' })
      );
    }, 24 * 60 * 60 * 1000);

    // Rate limit monitoring - every 5 minutes
    setInterval(() => {
      RateLimitMonitor.monitorRateLimits().catch(error => 
        MomoLogger.logError(error, { context: 'Rate Limit Monitoring' })
      );
    }, 5 * 60 * 1000);

    // Payment failure monitoring - every minute
    setInterval(() => {
      PaymentMonitor.monitorPaymentFailures().catch(error => 
        MomoLogger.logError(error, { context: 'Payment Monitoring' })
      );
    }, 60 * 1000);
  }
}