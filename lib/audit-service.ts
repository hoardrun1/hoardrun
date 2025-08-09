import { prisma } from './prisma';

export class AuditService {
  static async getUserLogs(userId: string) {
    // Mock implementation - AuditLog table doesn't exist in schema
    return [];
  }
}