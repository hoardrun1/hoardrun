import { prisma } from './prisma';
import { cache } from './cache';
import { NotificationService } from './notifications';
import { FraudDetectionService } from './fraud-detection';
import { z } from 'zod';

const accountLimitsSchema = z.object({
  dailyTransferLimit: z.number().min(0),
  monthlyTransferLimit: z.number().min(0),
  singleTransactionLimit: z.number().min(0),
  withdrawalLimit: z.number().min(0),
});

export class AccountManager {
  private fraudDetection: FraudDetectionService;

  constructor() {
    this.fraudDetection = new FraudDetectionService();
  }

  private getDateRange(period: string): Date {
    const now = new Date();
    switch (period) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  private calculateInflow(transactions: any[]): number {
    return transactions
      .filter(t => t.type === 'DEPOSIT')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  private calculateOutflow(transactions: any[]): number {
    return transactions
      .filter(t => t.type === 'WITHDRAWAL')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  private async calculateAverageBalance(accountId: string, period: string): Promise<number> {
    // Mock implementation - in real app would calculate from balance history
    return 5000;
  }

  private getCategoryBreakdown(transactions: any[]): any {
    const breakdown: any = {};
    transactions.forEach(t => {
      if (t.category) {
        breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
      }
    });
    return breakdown;
  }



  private async predictNextMonthBalance(account: any): Promise<number> {
    // Mock implementation
    return account.balance + 500;
  }

  private async detectUnusualActivity(transactions: any[]): Promise<any[]> {
    // Mock implementation
    return [];
  }

  async createAccount(userId: string, type: 'SAVINGS' | 'CHECKING' | 'INVESTMENT') {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { accounts: true },
    });

    if (!user) throw new Error('User not found');

    // Check if user is verified for investment account
    if (type === 'INVESTMENT' && !user.emailVerified) {
      throw new Error('User must be verified to open an investment account');
    }

    const account = await prisma.account.create({
      data: {
        type,
        userId,
        accountNumber: await this.generateAccountNumber(),
        status: 'ACTIVE',
        balance: 0,
        currency: 'USD',
        limits: this.getDefaultLimits(type),
      },
    });

    await NotificationService.sendAccountNotification(userId, {
      type: 'ACCOUNT_CREATED',
      accountId: account.id,
    });

    return account;
  }

  async updateAccountLimits(accountId: string, limits: z.infer<typeof accountLimitsSchema>) {
    return await prisma.$transaction(async (tx: any) => {
      const account = await tx.account.findUnique({
        where: { id: accountId },
        include: { user: true }
      });

      if (!account) throw new Error('Account not found');

      // Validate against user's verification status
      if (limits.dailyTransferLimit > 50000 && !account.user.isVerified) {
        throw new Error('Higher limits require account verification');
      }

      const validated = accountLimitsSchema.parse(limits);
      
      const updated = await tx.account.update({
        where: { id: accountId },
        data: { 
          limits: validated,
          lastLimitUpdateAt: new Date(),
          limitUpdateHistory: {
            create: {
              oldLimits: account.limits,
              newLimits: validated,
              reason: 'USER_REQUEST'
            }
          }
        }
      });

      await NotificationService.sendAccountNotification(account.userId, {
        type: 'LIMITS_UPDATED',
        accountId,
        limits: validated,
      });

      return updated;
    });
  }

  async freezeAccount(accountId: string, reason: string) {
    const account = await prisma.account.update({
      where: { id: accountId },
      data: { 
        status: 'FROZEN',
        statusReason: reason,
        statusChangedAt: new Date(),
      },
    });

    await NotificationService.sendUrgentNotification(account.userId, {
      type: 'ACCOUNT_FROZEN',
      accountId,
      reason,
    });

    return account;
  }

  async getAccountAnalytics(accountId: string, period: 'day' | 'week' | 'month' | 'year') {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: {
        transactions: {
          where: {
            createdAt: {
              gte: this.getDateRange(period),
            },
          },
        },
      },
    });

    if (!account) throw new Error('Account not found');

    // Cache analytics results
    const cacheKey = `analytics:${accountId}:${period}`;
    const cached = await cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const transactions = (account as any).transactions || [];

    const analytics = {
      totalInflow: this.calculateInflow(transactions),
      totalOutflow: this.calculateOutflow(transactions),
      averageBalance: await this.calculateAverageBalance(accountId, period),
      transactionVolume: transactions.length,
      categoryBreakdown: this.getCategoryBreakdown(transactions),
      riskMetrics: await this.calculateRiskMetrics(account),
      predictedBalance: await this.predictNextMonthBalance(account),
      unusualActivity: await this.detectUnusualActivity(transactions),
    };

    // Cache for 1 hour
    await cache.set(cacheKey, JSON.stringify(analytics), 3600);
    return analytics;
  }

  private async generateAccountNumber(): Promise<string> {
    const prefix = 'HR';
    const timestamp = Date.now().toString(36).slice(-4);
    const random = Math.random().toString(36).slice(-6).toUpperCase();
    const checksum = this.generateChecksum(`${prefix}${timestamp}${random}`);
    const accountNumber = `${prefix}${timestamp}${random}${checksum}`;
    
    // Batch check for existing numbers
    const existing = await prisma.account.findFirst({
      where: { accountNumber }
    });
    
    return existing ? this.generateAccountNumber() : accountNumber;
  }

  private generateChecksum(input: string): string {
    return input.split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
      .toString(36)
      .slice(-2)
      .toUpperCase();
  }

  private getDefaultLimits(accountType: string) {
    const baseLimits = {
      INVESTMENT: {
        dailyTransferLimit: 50000,
        monthlyTransferLimit: 500000,
        singleTransactionLimit: 25000,
        withdrawalLimit: 100000,
        tradingLimit: 200000,
        marginLimit: 50000,
      },
      SAVINGS: {
        dailyTransferLimit: 10000,
        monthlyTransferLimit: 100000,
        singleTransactionLimit: 5000,
        withdrawalLimit: 20000,
        savingsGoalLimit: 1000000,
        autoSaveLimit: 5000,
      },
      CHECKING: {
        dailyTransferLimit: 20000,
        monthlyTransferLimit: 200000,
        singleTransactionLimit: 10000,
        withdrawalLimit: 50000,
        overdraftLimit: 1000,
        billPayLimit: 10000,
      },
    };

    return (baseLimits as any)[accountType] || baseLimits.CHECKING;
  }

  private async calculateRiskMetrics(account: any) {
    const transactions = (account as any).transactions || [];
    return {
      volatility: this.calculateVolatility(transactions),
      overdraftFrequency: this.calculateOverdraftFrequency(transactions),
      largeTransactionRatio: this.calculateLargeTransactionRatio(transactions),
    };
  }

  private calculateVolatility(transactions: any[]): number {
    // Mock implementation
    return 0.1;
  }

  private calculateOverdraftFrequency(transactions: any[]): number {
    // Mock implementation
    return 0;
  }

  private calculateLargeTransactionRatio(transactions: any[]): number {
    // Mock implementation
    return 0.05;
  }
}
