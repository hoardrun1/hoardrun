'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { apiClient } from '@/lib/api-client';

// Server action to get savings goals
export async function getSavingsGoals() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }
    
    // Use API client to fetch savings data from backend
    const response = await apiClient.getSavings();
    return { success: true, data: response };
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
    
    // Use API client to fetch savings insights from backend
    const response = await apiClient.getSavingsInsights();
    return { success: true, data: response };
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
    
    // Use API client to create savings goal in backend
    const response = await apiClient.createSavingsGoal({
      name: data.name,
      target_amount: data.targetAmount,
      description: data.description
    });
    
    return { success: true, data: response };
  } catch (error) {
    console.error('Error creating savings goal:', error);
    return { success: false, error: 'Failed to create savings goal' };
  }
}
