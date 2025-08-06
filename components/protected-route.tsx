import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status } = useSession();
  const router = useRouter();

  // Check if auth bypass is enabled
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

  if (bypassAuth) {
    console.log('Auth bypass enabled - skipping NextAuth session check');
    return <>{children}</>;
  }

  if (status === 'loading') {
    return (
      <div className="p-4">
        <Skeleton className="h-8 w-full max-w-sm mb-4" />
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
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