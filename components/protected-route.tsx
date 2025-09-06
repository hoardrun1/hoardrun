import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Check if auth bypass is enabled
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

  if (bypassAuth) {
    console.log('Auth bypass enabled - skipping Firebase auth check');
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-full max-w-sm mb-4"></div>
          <div className="h-32 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-32 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/signin');
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Please sign in to access this page
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}
