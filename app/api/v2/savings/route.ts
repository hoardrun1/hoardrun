import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';

// Mock data for development
const mockSavingsGoals = [
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
];

// GET handler for savings goals
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    // Return mock data
    return NextResponse.json(mockSavingsGoals);
  } catch (error) {
    console.error('GET /api/v2/savings error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// POST handler for creating a savings goal
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const body = await req.json();
    
    // Create a new mock goal
    const newGoal = {
      id: `goal-${Date.now()}`,
      userId: session.user.id,
      name: body.name,
      targetAmount: body.targetAmount,
      currentAmount: 0,
      monthlyContribution: body.monthlyContribution,
      category: body.category || 'General',
      deadline: body.deadline,
      isAutoSave: body.isAutoSave || false,
      isCompleted: false,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      daysLeft: 365 // Default to 1 year
    };
    
    return NextResponse.json(newGoal);
  } catch (error) {
    console.error('POST /api/v2/savings error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
