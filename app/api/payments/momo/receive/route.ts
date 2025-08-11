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
    const transaction = await prisma.transaction.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        description: `MOMO receive from ${data.phone}`,
        type: 'DEPOSIT',
        status: 'PENDING',
      },
    });

    // Generate payment link (implementation depends on MTN MOMO API)
    const momoClient = new MomoClient({
      baseUrl: process.env.MOMO_API_URL!,
      primaryKey: process.env.MOMO_PRIMARY_KEY!,
      secondaryKey: process.env.MOMO_SECONDARY_KEY!,
      targetEnvironment: process.env.MOMO_TARGET_ENVIRONMENT!,
      callbackUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/payments/momo/callback`,
      userId: process.env.MOMO_USER_ID!,
      apiKey: process.env.MOMO_API_KEY!,
    });

    const paymentResult = await momoClient.requestToPay(
      data.amount,
      'EUR', // Default currency
      data.phone,
      `Payment request for ${data.amount}`,
      { externalId: transaction.id }
    );

    return NextResponse.json({ paymentResult });
  } catch (error) {
    console.error('MOMO receive payment error:', error);
    return new NextResponse('Payment link generation failed', { status: 500 });
  }
}