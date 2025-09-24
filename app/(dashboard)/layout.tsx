'use client';

import { useEffect, memo, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FinanceProvider } from '@/contexts/FinanceContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { Toaster } from '@/components/ui/toast';
import { SidebarProvider, ResponsiveSidebarLayout } from '@/components/ui/sidebar-layout';
import { SidebarContent } from '@/components/ui/sidebar-content';
import { SidebarToggle } from '@/components/ui/sidebar-toggle';
import { MobileAppHeader } from '@/components/ui/mobile-app-header';
import { MobileNavigation } from '@/components/ui/mobile-navigation';
import { NavigationLoader } from '@/components/ui/navigation-loader';

// Memoized loading component to prevent re-renders
const LoadingSpinner = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-background px-4">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
      <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

// Memoized sidebar content to prevent unnecessary re-renders
const MemoizedSidebarContent = memo(() => (
  <SidebarContent onAddMoney={() => {}} />
));

MemoizedSidebarContent.displayName = 'MemoizedSidebarContent';

// Memoized mobile components
const MemoizedMobileAppHeader = memo(() => <MobileAppHeader />);
MemoizedMobileAppHeader.displayName = 'MemoizedMobileAppHeader';

const MemoizedMobileNavigation = memo(() => (
  <MobileNavigation onAddMoney={() => {}} />
));
MemoizedMobileNavigation.displayName = 'MemoizedMobileNavigation';

// Memoized content wrapper to prevent re-renders
const ContentWrapper = memo(({ children }: { children: React.ReactNode }) => (
  <div className="w-full max-w-full lg:pt-0">
    <div
      className="lg:hidden"
      style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))' }}
    >
      {children}
    </div>
    <div className="hidden lg:block">
      {children}
    </div>
  </div>
));

ContentWrapper.displayName = 'ContentWrapper';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Memoize authentication check to prevent unnecessary re-renders
  const authStatus = useMemo(() => ({
    isAuthenticated: !loading && !!user,
    isLoading: loading,
    shouldRedirect: !loading && !user
  }), [user, loading]);

  // Check if user is authenticated - NO AUTH BYPASS
  useEffect(() => {
    if (authStatus.shouldRedirect) {
      console.log('User not authenticated, redirecting to signin');
      router.push('/signin');
    }
  }, [authStatus.shouldRedirect, router]);

  // Show loading spinner while checking authentication
  if (authStatus.isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to signin if not authenticated
  if (!authStatus.isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  // Always use the real FinanceProvider with API client integration
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation loader for page transitions */}
      <NavigationLoader />
      
      <FinanceProvider>
        <NotificationProvider>
          <SidebarProvider>
            <ResponsiveSidebarLayout
              sidebar={<MemoizedSidebarContent />}
            >
              <SidebarToggle />

              {/* Mobile Header - Only show on mobile */}
              <MemoizedMobileAppHeader />

              <ContentWrapper>
                {children}
              </ContentWrapper>

              {/* Mobile Navigation - Only show on mobile */}
              <MemoizedMobileNavigation />
            </ResponsiveSidebarLayout>
          </SidebarProvider>
        </NotificationProvider>
      </FinanceProvider>
      <Toaster />
    </div>
  );
}
