import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-config';
import { cache } from '@/lib/cache';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    // Invalidate all sessions for the user using a multi-pronged approach
    await Promise.all([
      // Clear database sessions
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          updatedAt: new Date()
        }
      }),
      // Invalidate any Redis-based sessions
      cache.delPattern(`session:${session.user.id}:*`),
      // Add a session blacklist entry
      cache.set(
        `session_blacklist:${session.user.id}`, 
        Date.now().toString(),
        60 * 60 * 24 // 24 hours
      )
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in logout all devices:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}
