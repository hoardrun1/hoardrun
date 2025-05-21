// This file is a placeholder to avoid client-side Prisma imports
// The actual Prisma client is in lib/server/db.ts

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Create a mock object for client-side use
const mockPrismaClient = {
  // Add mock methods as needed
  user: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async () => ({ id: 'mock-id' }),
  },
  savingsGoal: {
    findMany: async () => [],
    create: async () => ({ id: 'mock-id' }),
  },
  // Add other models as needed
};

// Export the mock client for client-side use
export const prisma = mockPrismaClient;
export default prisma;

// For server-side code, use the following import instead:
// import { prisma } from '@/lib/server/db';
