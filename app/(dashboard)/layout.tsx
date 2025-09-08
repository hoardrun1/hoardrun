'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FinanceProvider } from '@/contexts/FinanceContext';
import { MockFinanceProvider } from '@/contexts/MockFinanceContext';
import { Toaster } from '@/components/ui/toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Check if we should bypass auth in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

  // Check if user is authenticated
  useEffect(() => {
    // Skip authentication check if bypassing auth in development
    if (isDevelopment && bypassAuth) {
      console.log('Auth bypass enabled in development mode for dashboard');
      return;
    }

    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router, isDevelopment, bypassAuth]);

  // Skip loading check if bypassing auth in development
  if (loading && !(isDevelopment && bypassAuth)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If we're in development mode and bypassing auth, use the mock provider
  if (isDevelopment && bypassAuth) {
    return (
      <div className="min-h-screen bg-background overflow-x-hidden">
        <MockFinanceProvider>
          <div className="w-full max-w-full">
            {children}
          </div>
        </MockFinanceProvider>
        <Toaster />
      </div>
    );
  }

  // Otherwise, use the real provider
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <FinanceProvider>
        <div className="w-full max-w-full">
          {children}
        </div>
      </FinanceProvider>
      <Toaster />
    </div>
  );
}
