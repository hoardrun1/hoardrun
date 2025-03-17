import { v4 as uuidv4 } from 'uuid';
import { MomoError, momoErrorCodes } from '@/lib/error-handling/momo-errors';

interface MomoConfig {
  baseUrl: string;
  primaryKey: string;
  secondaryKey: string;
  targetEnvironment: string;
  callbackUrl: string;
  userId: string;
  apiKey: string;
}

export class MomoClient {
  private config: MomoConfig;
  private token: string | null = null;
  private tokenExpiry: Date | null = null;
  private apiKey: string | null = null;

  constructor(config: MomoConfig) {
    this.config = config;
  }

  private async generateApiKey(): Promise<string> {
    const response = await fetch(
      `${this.config.baseUrl}/v1_0/apiuser/${this.config.userId}/apikey`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.config.primaryKey,
        },
      }
    );

    if (!response.ok) {
      throw new MomoError(
        momoErrorCodes.API_KEY_GENERATION_FAILED,
        'Failed to generate API key',
        response.status
      );
    }

    const { apiKey } = await response.json();
    this.apiKey = apiKey;
    return apiKey;
  }

  private async getAuthToken(): Promise<string> {
    if (this.token && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.token;
    }

    if (!this.apiKey) {
      await this.generateApiKey();
    }

    const auth = Buffer.from(`${this.config.userId}:${this.apiKey}`).toString('base64');
    const response = await fetch(`${this.config.baseUrl}/collection/token/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Ocp-Apim-Subscription-Key': this.config.primaryKey,
      },
    });

    if (!response.ok) {
      throw new MomoError(
        momoErrorCodes.AUTH_TOKEN_FAILED,
        'Failed to obtain auth token',
        response.status
      );
    }

    const data = await response.json();
    this.token = data.access_token;
    this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000);
    return this.token;
  }

  async getAccountBalance(): Promise<{ amount: number; currency: string }> {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${this.config.baseUrl}/collection/v1_0/account/balance`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Target-Environment': this.config.targetEnvironment,
        'Ocp-Apim-Subscription-Key': this.config.primaryKey,
      },
    });

    if (!response.ok) {
      throw new MomoError(
        momoErrorCodes.BALANCE_CHECK_FAILED,
        'Failed to get account balance',
        response.status
      );
    }

    return response.json();
  }

  async requestToPay(
    amount: number,
    currency: string,
    partyId: string,
    message: string,
    paymentOptions?: {
      externalId?: string;
      serviceProvider?: string;
      payerNote?: string;
    }
  ): Promise<string> {
    const token = await this.getAuthToken();
    const referenceId = uuidv4();

    const response = await fetch(`${this.config.baseUrl}/collection/v1_0/requesttopay`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Reference-Id': referenceId,
        'X-Target-Environment': this.config.targetEnvironment,
        'Ocp-Apim-Subscription-Key': this.config.primaryKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        externalId: paymentOptions?.externalId || referenceId,
        payer: {
          partyIdType: 'MSISDN',
          partyId,
        },
        payerMessage: message,
        payeeNote: paymentOptions?.payerNote || message,
        serviceProviderCode: paymentOptions?.serviceProvider,
        callbackUrl: this.config.callbackUrl,
      }),
    });

    if (!response.ok) {
      throw new MomoError(
        momoErrorCodes.PAYMENT_REQUEST_FAILED,
        'Failed to initiate payment request',
        response.status
      );
    }

    return referenceId;
  }

  async getTransactionStatus(referenceId: string): Promise<{
    status: string;
    reason?: string;
    financialTransactionId?: string;
  }> {
    const token = await this.getAuthToken();

    const response = await fetch(
      `${this.config.baseUrl}/collection/v1_0/requesttopay/${referenceId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Target-Environment': this.config.targetEnvironment,
          'Ocp-Apim-Subscription-Key': this.config.primaryKey,
        },
      }
    );

    if (!response.ok) {
      throw new MomoError(
        momoErrorCodes.STATUS_CHECK_FAILED,
        'Failed to get transaction status',
        response.status
      );
    }

    return response.json();
  }

  async validateAccountHolder(
    accountHolderId: string,
    accountHolderIdType: 'MSISDN' | 'EMAIL' | 'PARTY_CODE'
  ): Promise<boolean> {
    const token = await this.getAuthToken();

    const response = await fetch(
      `${this.config.baseUrl}/collection/v1_0/accountholder/${accountHolderIdType}/${accountHolderId}/active`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Target-Environment': this.config.targetEnvironment,
          'Ocp-Apim-Subscription-Key': this.config.primaryKey,
        },
      }
    );

    return response.status === 200;
  }

  async requestToPayDeliveryNotification(
    referenceId: string,
    message: string,
    language?: string
  ): Promise<void> {
    const token = await this.getAuthToken();

    const response = await fetch(
      `${this.config.baseUrl}/collection/v1_0/requesttopay/${referenceId}/deliverynotification`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Target-Environment': this.config.targetEnvironment,
          'Ocp-Apim-Subscription-Key': this.config.primaryKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationMessage: message,
          language: language || 'en',
        }),
      }
    );

    if (!response.ok) {
      throw new MomoError(
        momoErrorCodes.NOTIFICATION_FAILED,
        'Failed to send delivery notification',
        response.status
      );
    }
  }
}

