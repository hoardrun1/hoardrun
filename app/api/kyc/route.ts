import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Handle document submission logic here
    const result = await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        verificationCodes: {
          create: {
            type: body.type,
            code: body.code,
            expiresAt: body.expiresAt,
            used: body.used
          }
        }
      },
      include: {
        verificationCodes: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    return new NextResponse(
      JSON.stringify(result),
      { status: 201 }
    );
    
  } catch (error) {
    console.error('KYC document submission error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}
