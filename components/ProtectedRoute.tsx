import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Check if auth bypass is enabled
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

  useEffect(() => {
    if (bypassAuth) {
      console.log('Auth bypass enabled - skipping authentication check');
      return;
    }

    if (!isLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, isLoading, router, bypassAuth]);

  if (bypassAuth) {
    return <>{children}</>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return user ? <>{children}</> : null;
}