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

    // Create transaction record (using regular transaction table)
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount,
        type: 'DEPOSIT',
        description: message,
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

      // Update transaction with reference ID (store in description)
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { description: `${message} - Ref: ${referenceId}` },
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
      await prisma.transaction.update({
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
    const transaction = await prisma.transaction.findFirst({
      where: { description: { contains: referenceId } },
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
      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: status === 'SUCCESSFUL' ? 'COMPLETED' : status === 'FAILED' ? 'FAILED' : 'PENDING',
        },
      });

      // Update user balance if successful (note: User model doesn't have balance field)
      if (status === 'SUCCESSFUL') {
        console.log(`Would update balance for user ${transaction.userId} by ${transaction.amount}`);
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