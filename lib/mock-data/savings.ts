// Mock data for savings goals
export const mockSavingsGoals = [
  {
    id: '1',
    name: 'Emergency Fund',
    targetAmount: 10000,
    currentAmount: 7500,
    monthlyContribution: 500,
    category: 'Emergency',
    deadline: new Date(Date.now() + 5 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 5 months from now
    isAutoSave: true,
    isCompleted: false,
    progress: 75,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
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
    deadline: new Date(Date.now() + 11 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 11 months from now
    isAutoSave: true,
    isCompleted: false,
    progress: 45,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
    updatedAt: new Date().toISOString(),
    daysLeft: 330
  },
  {
    id: '3',
    name: 'New Laptop',
    targetAmount: 2000,
    currentAmount: 2000,
    monthlyContribution: 200,
    category: 'Electronics',
    deadline: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 1 month ago
    isAutoSave: false,
    isCompleted: true,
    progress: 100,
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days ago
    updatedAt: new Date().toISOString(),
    daysLeft: 0
  }
];

// Mock analytics data
export const mockSavingsAnalytics = {
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
