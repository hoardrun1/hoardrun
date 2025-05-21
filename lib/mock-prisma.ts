// This file provides a mock implementation of the Prisma client
// to use when a real database connection is not available

import { PrismaClient } from '@prisma/client';

// Create a mock class that extends PrismaClient
class MockPrismaClient extends PrismaClient {
  constructor() {
    // Pass empty options to the real PrismaClient constructor
    super();
    
    // Override the connect method to prevent actual connection attempts
    this.$connect = async () => {
      console.log('Using mock Prisma client - no actual database connection');
      return Promise.resolve();
    };
    
    // Override the disconnect method
    this.$disconnect = async () => {
      console.log('Mock Prisma client disconnected');
      return Promise.resolve();
    };
    
    // Add mock implementations for commonly used models
    this.user = this.createMockUserModel();
    this.account = this.createMockAccountModel();
    this.transaction = this.createMockTransactionModel();
    this.savingsGoal = this.createMockSavingsGoalModel();
    this.investment = this.createMockInvestmentModel();
  }
  
  private createMockUserModel() {
    return {
      findUnique: async () => null,
      findMany: async () => [],
      create: async (data: any) => ({ id: 'mock-id', ...data.data }),
      update: async (data: any) => ({ id: 'mock-id', ...data.data }),
      delete: async () => ({ id: 'mock-id' }),
      count: async () => 0,
    };
  }
  
  private createMockAccountModel() {
    return {
      findUnique: async () => null,
      findMany: async () => [],
      create: async (data: any) => ({ id: 'mock-id', ...data.data }),
      update: async (data: any) => ({ id: 'mock-id', ...data.data }),
      delete: async () => ({ id: 'mock-id' }),
      count: async () => 0,
    };
  }
  
  private createMockTransactionModel() {
    return {
      findUnique: async () => null,
      findMany: async () => [],
      create: async (data: any) => ({ id: 'mock-id', ...data.data }),
      update: async (data: any) => ({ id: 'mock-id', ...data.data }),
      delete: async () => ({ id: 'mock-id' }),
      count: async () => 0,
    };
  }
  
  private createMockSavingsGoalModel() {
    return {
      findUnique: async () => null,
      findMany: async () => [],
      create: async (data: any) => ({ id: 'mock-id', ...data.data }),
      update: async (data: any) => ({ id: 'mock-id', ...data.data }),
      delete: async () => ({ id: 'mock-id' }),
      count: async () => 0,
    };
  }
  
  private createMockInvestmentModel() {
    return {
      findUnique: async () => null,
      findMany: async () => [],
      create: async (data: any) => ({ id: 'mock-id', ...data.data }),
      update: async (data: any) => ({ id: 'mock-id', ...data.data }),
      delete: async () => ({ id: 'mock-id' }),
      count: async () => 0,
    };
  }
}

// Export an instance of the mock client
const mockPrisma = new MockPrismaClient();
export default mockPrisma;
