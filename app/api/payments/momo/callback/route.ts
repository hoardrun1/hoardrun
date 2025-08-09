import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { MomoClient } from '@/lib/momo-client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Initialize MOMO client for verification
    const momoClient = new MomoClient({
      baseUrl: process.env.MOMO_API_URL!,
      primaryKey: process.env.MOMO_PRIMARY_KEY!,
      secondaryKey: process.env.MOMO_SECONDARY_KEY!,
      targetEnvironment: process.env.MOMO_TARGET_ENVIRONMENT!,
      callbackUrl: process.env.MOMO_CALLBACK_HOST!,
    });

    // Verify transaction status
    const status = await momoClient.getTransactionStatus(body.referenceId);

    // Update transaction and user balance
    await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findFirst({
        where: { reference: body.referenceId },
        include: { user: true },
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Update transaction status
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { 
          status: status.status,
          completedAt: status.status === 'SUCCESSFUL' ? new Date() : null,
        },
      });

      // Update user balance if transaction is successful
      if (status.status === 'SUCCESSFUL') {
        await tx.user.update({
          where: { id: transaction.userId },
          data: {
            balance: {
              decrement: transaction.amount,
            },
          },
        });

        // Send notification
        await momoClient.requestToPayDeliveryNotification(
          body.referenceId,
          'Transfer completed successfully'
        );
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('MOMO callback error:', error);
    return new NextResponse('Callback processing failed', { status: 500 });
  }
}
