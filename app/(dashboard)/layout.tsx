'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FinanceProvider } from '@/contexts/FinanceContext';
import { Toaster } from '@/components/ui/toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Check if user is authenticated - NO AUTH BYPASS
  useEffect(() => {
    if (!loading && !user) {
      console.log('User not authenticated, redirecting to signin');
      router.push('/signin');
    }
  }, [user, loading, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to signin if not authenticated
  if (!user) {
    return null; // Don't render anything while redirecting
  }

  // Always use the real FinanceProvider with API client integration
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
