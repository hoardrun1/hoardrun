import { NextResponse } from 'next/server';
// import { AppError, ErrorCode, handleError } from './error-handling';
import { logger } from './logger';
import { prisma } from './server/db';

export const handleApiError = (error: unknown) => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const status = 500;

  logger.error({
    message: errorMessage,
    status,
    stack: error instanceof Error ? error.stack : undefined,
  });

  return NextResponse.json(
    { error: { message: errorMessage, status } },
    { status }
  );
};

export const createApiHandler = (handler: Function) => {
  return async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
};

// Database helper functions
export const dbHelpers = {
  // User operations
  async createUser(data: {
    email: string;
    password: string;
    name?: string;
    phoneNumber?: string;
  }) {
    return await prisma.user.create({
      data: {
        ...data,
        emailVerified: false,
      },
    });
  },

  async findUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true,
        savings: true,
        beneficiaries: true,
        transactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  },

  async findUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        accounts: true,
        savings: true,
        beneficiaries: true,
        transactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  },

  async updateUser(id: string, data: any) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  },

  // Account operations
  async createAccount(data: {
    userId: string;
    type: 'SAVINGS' | 'CHECKING' | 'INVESTMENT';
    currency?: string;
    balance?: number;
  }) {
    const accountNumber = `ACC${Date.now()}${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

    return await prisma.account.create({
      data: {
        ...data,
        number: accountNumber,
        balance: data.balance || 0,
        currency: data.currency || 'USD',
      },
    });
  },

  async getUserAccounts(userId: string) {
    return await prisma.account.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Transaction operations
  async createTransaction(data: {
    userId: string;
    accountId?: string;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'PAYMENT' | 'REFUND' | 'FEE';
    amount: number;
    description?: string;
    category?: string;
    merchant?: string;
    beneficiaryId?: string;
  }) {
    return await prisma.transaction.create({
      data: {
        ...data,
        status: 'PENDING',
      },
    });
  },

  async getUserTransactions(userId: string, limit = 50) {
    return await prisma.transaction.findMany({
      where: { userId },
      include: {
        beneficiary: true,
        Account: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  // Savings operations
  async createSavingsGoal(data: {
    userId: string;
    name: string;
    targetAmount: number;
    deadline: Date;
    category: string;
    description?: string;
    isAutoSave?: boolean;
    autoSaveAmount?: number;
  }) {
    return await prisma.savingsGoal.create({
      data: {
        ...data,
        currentAmount: 0,
        status: 'ACTIVE',
      },
    });
  },

  async getUserSavingsGoals(userId: string) {
    return await prisma.savingsGoal.findMany({
      where: { userId },
      include: {
        contributions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Beneficiary operations
  async createBeneficiary(data: {
    userId: string;
    name: string;
    accountNumber: string;
    bankName: string;
    bankCode?: string;
    email?: string;
    phoneNumber?: string;
  }) {
    return await prisma.beneficiary.create({
      data: {
        ...data,
        isActive: true,
      },
    });
  },

  async getUserBeneficiaries(userId: string) {
    return await prisma.beneficiary.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Database connection test
  async testConnection() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { success: true, message: 'Database connection successful' };
    } catch (error) {
      logger.error('Database connection failed:', error);
      return { success: false, message: 'Database connection failed', error };
    }
  },

  // Database cleanup (for development)
  async disconnect() {
    await prisma.$disconnect();
  },
};