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
        // Check if auth bypass is enabled
        const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

        if (bypassAuth) {
          console.log('Auth bypass enabled for dashboard');
          return; // Skip all checks when bypass is enabled
        }

        // Get token from sessionStorage
        const token = sessionStorage.getItem('token');

        // If there's no token, we'll still try to fetch the status
        // The API will return mock data for now
        const response = await fetch('/api/user/status', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
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
    <div>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Dashboard content */}
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-semibold mb-4">Welcome to Your Dashboard</h2>
            <p className="text-gray-600 mb-6">Your account has been successfully verified.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium mb-2">Account Balance</h3>
                <p className="text-2xl font-bold">$0.00</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium mb-2">Investments</h3>
                <p className="text-2xl font-bold">$0.00</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium mb-2">Savings</h3>
                <p className="text-2xl font-bold">$0.00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}