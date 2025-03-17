'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { MomoPaymentRequest } from '@/types/momo';

const formSchema = z.object({
  amount: z.number().positive(),
  phone: z.string().min(10),
  message: z.string(),
});

export function MomoPaymentForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<MomoPaymentRequest>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: MomoPaymentRequest) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/momo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      const result = await response.json();

      toast({
        title: 'Payment Initiated',
        description: 'Please check your phone to complete the payment.',
      });

      // Start polling for payment status
      pollPaymentStatus(result.referenceId);
    } catch (error) {
      toast({
        title: 'Payment Failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pollPaymentStatus = async (referenceId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payments/momo?referenceId=${referenceId}`);
        const status = await response.json();

        if (status.status === 'SUCCESSFUL') {
          toast({
            title: 'Payment Successful',
            description: 'Your payment has been processed successfully.',
          });
          clearInterval(interval);
        } else if (status.status === 'FAILED' || status.status === 'REJECTED') {
          toast({
            title: 'Payment Failed',
            description: 'The payment was not successful.',
            variant: 'destructive',
          });
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 5000); // Poll every 5 seconds
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          type="number"
          placeholder="Amount"
          {...register('amount', { valueAsNumber: true })}
        />
        {errors.amount && (
          <p className="text-sm text-red-500">{errors.amount.message}</p>
        )}
      </div>

      <div>
        <Input
          type="tel"
          placeholder="Phone Number"
          {...register('phone')}
        />
        {errors.phone && (
          <p className="text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <Input
          type="text"
          placeholder="Payment Description"
          {...register('message')}
        />
        {errors.message && (
          <p className="text-sm text-red-500">{errors.message.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Pay with MTN MOMO'
        )}
      </Button>
    </form>
  );
}