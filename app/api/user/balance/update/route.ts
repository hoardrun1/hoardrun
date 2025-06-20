import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-config';

const updateSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['DEPOSIT', 'WITHDRAWAL']),
  provider: z.enum(['VISA', 'MASTERCARD', 'MOMO']),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const data = updateSchema.parse(body);

    // Update user balance and create transaction record
    const result = await prisma.$transaction(async (tx) => {
      // Update balance
      const user = await tx.user.update({
        where: { id: session.user.id },
        data: {
          balance: {
            increment: data.type === 'DEPOSIT' ? data.amount : -data.amount
          }
        }
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId: session.user.id,
          type: data.type,
          amount: data.amount,
          status: 'COMPLETED',
          provider: data.provider,
          description: `${data.type} via ${data.provider}`,
        }
      });

      return { user, transaction };
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Balance update failed' },
      { status: 500 }
    );
  }
}