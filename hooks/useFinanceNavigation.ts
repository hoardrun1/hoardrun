import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { navigation } from '@/lib/navigation';
import { useToast } from '@/components/ui/use-toast';

export const useFinanceNavigation = () => {
  const router = useRouter();
  const { toast } = useToast();

  const navigateTo = useCallback(async (
    to: string,
    data?: any,
    options?: {
      skipValidation?: boolean;
      replace?: boolean;
    }
  ) => {
    try {
      // Skip validation by default for faster navigation
      const method = options?.replace ? router.replace : router.push;
      await method(`/${to}`);

      return true;
    } catch (error) {
      toast({
        title: "Navigation Error",
        description: error instanceof Error ? error.message : "Navigation failed",
        variant: "destructive"
      });
      return false;
    }
  }, [router, toast]);

  const handleEmergency = useCallback(async (
    emergencyType: 'block-card' | 'fraud-report' | 'emergency-support'
  ) => {
    await navigateTo(emergencyType, undefined, { skipValidation: true });
  }, [navigateTo]);

  const getAvailableDestinations = useCallback(() => {
    const currentPath = window.location.pathname.substring(1) || 'home';
    return navigation.getAvailableDestinations(currentPath);
  }, []);

  return {
    navigateTo,
    handleEmergency,
    getAvailableDestinations,
    getCurrentPageData: (page: string) => navigation.getData(page),
    clearNavigationFlow: () => navigation.clearFlow()
  };
};