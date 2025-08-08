import { v4 as uuidv4 } from 'uuid';
import { CardValidation } from './card-validation';
import { AppError, ErrorCode } from './error-handling';
import { COUNTRY_CODES, type CountryCode } from './constants/country-codes';

interface MastercardConfig {
  apiKey: string;
  partnerId: string;
  environment: 'sandbox' | 'production';
  clientId: string;
  orgName: string;
  country: CountryCode;
}

export class MastercardClient {
  private config: MastercardConfig;

  constructor(config: MastercardConfig) {
    if (!(config.country in COUNTRY_CODES)) {
      throw new AppError(
        'Invalid country code',
        ErrorCode.VALIDATION_ERROR,
        400
      );
    }
    this.config = config;
  }

  private getBaseUrl(): string {
    return this.config.environment === 'production'
      ? 'https://api.mastercard.com'
      : 'https://sandbox.api.mastercard.com';
  }

  async initiateTransfer(data: {
    amount: number;
    currency: string;
    recipientCard: string;
    senderCard?: string;
    description?: string;
  }) {
    try {
      // Validate card number
      if (!CardValidation.validateCardNumber(data.recipientCard)) {
        throw new AppError(
          'Invalid recipient card number',
          ErrorCode.VALIDATION_ERROR,
          400
        );
      }

      // Generate unique reference
      const referenceId = uuidv4();

      // Log payment attempt
      console.log('Initiating Mastercard transfer:', {
        referenceId,
        amount: data.amount,
        currency: data.currency,
        recipientCardMasked: `****${data.recipientCard.slice(-4)}`,
      });

      // Implement actual Mastercard API call here
      // Add proper error handling for API responses

      return { referenceId };
    } catch (error) {
      console.error('Mastercard transfer error:', error);
      throw error;
    }
  }

  async generatePaymentLink(data: {
    amount: number;
    currency: string;
    description?: string;
  }) {
    // Implement Mastercard Payment Link generation
    console.log('Generating payment link for:', data);
    return {
      paymentUrl: `https://mastercard.com/pay/${uuidv4()}`,
      referenceId: uuidv4()
    };
  }

  async getCardInfo(cardNumber: string) {
    // Implement Mastercard card validation and info retrieval
    console.log('Getting card info for:', cardNumber.substring(0, 4) + '****');
    console.log('Using API base URL:', this.getBaseUrl());

    const cardType = CardValidation.getCardType(cardNumber);
    return {
      isValid: CardValidation.validateCardNumber(cardNumber),
      cardType,
      binInfo: { issuer: 'Unknown', country: 'Unknown' }
    };
  }
}