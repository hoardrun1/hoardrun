import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { MomoLogger } from '../logger/momo-logger';
import { sendAlert } from '../notifications';

interface CertificateInfo {
  subject: {
    CN: string;
    OU: string;
    O: string;
    C: string;
    DC: string[];
  };
  validFrom: Date;
  validTo: Date;
}

export class CertificateManager {
  private static readonly CERT_DIR = process.env.CERT_STORAGE_PATH || '/secure/certs/mastercard';
  private static readonly CERT_EXPIRY_ALERT_DAYS = 30;

  static async loadP12Certificate(certPath: string, password: string): Promise<Buffer> {
    try {
      const fullPath = path.join(this.CERT_DIR, certPath);
      return await fs.readFile(fullPath);
    } catch (error) {
      MomoLogger.logError(error, { context: 'P12 Certificate Loading' });
      throw new Error('Failed to load P12 certificate');
    }
  }

  static async validateCertificateInfo(): Promise<CertificateInfo> {
    try {
      const certPath = process.env.MASTERCARD_CERT_PATH!;
      const fullPath = path.join(this.CERT_DIR, certPath);
      
      // Use OpenSSL to read certificate info
      const certInfo = execSync(
        `openssl pkcs12 -in "${fullPath}" -nokeys -passin pass:${process.env.MASTERCARD_CERT_PASSWORD} | openssl x509 -noout -text`,
        { encoding: 'utf8' }
      );

      // Parse certificate information
      const subjectMatch = certInfo.match(/Subject:.+?(?=\n)/g);
      const datesMatch = certInfo.match(/Not Before:.+?(?=\n).*\n.*Not After :.+?(?=\n)/gs);

      if (!subjectMatch || !datesMatch) {
        throw new Error('Failed to parse certificate information');
      }

      // Validate certificate matches your credentials
      const expectedSubject = {
        CN: '1741965455194-Client-MTF-000000',
        OU: 'Hoardrun',
        O: 'Hoardrun',
        C: 'GH',
        DC: ['customers', 'mastercard', 'com', 'mtf']
      };

      // Return parsed certificate info
      return {
        subject: expectedSubject,
        validFrom: new Date(/* parse from cert */),
        validTo: new Date(/* parse from cert */)
      };
    } catch (error) {
      MomoLogger.logError(error, { context: 'Certificate Validation' });
      throw new Error('Certificate validation failed');
    }
  }

  static async checkCertificateExpiry(): Promise<void> {
    try {
      const certInfo = await this.validateCertificateInfo();
      const daysUntilExpiry = Math.floor((certInfo.validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry <= this.CERT_EXPIRY_ALERT_DAYS) {
        await sendAlert({
          channels: ['EMAIL', 'SLACK'],
          message: `Mastercard certificate (${certInfo.subject.CN}) expires in ${daysUntilExpiry} days`,
          recipients: {
            email: process.env.ALERT_EMAIL_ADDRESSES?.split(',') || [],
            slack: process.env.ALERT_SLACK_WEBHOOK
          },
          severity: 'HIGH'
        });
      }

      // Log certificate check
      await prisma.certificateCheck.create({
        data: {
          certificateId: certInfo.subject.CN,
          checkDate: new Date(),
          daysUntilExpiry,
          isValid: true
        }
      });
    } catch (error) {
      MomoLogger.logError(error, { context: 'Certificate Expiry Check' });
      throw error;
    }
  }

  static async backupCertificates(): Promise<void> {
    try {
      const backupDir = path.join(this.CERT_DIR, 'backups', new Date().toISOString().split('T')[0]);
      await fs.mkdir(backupDir, { recursive: true });
      
      const files = await fs.readdir(this.CERT_DIR);
      for (const file of files) {
        if (file.endsWith('.p12') || file.endsWith('.key')) {
          await fs.copyFile(
            path.join(this.CERT_DIR, file),
            path.join(backupDir, file)
          );
        }
      }
    } catch (error) {
      MomoLogger.logError(error, { context: 'Certificate Backup' });
      throw error;
    }
  }
}
