'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Shield, CheckCircle } from 'lucide-react';
import { useMastercard } from '@/hooks/useMastercard';

interface MastercardPaymentProps {
  onPaymentSuccess?: (result: any) => void;
  onPaymentError?: (error: string) => void;
}

export const MastercardPayment: React.FC<MastercardPaymentProps> = ({
  onPaymentSuccess,
  onPaymentError
}) => {
  const [paymentData, setPaymentData] = useState({
    amount: '',
    currency: 'USD',
    description: '',
    reference: '',
    card_number: '',
    expiry_month: '',
    expiry_year: '',
    cvv: '',
    cardholder_name: ''
  });

  const [step, setStep] = useState<'card' | 'payment' | 'success'>('card');
  const [cardToken, setCardToken] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  const {
    loading,
    error,
    validateCard,
    tokenizeCard,
    processPayment,
    getPaymentStatus
  } = useMastercard();

  const handleCardValidation = async () => {
    try {
      const cardData = {
        card_number: paymentData.card_number,
        expiry_month: paymentData.expiry_month,
        expiry_year: paymentData.expiry_year,
        cvv: paymentData.cvv
      };

      const validationResult = await validateCard(cardData);
      
      if (validationResult.is_valid) {
        // Tokenize the card for secure storage
        const tokenResult = await tokenizeCard({
          ...cardData,
          cardholder_name: paymentData.cardholder_name
        });
        
        setCardToken(tokenResult.token);
        setStep('payment');
      } else {
        onPaymentError?.('Card validation failed. Please check your card details.');
      }
    } catch (err) {
      onPaymentError?.(err instanceof Error ? err.message : 'Card validation failed');
    }
  };

  const handlePayment = async () => {
    try {
      if (!cardToken) {
        throw new Error('Card token not available');
      }

      const payment = {
        amount: parseFloat(paymentData.amount),
        currency: paymentData.currency,
        payment_method: {
          type: 'card',
          token: cardToken
        },
        description: paymentData.description || 'Payment via Hoardrun',
        reference: paymentData.reference || undefined
      };

      const result = await processPayment(payment);
      setPaymentResult(result);
      setStep('success');
      onPaymentSuccess?.(result);
    } catch (err) {
      onPaymentError?.(err instanceof Error ? err.message : 'Payment processing failed');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setPaymentData({
      amount: '',
      currency: 'USD',
      description: '',
      reference: '',
      card_number: '',
      expiry_month: '',
      expiry_year: '',
      cvv: '',
      cardholder_name: ''
    });
    setStep('card');
    setCardToken(null);
    setPaymentResult(null);
  };

  if (step === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-green-600">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Payment ID: {paymentResult?.payment_id}
            </p>
            <p className="text-lg font-semibold">
              {paymentData.currency} {paymentData.amount}
            </p>
            <p className="text-sm text-gray-600">
              Status: {paymentResult?.status}
            </p>
          </div>
          
          <Button 
            onClick={resetForm}
            className="w-full"
            variant="outline"
          >
            Make Another Payment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          {step === 'card' ? 'Card Details' : 'Payment Details'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'card' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="cardholder_name">Cardholder Name</Label>
              <Input
                id="cardholder_name"
                value={paymentData.cardholder_name}
                onChange={(e) => handleInputChange('cardholder_name', e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="card_number">Card Number</Label>
              <Input
                id="card_number"
                value={paymentData.card_number}
                onChange={(e) => handleInputChange('card_number', e.target.value)}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2">
                <Label htmlFor="expiry_month">Month</Label>
                <Select
                  value={paymentData.expiry_month}
                  onValueChange={(value) => handleInputChange('expiry_month', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        {String(i + 1).padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry_year">Year</Label>
                <Select
                  value={paymentData.expiry_year}
                  onValueChange={(value) => handleInputChange('expiry_year', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="YY" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      return (
                        <SelectItem key={year} value={String(year).slice(-2)}>
                          {String(year).slice(-2)}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  value={paymentData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                  placeholder="123"
                  maxLength={4}
                  required
                />
              </div>
            </div>

            <Button 
              onClick={handleCardValidation}
              disabled={loading || !paymentData.card_number || !paymentData.expiry_month || !paymentData.expiry_year || !paymentData.cvv}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validating Card...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Validate & Continue
                </>
              )}
            </Button>
          </>
        )}

        {step === 'payment' && (
          <>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Card validated successfully
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={paymentData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={paymentData.currency}
                onValueChange={(value) => handleInputChange('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="GHS">GHS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={paymentData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Payment description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Reference (Optional)</Label>
              <Input
                id="reference"
                value={paymentData.reference}
                onChange={(e) => handleInputChange('reference', e.target.value)}
                placeholder="Payment reference"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => setStep('card')}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handlePayment}
                disabled={loading || !paymentData.amount}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ${paymentData.currency} ${paymentData.amount}`
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
