import { logger } from './logger';

export class PaymentError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

export function handlePaymentError(error: unknown) {
  if (error instanceof PaymentError) {
    logger.error('Payment error:', {
      code: error.code,
      message: error.message,
      details: error.details,
    });
    return {
      error: {
        code: error.code,
        message: error.message,
      },
      statusCode: error.statusCode,
    };
  }

  logger.error('Unexpected payment error:', error);
  return {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
    statusCode: 500,
  };
}

