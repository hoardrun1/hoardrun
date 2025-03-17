import { v4 as uuidv4 } from 'uuid';
import { cardSchema, isCardExpired } from './card-validation';
import { enforceVisaRateLimit } from './visa-rate-limiter';
import { logTransaction } from './transaction-logger';
import { APIError } from '@/middleware/error-handler';

interface VisaConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
}

interface VisaPaymentRequest {
  amount: number;
  currency: string;
  cardNumber?: string;
  description?: string;
}

export class VisaClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.VISA_API_KEY!;
    this.baseUrl = process.env.VISA_ENVIRONMENT === 'production'
      ? 'https://api.visa.com'
      : 'https://sandbox.api.visa.com';
  }

  async initiateDeposit(data: {
    userId: string;
    amount: number;
    currency: string;
    cardNumber: string;
    expiryMonth: number;
    expiryYear: number;
    cvv: string;
    description?: string;
  }) {
    try {
      // Validate amount limits
      if (data.amount < Number(process.env.VISA_MIN_AMOUNT) ||
          data.amount > Number(process.env.VISA_MAX_AMOUNT)) {
        throw new APIError(
          400,
          'Amount outside allowed limits',
          'INVALID_AMOUNT'
        );
      }

      // Validate card details
      const cardValidation = cardSchema.safeParse({
        number: data.cardNumber,
        expiryMonth: data.expiryMonth,
        expiryYear: data.expiryYear,
        cvv: data.cvv
      });

      if (!cardValidation.success) {
        throw new APIError(
          400,
          'Invalid card details',
          'INVALID_CARD'
        );
      }

      // Check card expiration
      if (isCardExpired(data.expiryMonth, data.expiryYear)) {
        throw new APIError(
          400,
          'Card has expired',
          'CARD_EXPIRED'
        );
      }

      // Enforce rate limiting
      await enforceVisaRateLimit(data.userId);

      // Make API request
      const response = await fetch(`${this.baseUrl}/payments/deposits`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'x-request-id': uuidv4(),
          'x-idempotency-key': uuidv4()
        },
        body: JSON.stringify({
          amount: data.amount,
          currency: data.currency,
          card_number: data.cardNumber,
          expiry_month: data.expiryMonth,
          expiry_year: data.expiryYear,
          cvv: data.cvv,
          description: data.description,
          capture_method: 'AUTOMATIC'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new APIError(
          response.status,
          result.message || 'Visa payment failed',
          'VISA_API_ERROR'
        );
      }

      // Log successful transaction
      await logTransaction({
        userId: data.userId,
        type: 'DEPOSIT',
        amount: data.amount,
        status: 'SUCCESS',
        provider: 'VISA'
      });

      return result;
    } catch (error) {
      // Log failed transaction
      await logTransaction({
        userId: data.userId,
        type: 'DEPOSIT',
        amount: data.amount,
        status: 'FAILED',
        provider: 'VISA',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }
}

