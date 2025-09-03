import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCustomSession } from '@/lib/auth-session'

const updateSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['DEPOSIT', 'WITHDRAWAL']),
  provider: z.enum(['VISA', 'MASTERCARD', 'MOMO']),
});

export async function POST(request: Request) {
  try {
    const session = await getCustomSession();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const data = updateSchema.parse(body);

    // Update user balance and create transaction record
    const result = await prisma.$transaction(async (tx: any) => {
      // Update account balance instead of user balance
      const account = await tx.account.findFirst({
        where: { userId: session.user.id, isActive: true }
      })
      
      if (!account) {
        throw new Error('No active account found')
      }
      
      const updatedAccount = await tx.account.update({
        where: { id: account.id },
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
          description: `${data.type} via ${data.provider}`,
        }
      });

      return { account: updatedAccount, transaction };
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Balance update failed' },
      { status: 500 }
    );
  }
}