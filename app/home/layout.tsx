'use client';

import { FinanceProvider } from '@/contexts/FinanceContext';
import { MockFinanceProvider } from '@/contexts/MockFinanceContext';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use the mock provider in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

  // If we're in development mode and bypassing auth, use the mock provider
  if (isDevelopment && bypassAuth) {
    return (
      <MockFinanceProvider>
        {children}
      </MockFinanceProvider>
    );
  }

  // Otherwise, use the real provider
  return (
    <FinanceProvider>
      {children}
    </FinanceProvider>
  );
}
