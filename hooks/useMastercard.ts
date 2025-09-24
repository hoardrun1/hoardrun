import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface PaymentData {
  amount: number;
  currency?: string;
  payment_method: {
    type: string;
    card_number?: string;
    expiry_month?: string;
    expiry_year?: string;
    cvv?: string;
    token?: string;
  };
  description?: string;
  reference?: string;
}

interface CardData {
  card_number: string;
  expiry_month: string;
  expiry_year: string;
  cvv?: string;
  cardholder_name?: string;
}

interface TransferData {
  amount: number;
  currency?: string;
  sender: {
    name: string;
    account: string;
  };
  recipient: {
    name: string;
    account: string;
  };
  purpose?: string;
  reference?: string;
}

interface RefundData {
  amount: number;
  currency?: string;
  reason?: string;
}

export const useMastercard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const apiCall = useCallback(async (endpoint: string, method: string = 'GET', data?: any) => {
    setLoading(true);
    setError(null);

    try {
      if (!token) {
        throw new Error('Authentication token not available');
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/mastercard${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'API request failed');
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const processPayment = useCallback(async (paymentData: PaymentData) => {
    return await apiCall('/payments', 'POST', paymentData);
  }, [apiCall]);

  const getPaymentStatus = useCallback(async (paymentId: string) => {
    return await apiCall(`/payments/${paymentId}`);
  }, [apiCall]);

  const refundPayment = useCallback(async (paymentId: string, refundData: RefundData) => {
    return await apiCall(`/payments/${paymentId}/refund`, 'POST', refundData);
  }, [apiCall]);

  const validateCard = useCallback(async (cardData: CardData) => {
    return await apiCall('/cards/validate', 'POST', cardData);
  }, [apiCall]);

  const tokenizeCard = useCallback(async (cardData: CardData) => {
    return await apiCall('/cards/tokenize', 'POST', cardData);
  }, [apiCall]);

  const createTransfer = useCallback(async (transferData: TransferData) => {
    return await apiCall('/transfers', 'POST', transferData);
  }, [apiCall]);

  const getTransferStatus = useCallback(async (transferId: string) => {
    return await apiCall(`/transfers/${transferId}`);
  }, [apiCall]);

  const getExchangeRates = useCallback(async (baseCurrency: string = 'USD') => {
    return await apiCall(`/exchange-rates?base_currency=${baseCurrency}`);
  }, [apiCall]);

  const getTransactionHistory = useCallback(async (limit: number = 100) => {
    return await apiCall(`/transactions?limit=${limit}`);
  }, [apiCall]);

  return {
    loading,
    error,
    processPayment,
    getPaymentStatus,
    refundPayment,
    validateCard,
    tokenizeCard,
    createTransfer,
    getTransferStatus,
    getExchangeRates,
    getTransactionHistory,
  };
};
