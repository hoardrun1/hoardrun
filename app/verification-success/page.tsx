'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

function VerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const email = searchParams?.get('email') || '';

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher variant="mobile" />
      </div>

      <div className="max-w-md w-full bg-card rounded-xl shadow-xl p-8 text-center border border-border">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2 text-foreground">Email Verified Successfully!</h1>
        
        <p className="text-muted-foreground mb-6">
          Your email address has been verified. You can now sign in to your account.
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center text-muted-foreground">
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

export default function VerificationSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-border">
          <Loader2 className="h-16 w-16 text-primary mx-auto mb-6 animate-spin" />
          <h1 className="text-2xl font-bold text-foreground mb-4">Loading...</h1>
        </div>
      </div>
    }>
      <VerificationContent />
    </Suspense>
  );
}
