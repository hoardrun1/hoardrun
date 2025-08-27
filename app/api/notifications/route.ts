import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'
import { getCustomSession } from '@/lib/auth-session'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const session = await getCustomSession();
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Mock notifications - replace with actual Prisma query
    const notifications: any[] = [];

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
