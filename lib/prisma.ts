// This file is a placeholder to avoid client-side Prisma imports
// The actual Prisma client is in lib/server/db.ts

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Create mock data objects with proper structure including relations
const mockDevice = {
  id: 'mock-device-id',
  userId: 'mock-user-id',
  fingerprint: 'mock-fingerprint',
  name: 'Mock Device',
  type: 'desktop',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockSecuritySettings = {
  id: 'mock-security-id',
  userId: 'mock-user-id',
  twoFactorEnabled: false,
  loginNotifications: true,
  deviceTracking: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockUser = {
  id: 'mock-user-id',
  email: 'mock@example.com',
  name: 'Mock User',
  emailVerified: false,
  phoneNumber: null,
  dateOfBirth: null,
  address: null,
  profileImage: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  password: 'mock-password',
  // Relations
  devices: [mockDevice],
  accounts: [],
  savingsGoals: [],
  beneficiaries: [],
  transactions: [],
  investments: [],
  payments: [],
  securitySettings: mockSecuritySettings,
  loginAttempts: [],
  verificationCodes: [],
  twoFactorCodes: []
};

const mockAccount = {
  id: 'mock-account-id',
  userId: 'mock-user-id',
  type: 'SAVINGS' as const,
  number: 'MOCK123456789',
  currency: 'USD',
  balance: 1000,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockSavingsGoal = {
  id: 'mock-savings-id',
  userId: 'mock-user-id',
  name: 'Mock Savings Goal',
  targetAmount: 5000,
  currentAmount: 1000,
  deadline: new Date(),
  category: 'Emergency',
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockBeneficiary = {
  id: 'mock-beneficiary-id',
  userId: 'mock-user-id',
  name: 'Mock Beneficiary',
  email: 'beneficiary@example.com',
  relationship: 'Friend',
  createdAt: new Date(),
  updatedAt: new Date()
};

// Additional mock objects for other models
const mockLoginAttempt = {
  id: 'mock-login-attempt-id',
  userId: 'mock-user-id',
  success: true,
  ipAddress: '127.0.0.1',
  userAgent: 'Mock User Agent',
  createdAt: new Date()
};



const mockTransaction = {
  id: 'mock-transaction-id',
  userId: 'mock-user-id',
  amount: 100,
  type: 'DEPOSIT',
  status: 'COMPLETED',
  description: 'Mock Transaction',
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockInvestment = {
  id: 'mock-investment-id',
  userId: 'mock-user-id',
  amount: 1000,
  type: 'STOCK',
  status: 'ACTIVE',
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockPayment = {
  id: 'mock-payment-id',
  userId: 'mock-user-id',
  amount: 100,
  currency: 'USD',
  status: 'COMPLETED',
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockGeneric = {
  id: 'mock-id',
  createdAt: new Date(),
  updatedAt: new Date()
};

// Create a mock object for client-side use
const mockPrismaClient = {
  // Add mock methods as needed
  user: {
    findUnique: async (args?: any) => mockUser,
    findMany: async (args?: any) => [mockUser],
    findFirst: async (args?: any) => mockUser,
    create: async (args?: any) => mockUser,
    update: async (args?: any) => mockUser,
    delete: async (args?: any) => mockUser,
    count: async (args?: any) => 1,
  },
  savingsGoal: {
    findUnique: async (args?: any) => mockSavingsGoal,
    findMany: async (args?: any) => [mockSavingsGoal],
    findFirst: async (args?: any) => mockSavingsGoal,
    create: async (args?: any) => mockSavingsGoal,
    update: async (args?: any) => mockSavingsGoal,
    delete: async (args?: any) => mockSavingsGoal,
    count: async (args?: any) => 1,
  },
  account: {
    findUnique: async (args?: any) => mockAccount,
    findMany: async (args?: any) => [mockAccount],
    findFirst: async (args?: any) => mockAccount,
    create: async (args?: any) => mockAccount,
    update: async (args?: any) => mockAccount,
    delete: async (args?: any) => mockAccount,
    count: async (args?: any) => 1,
  },
  beneficiary: {
    findUnique: async (args?: any) => mockBeneficiary,
    findMany: async (args?: any) => [mockBeneficiary],
    findFirst: async (args?: any) => mockBeneficiary,
    create: async (args?: any) => mockBeneficiary,
    update: async (args?: any) => mockBeneficiary,
    delete: async (args?: any) => mockBeneficiary,
    count: async (args?: any) => 1, // Added missing count method
  },
  loginAttempt: {
    findUnique: async (args?: any) => mockLoginAttempt,
    findMany: async (args?: any) => [mockLoginAttempt],
    findFirst: async (args?: any) => mockLoginAttempt,
    create: async (args?: any) => mockLoginAttempt,
    update: async (args?: any) => mockLoginAttempt,
    delete: async (args?: any) => mockLoginAttempt,
  },
  device: {
    findUnique: async (args?: any) => mockDevice,
    findMany: async (args?: any) => [mockDevice],
    findFirst: async (args?: any) => mockDevice,
    create: async (args?: any) => mockDevice,
    update: async (args?: any) => mockDevice,
    delete: async (args?: any) => mockDevice,
  },
  transaction: {
    findUnique: async (args?: any) => mockTransaction,
    findMany: async (args?: any) => [mockTransaction],
    findFirst: async (args?: any) => mockTransaction,
    create: async (args?: any) => mockTransaction,
    update: async (args?: any) => mockTransaction,
    delete: async (args?: any) => mockTransaction,
    count: async (args?: any) => 1,
  },
  investment: {
    findUnique: async (args?: any) => mockInvestment,
    findMany: async (args?: any) => [mockInvestment],
    findFirst: async (args?: any) => mockInvestment,
    create: async (args?: any) => mockInvestment,
    update: async (args?: any) => mockInvestment,
    delete: async (args?: any) => mockInvestment,
  },
  payment: {
    findUnique: async (args?: any) => mockPayment,
    findMany: async (args?: any) => [mockPayment],
    findFirst: async (args?: any) => mockPayment,
    create: async (args?: any) => mockPayment,
    update: async (args?: any) => mockPayment,
    delete: async (args?: any) => mockPayment,
  },
  paymentMethod: {
    findUnique: async (args?: any) => mockGeneric,
    findMany: async (args?: any) => [mockGeneric],
    findFirst: async (args?: any) => mockGeneric,
    create: async (args?: any) => mockGeneric,
    update: async (args?: any) => mockGeneric,
    delete: async (args?: any) => mockGeneric,
  },
  momoTransaction: {
    findUnique: async (args?: any) => mockGeneric,
    findMany: async (args?: any) => [mockGeneric],
    findFirst: async (args?: any) => mockGeneric,
    create: async (args?: any) => mockGeneric,
    update: async (args?: any) => mockGeneric,
    delete: async (args?: any) => mockGeneric,
  },
  systemMetric: {
    findUnique: async (args?: any) => mockGeneric,
    findMany: async (args?: any) => [mockGeneric],
    findFirst: async (args?: any) => mockGeneric,
    create: async (args?: any) => mockGeneric,
    update: async (args?: any) => mockGeneric,
    delete: async (args?: any) => mockGeneric,
  },
  twoFactorCode: {
    findUnique: async (args?: any) => mockGeneric,
    findMany: async (args?: any) => [mockGeneric],
    findFirst: async (args?: any) => mockGeneric,
    create: async (args?: any) => mockGeneric,
    update: async (args?: any) => mockGeneric,
    delete: async (args?: any) => mockGeneric,
  },
  verificationCode: {
    findUnique: async (args?: any) => mockGeneric,
    findMany: async (args?: any) => [mockGeneric],
    findFirst: async (args?: any) => mockGeneric,
    create: async (args?: any) => mockGeneric,
    update: async (args?: any) => mockGeneric,
    delete: async (args?: any) => mockGeneric,
  },
  securitySettings: {
    findUnique: async (args?: any) => mockSecuritySettings,
    findMany: async (args?: any) => [mockSecuritySettings],
    findFirst: async (args?: any) => mockSecuritySettings,
    create: async (args?: any) => mockSecuritySettings,
    update: async (args?: any) => mockSecuritySettings,
    delete: async (args?: any) => mockSecuritySettings,
  },
  // Add missing models
  auditLog: {
    create: async (args?: any) => mockGeneric,
  },
  securityAlert: {
    create: async (args?: any) => mockGeneric,
  },
  savingsContribution: {
    findMany: async (args?: any) => [mockGeneric],
    create: async (args?: any) => mockGeneric,
  },
  card: {
    findMany: async (args?: any) => [mockGeneric],
    create: async (args?: any) => mockGeneric,
    update: async (args?: any) => mockGeneric,
  },
  notification: {
    findMany: async (args?: any) => [mockGeneric],
    create: async (args?: any) => mockGeneric,
    update: async (args?: any) => mockGeneric,
  },
  kycDocument: {
    findMany: async (args?: any) => [mockGeneric],
    create: async (args?: any) => mockGeneric,
  },
  session: {
    findFirst: async (args?: any) => mockGeneric,
    create: async (args?: any) => mockGeneric,
    delete: async (args?: any) => mockGeneric,
  },
  transactionLog: {
    create: async (args?: any) => mockGeneric,
  },
  certificateCheck: {
    create: async (args?: any) => mockGeneric,
  },
  rateLimitLog: {
    findMany: async (args?: any) => [mockGeneric],
    create: async (args?: any) => mockGeneric,
    groupBy: async (args?: any) => [{ userId: 'mock-user-id', _count: { id: 0 } }],
  },
  transactionAlert: {
    findMany: async (args?: any) => [mockGeneric],
    create: async (args?: any) => mockGeneric,
  },
  // Transaction wrapper
  $transaction: async (callback: Function) => {
    return await callback(mockPrismaClient);
  },
  $disconnect: async () => Promise.resolve(),
};

// Export the mock client for client-side use
export const prisma = mockPrismaClient;
export default prisma;

// For server-side code, use the following import instead:
// import { prisma } from '@/lib/server/db';
