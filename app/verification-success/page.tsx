'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function VerificationSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const email = searchParams.get('email') || '';

  useEffect(() => {
    // Redirect to signin page after 5 seconds
    const timer = setTimeout(() => {
      router.push(`/signin?verified=true&email=${encodeURIComponent(email)}`);
    }, 5000);

    // Countdown timer
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [router, email]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Email Verified Successfully!</h1>
        
        <p className="text-gray-600 mb-6">
          Your email address has been verified. You can now sign in to your account.
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
            <span>Redirecting to sign in page in {countdown} seconds...</span>
          </div>
          
          <Button asChild className="w-full">
            <Link href={`/signin?verified=true&email=${encodeURIComponent(email)}`}>
              Sign In Now
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
