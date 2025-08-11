import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { MomoClient } from '@/lib/momo-client';
import { MomoTransactionService } from '@/lib/services/momo-transaction-service';
import { authOptions } from '@/lib/auth-config';
import { MomoError } from '@/lib/error-handling/momo-errors';

const momoClient = new MomoClient({
  baseUrl: process.env.MOMO_API_URL!,
  primaryKey: process.env.MOMO_PRIMARY_KEY!,
  secondaryKey: process.env.MOMO_SECONDARY_KEY!,
  targetEnvironment: process.env.MOMO_TARGET_ENVIRONMENT!,
  callbackUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/payments/momo/callback`,
  userId: process.env.MOMO_USER_ID!,
  apiKey: process.env.MOMO_API_KEY!,
});

const transactionService = new MomoTransactionService(momoClient);

const paymentSchema = z.object({
  amount: z.number().positive(),
  phone: z.string().min(10),
  message: z.string(),
  currency: z.string().default('EUR'),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const data = paymentSchema.parse(body);

    const result = await transactionService.initiatePayment({
      userId: session.user.id,
      ...data,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof MomoError) {
      return NextResponse.json(
        { message: error.message, code: error.code },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { message: 'Payment processing failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const referenceId = searchParams.get('referenceId');

    if (!referenceId) {
      return new NextResponse('Reference ID is required', { status: 400 });
    }

    const status = await momoClient.getTransactionStatus(referenceId);
    return NextResponse.json(status);
  } catch (error) {
    if (error instanceof MomoError) {
      return NextResponse.json(
        { message: error.message, code: error.code },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { message: 'Status check failed' },
      { status: 500 }
    );
  }
}

