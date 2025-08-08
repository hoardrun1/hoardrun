import { prisma } from '../prisma';
// Note: This service is disabled for Vercel deployment
// File system operations and crypto modules are not available in serverless environment

export class BackupService {
  static async createBackup(): Promise<void> {
    // Backup service is disabled for Vercel deployment
    // File system operations are not supported in serverless environment
    console.log('Backup service is disabled for Vercel deployment');
    throw new Error('Backup service is not available in serverless environment');

  }

  static async cleanOldBackups(): Promise<void> {
    // Cleanup service is disabled for Vercel deployment
    console.log('Backup cleanup service is disabled for Vercel deployment');
  }
}