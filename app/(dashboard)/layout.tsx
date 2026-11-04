'use client';

import { useCallback, useEffect, memo, useMemo, useState } from 'react';
import { Inter, Inter_Tight } from 'next/font/google';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FinanceProvider } from '@/contexts/FinanceContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { Toaster } from '@/components/ui/toast';
import { SidebarProvider, ResponsiveSidebarLayout } from '@/components/ui/sidebar-layout';
import { SidebarContent } from '@/components/ui/sidebar-content-unified';
import { MobileAppHeader } from '@/components/ui/mobile-app-header';
import { MobileNavigation } from '@/components/ui/mobile-navigation';
import { NavigationLoader } from '@/components/ui/navigation-loader-simple';
import { DepositModal } from '@/components/deposit-modal';
import '@/components/landing/landing.css';
import '@/components/app/app-theme.css';

const appFont = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600'], display: 'swap', variable: '--font-text' });
// Headings and figures: a tighter cut of Inter, set close like Revolut's display type
const displayFont = Inter_Tight({ subsets: ['latin'], display: 'swap', variable: '--font-display' });

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
const MemoizedSidebarContent = memo(({ onAddMoney }: { onAddMoney: () => void }) => (
  <SidebarContent onAddMoney={onAddMoney} />
));

MemoizedSidebarContent.displayName = 'MemoizedSidebarContent';

// Memoized mobile components
const MemoizedMobileAppHeader = memo(() => <MobileAppHeader />);
MemoizedMobileAppHeader.displayName = 'MemoizedMobileAppHeader';

const MemoizedMobileNavigation = memo(({ onAddMoney }: { onAddMoney: () => void }) => (
  <MobileNavigation onAddMoney={onAddMoney} />
));
MemoizedMobileNavigation.displayName = 'MemoizedMobileNavigation';

// Enhanced content wrapper with better spacing and layout
const ContentWrapper = memo(({ children }: { children: React.ReactNode }) => (
  <div className="w-full max-w-full">
    {/* One copy of the page: CSS adjusts the spacing, so pages mount and fetch once */}
    <div className="hr-page min-h-screen bg-background">
      <div className="dashboard-container">
        {children}
      </div>
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
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const openDeposit = useCallback(() => setIsDepositOpen(true), []);

  // Dialogs and menus render outside this tree, so the page root needs the theme too.
  useEffect(() => {
    const root = document.documentElement;
    const hadDark = root.classList.contains('dark');
    const fonts = [appFont.variable, displayFont.variable];
    root.classList.add('dark', 'hr-app', ...fonts);
    return () => {
      root.classList.remove('hr-app', ...fonts);
      if (!hadDark) root.classList.remove('dark');
    };
  }, []);

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

  // Check if current page should bypass sidebar layout
  const shouldBypassSidebar = false;

  // Always use the real FinanceProvider with API client integration
  return (
    <div className={`hr-app dark min-h-screen overflow-x-clip bg-background text-foreground ${appFont.className} ${appFont.variable} ${displayFont.variable}`}>
      {/* Navigation loader for page transitions */}
      <NavigationLoader />

      <FinanceProvider>
        <NotificationProvider>
          {shouldBypassSidebar ? (
            // Full-width layout for transactions page
            <div className="w-full">
              {children}
            </div>
          ) : (
            // Standard dashboard layout with sidebar
            <SidebarProvider>
              <ResponsiveSidebarLayout
                sidebar={<MemoizedSidebarContent onAddMoney={openDeposit} />}
              >
                {/* Mobile Header - Only show on mobile */}
                <MemoizedMobileAppHeader />

                <ContentWrapper>
                  {children}
                </ContentWrapper>

                {/* Mobile Navigation - Only show on mobile */}
                <MemoizedMobileNavigation onAddMoney={openDeposit} />
              </ResponsiveSidebarLayout>
              <DepositModal open={isDepositOpen} onOpenChange={setIsDepositOpen} />
            </SidebarProvider>
          )}
        </NotificationProvider>
      </FinanceProvider>
      <Toaster />
    </div>
  );
}
