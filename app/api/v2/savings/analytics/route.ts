import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    // Return mock analytics data
    return NextResponse.json({ analytics: mockAnalytics });
  } catch (error) {
    console.error('GET /api/v2/savings/analytics error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
