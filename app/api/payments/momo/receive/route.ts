import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { MomoClient } from '@/lib/momo-client';
import { authOptions } from '@/lib/auth-config';

const receiveSchema = z.object({
  amount: z.number().positive(),
  phone: z.string().min(10),
  userId: z.string(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const data = receiveSchema.parse(body);

    // Create pending transaction record
    const transaction = await prisma.momoTransaction.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        phone: data.phone,
        type: 'RECEIVE',
        status: 'PENDING',
      },
    });

    // Generate payment link (implementation depends on MTN MOMO API)
    const momoClient = new MomoClient({
      baseUrl: process.env.MOMO_API_URL!,
      subscriptionKey: process.env.MOMO_SUBSCRIPTION_KEY!,
      targetEnvironment: process.env.MOMO_ENVIRONMENT!,
      apiKey: process.env.MOMO_API_KEY!,
      callbackUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/payments/momo/callback`,
    });

    const paymentLink = await momoClient.generatePaymentLink({
      amount: data.amount,
      phone: data.phone,
      referenceId: transaction.id,
    });

    return NextResponse.json({ paymentLink });
  } catch (error) {
    console.error('MOMO receive payment error:', error);
    return new NextResponse('Payment link generation failed', { status: 500 });
  }
}