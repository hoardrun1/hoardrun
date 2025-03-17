import { prisma } from '@/lib/prisma';
import { MomoClient } from '@/lib/momo-client';
import { MomoError, momoErrorCodes } from '@/lib/error-handling/momo-errors';
import { MomoLogger } from '@/lib/logger/momo-logger';

export class MomoTransactionService {
  private momoClient: MomoClient;

  constructor(momoClient: MomoClient) {
    this.momoClient = momoClient;
  }

  async initiatePayment(data: {
    userId: string;
    amount: number;
    currency: string;
    phone: string;
    message: string;
  }) {
    const { userId, amount, currency, phone, message } = data;

    // Create transaction record
    const transaction = await prisma.momoTransaction.create({
      data: {
        userId,
        amount,
        currency,
        phone,
        message,
        status: 'PENDING',
      },
    });

    try {
      // Validate account holder
      const isValid = await this.momoClient.validateAccountHolder(phone, 'MSISDN');
      if (!isValid) {
        throw new MomoError(
          momoErrorCodes.INVALID_PHONE,
          'Invalid phone number',
          400
        );
      }

      // Request payment
      const referenceId = await this.momoClient.requestToPay(
        amount,
        currency,
        phone,
        message,
        {
          externalId: transaction.id,
          payerNote: `Payment for ${message}`,
        }
      );

      // Update transaction with reference ID
      await prisma.momoTransaction.update({
        where: { id: transaction.id },
        data: { referenceId },
      });

      // Log successful initiation
      MomoLogger.logTransaction({
        type: 'PAYMENT_INITIATED',
        status: 'SUCCESS',
        transactionId: transaction.id,
        referenceId,
        metadata: { amount, currency, phone },
      });

      return { referenceId, transactionId: transaction.id };
    } catch (error) {
      // Update transaction status to failed
      await prisma.momoTransaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      });

      // Log error
      MomoLogger.logError(error as Error, {
        transactionId: transaction.id,
        metadata: { amount, currency, phone },
      });

      throw error;
    }
  }

  async processCallback(referenceId: string, status: string) {
    const transaction = await prisma.momoTransaction.findFirst({
      where: { referenceId },
      include: { user: true },
    });

    if (!transaction) {
      throw new MomoError(
        momoErrorCodes.SYSTEM_ERROR,
        'Transaction not found',
        404
      );
    }

    await prisma.$transaction(async (tx) => {
      // Update transaction status
      await tx.momoTransaction.update({
        where: { id: transaction.id },
        data: {
          status: status as any,
          completedAt: status === 'SUCCESSFUL' ? new Date() : null,
        },
      });

      // Update user balance if successful
      if (status === 'SUCCESSFUL') {
        await tx.user.update({
          where: { id: transaction.userId },
          data: {
            balance: {
              increment: transaction.amount,
            },
          },
        });
      }
    });

    // Send notification
    if (status === 'SUCCESSFUL') {
      await this.momoClient.requestToPayDeliveryNotification(
        referenceId,
        'Payment completed successfully'
      );
    }

    // Log callback processing
    MomoLogger.logTransaction({
      type: 'CALLBACK_PROCESSED',
      status,
      transactionId: transaction.id,
      referenceId,
    });
  }
}