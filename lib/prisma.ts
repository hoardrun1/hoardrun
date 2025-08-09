// This file is a placeholder to avoid client-side Prisma imports
// The actual Prisma client is in lib/server/db.ts

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Create mock data objects with proper structure
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
  password: 'mock-password'
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
  },
  savingsGoal: {
    findUnique: async (args?: any) => mockSavingsGoal,
    findMany: async (args?: any) => [mockSavingsGoal],
    findFirst: async (args?: any) => mockSavingsGoal,
    create: async (args?: any) => mockSavingsGoal,
    update: async (args?: any) => mockSavingsGoal,
    delete: async (args?: any) => mockSavingsGoal,
  },
  account: {
    findUnique: async (args?: any) => mockAccount,
    findMany: async (args?: any) => [mockAccount],
    findFirst: async (args?: any) => mockAccount,
    create: async (args?: any) => mockAccount,
    update: async (args?: any) => mockAccount,
    delete: async (args?: any) => mockAccount,
  },
  beneficiary: {
    findUnique: async (args?: any) => mockBeneficiary,
    findMany: async (args?: any) => [mockBeneficiary],
    findFirst: async (args?: any) => mockBeneficiary,
    create: async (args?: any) => mockBeneficiary,
    update: async (args?: any) => mockBeneficiary,
    delete: async (args?: any) => mockBeneficiary,
  },
  // Add other models as needed
};

// Export the mock client for client-side use
export const prisma = mockPrismaClient;
export default prisma;

// For server-side code, use the following import instead:
// import { prisma } from '@/lib/server/db';
