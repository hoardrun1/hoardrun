import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { MomoClient } from '@/lib/momo-client';
import { PhoneValidator } from '@/lib/validators/phone-validator';
import { MomoError, momoErrorCodes } from '@/lib/error-handling/momo-errors';
import { MomoLogger } from '@/lib/logger/momo-logger';
import { CurrencyConverter } from '@/lib/currency/currency-converter';
import { TransactionMonitor } from '@/lib/monitoring/transaction-monitor';
import { authOptions } from '@/lib/auth-config';

const sendSchema = z.object({
  amount: z.number().positive(),
  phone: z.string().min(10),
  description: z.string().optional(),
  country: z.enum(['GH', 'UG', 'CM', 'CI']),
  currency: z.string().default('EUR'),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new MomoError(momoErrorCodes.USER_NOT_FOUND, 'Unauthorized', 401);
    }

    const body = await request.json();
    const data = sendSchema.parse(body);

    // Validate phone number
    if (!PhoneValidator.validateMomoNumber(data.phone, data.country)) {
      throw new MomoError(
        momoErrorCodes.INVALID_PHONE,
        'Invalid phone number format',
        400
      );
    }

    // Format phone number
    const formattedPhone = PhoneValidator.formatPhoneNumber(data.phone, data.country);

    // Convert currency if needed
    const convertedAmount = await CurrencyConverter.convertAmount(
      data.amount,
      data.currency,
      'EUR'
    );

    // Check user balance
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { balance: true },
    });

    if (!user || user.balance < convertedAmount) {
      throw new MomoError(
        momoErrorCodes.INSUFFICIENT_FUNDS,
        'Insufficient balance',
        400
      );
    }

    // Initialize MOMO client
    const momoClient = new MomoClient({
      baseUrl: process.env.MOMO_API_URL!,
      primaryKey: process.env.MOMO_PRIMARY_KEY!,
      secondaryKey: process.env.MOMO_SECONDARY_KEY!,
      targetEnvironment: process.env.MOMO_TARGET_ENVIRONMENT!,
      callbackUrl: process.env.MOMO_CALLBACK_HOST!,
    });

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        type: 'MOMO_TRANSFER',
        amount: convertedAmount,
        status: 'PENDING',
        description: data.description || 'MTN MOMO Transfer',
        userId: session.user.id,
        metadata: {
          phone: formattedPhone,
          originalAmount: data.amount,
          originalCurrency: data.currency,
          country: data.country,
        },
      },
    });

    // Monitor transaction
    await TransactionMonitor.monitorTransaction(transaction);

    // Initiate MOMO payment
    const referenceId = await momoClient.requestToPay(
      convertedAmount,
      'EUR',
      formattedPhone,
      data.description || 'Money Transfer'
    );

    // Update transaction with reference ID
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { reference: referenceId },
    });

    // Log successful request
    MomoLogger.logTransaction({
      type: 'MOMO_TRANSFER',
      status: 'INITIATED',
      amount: convertedAmount,
      userId: session.user.id,
      referenceId,
      metadata: {
        originalAmount: data.amount,
        originalCurrency: data.currency,
        phone: formattedPhone,
      },
    });

    return NextResponse.json({ 
      success: true, 
      referenceId,
      message: 'Transfer initiated successfully' 
    });
  } catch (error) {
    MomoLogger.logError(error as Error, { path: '/api/payments/momo/send' });

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
      { message: 'Payment initiation failed', code: momoErrorCodes.SYSTEM_ERROR },
      { status: 500 }
    );
  }
}
