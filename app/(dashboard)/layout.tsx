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
  const { user, isLoading } = useAuth();

  // Check if auth bypass is enabled
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

  // Check if user is authenticated
  useEffect(() => {
    if (bypassAuth) {
      console.log('Auth bypass enabled - skipping dashboard authentication check');
      return;
    }

    if (!isLoading && !user) {
      router.push('/signin');
    }
  }, [user, isLoading, router, bypassAuth]);

  if (bypassAuth) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Use the mock provider in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';

  // If we're in development mode and bypassing auth, use the mock provider
  if (isDevelopment && bypassAuth) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <MockFinanceProvider>
          {children}
        </MockFinanceProvider>
        <Toaster />
      </div>
    );
  }

  // Otherwise, use the real provider
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <FinanceProvider>
        {children}
      </FinanceProvider>
      <Toaster />
    </div>
  );
}
