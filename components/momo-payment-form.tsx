'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Smartphone, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const formSchema = z.object({
  amount: z.number().positive(),
  phone_number: z.string().min(10),
  currency: z.string(),
  payer_message: z.string().optional(),
  payee_note: z.string().optional(),
});

type MomoPaymentRequest = z.infer<typeof formSchema>;

interface MomoPaymentFormProps {
  onPaymentSuccess?: (result: any) => void;
  onPaymentError?: (error: string) => void;
}

export function MomoPaymentForm({ onPaymentSuccess, onPaymentError }: MomoPaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const { toast } = useToast();
  const { token } = useAuth();
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<MomoPaymentRequest>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currency: 'EUR',
      payer_message: 'Payment from Hoardrun',
      payee_note: 'Mobile money payment'
    }
  });

  const currency = watch('currency');

  const onSubmit = async (data: MomoPaymentRequest) => {
    if (!token) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to make a payment.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setPaymentStatus('pending');
    
    try {
      // Use the new backend API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/momo/send`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          provider: 'mtn_momo',
          amount: data.amount,
          currency: data.currency,
          phone_number: data.phone_number,
          payer_message: data.payer_message,
          payee_note: data.payee_note
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Payment failed');
      }

      const result = await response.json();
      const transactionData = result.data;
      
      setReferenceId(transactionData.reference_id || transactionData.id);

      toast({
        title: 'Payment Initiated',
        description: 'Please check your phone to complete the payment.',
      });

      // Start polling for payment status
      if (transactionData.reference_id || transactionData.id) {
        pollPaymentStatus(transactionData.reference_id || transactionData.id);
      }
      
    } catch (error) {
      setPaymentStatus('failed');
      const errorMessage = error instanceof Error ? error.message : 'Payment failed. Please try again later.';
      
      toast({
        title: 'Payment Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      onPaymentError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const pollPaymentStatus = async (transactionId: string) => {
    const maxAttempts = 24; // Poll for 2 minutes (24 * 5 seconds)
    let attempts = 0;
    
    const interval = setInterval(async () => {
      attempts++;
      
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/momo/transactions/${transactionId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (response.ok) {
          const statusResult = await response.json();
          const status = statusResult.data?.status;

          if (status === 'SUCCESSFUL' || status === 'completed') {
            setPaymentStatus('success');
            toast({
              title: 'Payment Successful',
              description: 'Your payment has been processed successfully.',
            });
            onPaymentSuccess?.(statusResult.data);
            clearInterval(interval);
          } else if (status === 'FAILED' || status === 'REJECTED' || status === 'failed') {
            setPaymentStatus('failed');
            toast({
              title: 'Payment Failed',
              description: 'The payment was not successful.',
              variant: 'destructive',
            });
            onPaymentError?.('Payment was rejected or failed');
            clearInterval(interval);
          }
        }
        
        // Stop polling after max attempts
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          toast({
            title: 'Payment Status Unknown',
            description: 'Please check your transaction history for the payment status.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        
        // Stop polling on error after a few attempts
        if (attempts >= 5) {
          clearInterval(interval);
        }
      }
    }, 5000); // Poll every 5 seconds
  };

  const resetForm = () => {
    setPaymentStatus('idle');
    setReferenceId(null);
  };

  if (paymentStatus === 'success') {
    return (
      <div className="text-center space-y-4 p-6">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-green-600">Payment Successful!</h3>
          <p className="text-sm text-gray-600 mt-2">
            Your MTN MOMO payment has been processed successfully.
          </p>
          {referenceId && (
            <p className="text-xs text-gray-500 mt-1">
              Reference: {referenceId}
            </p>
          )}
        </div>
        <Button onClick={resetForm} variant="outline" className="w-full">
          Make Another Payment
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Smartphone className="w-5 h-5 text-orange-600" />
        <h3 className="font-semibold">MTN Mobile Money Payment</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register('amount', { valueAsNumber: true })}
        />
        {errors.amount && (
          <p className="text-sm text-red-500">{errors.amount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <Select
          value={currency}
          onValueChange={(value) => setValue('currency', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EUR">EUR</SelectItem>
            <SelectItem value="USD">USD</SelectItem>
            <SelectItem value="GHS">GHS</SelectItem>
            <SelectItem value="UGX">UGX</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone_number">Phone Number</Label>
        <Input
          id="phone_number"
          type="tel"
          placeholder="+233XXXXXXXXX"
          {...register('phone_number')}
        />
        {errors.phone_number && (
          <p className="text-sm text-red-500">{errors.phone_number.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="payer_message">Message (Optional)</Label>
        <Input
          id="payer_message"
          type="text"
          placeholder="Payment description"
          {...register('payer_message')}
        />
      </div>

      <Button 
        type="submit" 
        disabled={isLoading || paymentStatus === 'pending'} 
        className="w-full bg-orange-600 hover:bg-orange-700"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : paymentStatus === 'pending' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Waiting for Confirmation...
          </>
        ) : (
          'Pay with MTN MOMO'
        )}
      </Button>
      
      {paymentStatus === 'pending' && (
        <div className="text-center text-sm text-gray-600 mt-2">
          <p>Please check your phone and approve the payment request.</p>
        </div>
      )}
    </form>
  );
}
