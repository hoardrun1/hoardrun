import { prisma } from '../prisma';
import { createCipheriv, randomBytes } from 'crypto';
import { MomoLogger } from '../logger/momo-logger';
import { sendAlert } from '../notifications';
import fs from 'fs/promises';
import path from 'path';

export class BackupService {
  private static readonly BACKUP_PATH = process.env.BACKUP_STORAGE_PATH || '/var/backups/vogood';
  private static readonly RETENTION_DAYS = Number(process.env.BACKUP_RETENTION_DAYS) || 30;
  private static readonly ENCRYPTION_KEY = process.env.BACKUP_ENCRYPTION_KEY || '';

  static async createBackup(): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `backup-${timestamp}.enc`;
      const backupPath = path.join(this.BACKUP_PATH, backupFileName);

      // Get database dump
      const data = await prisma.$queryRaw`SELECT * FROM pg_dump_all()`;
      
      // Encrypt backup
      const iv = randomBytes(16);
      const cipher = createCipheriv('aes-256-gcm', Buffer.from(this.ENCRYPTION_KEY), iv);
      const encrypted = Buffer.concat([cipher.update(JSON.stringify(data)), cipher.final()]);

      // Save backup
      await fs.mkdir(this.BACKUP_PATH, { recursive: true });
      await fs.writeFile(backupPath, encrypted);

      // Log backup creation
      MomoLogger.logBackup({
        type: 'BACKUP_CREATED',
        status: 'SUCCESS',
        path: backupPath,
        timestamp: new Date(),
      });

      // Clean old backups
      await this.cleanOldBackups();
    } catch (error) {
      MomoLogger.logBackup({
        type: 'BACKUP_FAILED',
        status: 'ERROR',
        error: error.message,
        timestamp: new Date(),
      });

      await sendAlert({
        channels: ['EMAIL'],
        message: `Backup failed: ${error.message}`,
        recipients: {
          email: process.env.ALERT_EMAIL_ADDRESSES?.split(',') || [],
        },
      });
    }
  }

  private static async cleanOldBackups(): Promise<void> {
    const files = await fs.readdir(this.BACKUP_PATH);
    const now = new Date();

    for (const file of files) {
      const filePath = path.join(this.BACKUP_PATH, file);
      const stats = await fs.stat(filePath);
      const daysOld = (now.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);

      if (daysOld > this.RETENTION_DAYS) {
        await fs.unlink(filePath);
        MomoLogger.logBackup({
          type: 'BACKUP_DELETED',
          status: 'SUCCESS',
          path: filePath,
          timestamp: new Date(),
        });
      }
    }
  }
}