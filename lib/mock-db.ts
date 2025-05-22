'use client';

// This file provides a mock database implementation for client-side use
// It completely avoids importing Prisma on the client

// Mock database storage
const db = {
  savingsGoals: [
    {
      id: '1',
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 7500,
      monthlyContribution: 500,
      category: 'Emergency',
      deadline: new Date(Date.now() + 5 * 30 * 24 * 60 * 60 * 1000).toISOString(),
      isAutoSave: true,
      isCompleted: false,
      progress: 75,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      daysLeft: 150
    },
    {
      id: '2',
      name: 'Vacation',
      targetAmount: 5000,
      currentAmount: 2250,
      monthlyContribution: 250,
      category: 'Travel',
      deadline: new Date(Date.now() + 11 * 30 * 24 * 60 * 60 * 1000).toISOString(),
      isAutoSave: true,
      isCompleted: false,
      progress: 45,
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      daysLeft: 330
    }
  ],
  analytics: {
    totalSavings: 12500,
    monthlyGrowth: 750,
    nextMilestone: 15000,
    projectedSavings: 25000,
    insights: [
      {
        title: 'Savings Rate Increasing',
        description: 'Your savings rate has increased by 12% in the last month. Keep it up!'
      },
      {
        title: 'Emergency Fund Progress',
        description: 'You\'re 75% of the way to your emergency fund goal.'
      }
    ]
  }
};

// Mock database client
export const mockDb = {
  // Savings goals
  getSavingsGoals: async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...db.savingsGoals];
  },
  
  createSavingsGoal: async (data: any) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newGoal = {
      id: `goal-${Date.now()}`,
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: 0,
      monthlyContribution: data.monthlyContribution,
      category: data.category || 'General',
      deadline: data.deadline,
      isAutoSave: data.isAutoSave || false,
      isCompleted: false,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      daysLeft: 365 // Default to 1 year
    };
    
    db.savingsGoals.unshift(newGoal);
    return newGoal;
  },
  
  // Analytics
  getSavingsAnalytics: async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...db.analytics };
  }
};
