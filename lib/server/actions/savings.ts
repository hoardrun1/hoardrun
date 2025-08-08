'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { mockSavingsGoals } from '@/lib/mock-data/savings';

// Mock analytics data
const mockAnalytics = {
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
    },
    {
      title: 'Optimization Opportunity',
      description: 'Consider increasing your monthly contribution by $50 to reach your goal 2 months earlier.'
    }
  ]
};

// Server action to get savings goals
export async function getSavingsGoals() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }
    
    // In a real app, you would fetch from the database here
    // For now, return mock data
    return { success: true, data: mockSavingsGoals };
  } catch (error) {
    console.error('Error fetching savings goals:', error);
    return { success: false, error: 'Failed to fetch savings goals' };
  }
}

// Server action to get savings analytics
export async function getSavingsAnalytics() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }
    
    // In a real app, you would calculate analytics from the database
    // For now, return mock data
    return { success: true, data: mockAnalytics };
  } catch (error) {
    console.error('Error fetching savings analytics:', error);
    return { success: false, error: 'Failed to fetch savings analytics' };
  }
}

// Server action to create a savings goal
export async function createSavingsGoal(data: any) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }
    
    // In a real app, you would create a record in the database
    // For now, return a mock response
    const newGoal = {
      id: `goal-${Date.now()}`,
      userId: session.user.id,
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
    
    return { success: true, data: newGoal };
  } catch (error) {
    console.error('Error creating savings goal:', error);
    return { success: false, error: 'Failed to create savings goal' };
  }
}
