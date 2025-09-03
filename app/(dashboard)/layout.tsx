'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/NextAuthContext';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
