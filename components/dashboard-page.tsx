import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { navigation } from '@/lib/navigation';
import { useToast } from '@/components/ui/use-toast';

export function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const response = await fetch('/api/user/status', {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        });

        const data = await response.json();
        
        if (!data.emailVerified) {
          navigation.connect('dashboard', 'verify-email');
          router.push('/verify-email');
          return;
        }

        if (!data.profileComplete) {
          navigation.connect('dashboard', 'create-profile');
          router.push('/create-profile');
          return;
        }

        setIsLoading(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard",
          variant: "destructive"
        });
        router.push('/signin');
      }
    };

    checkUserStatus();
  }, [router, toast]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    // Your dashboard JSX
  );
}