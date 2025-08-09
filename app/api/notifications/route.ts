import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/server/db';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const getNotifications = async (userId: string) => {
      return prisma.$queryRaw`
        SELECT * FROM "Notification"
        WHERE "userId" = ${userId}
        ORDER BY "createdAt" DESC
      `;
    };

    const notifications = await getNotifications(session.user.id);

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
