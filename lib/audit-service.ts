import { prisma } from './prisma';

export class AuditService {
  static async getUserLogs(userId: string) {
    return prisma.$queryRaw`
      SELECT * FROM "AuditLog"
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC
    `;
  }
}