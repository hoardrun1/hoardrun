import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { navigation } from '@/lib/navigation';

const publicRoutes = ['/signin', '/signup'];
const protectedRoutes = ['home', 'dashboard', 'create-profile', 'verify-email'];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if we should bypass auth globally (not just in development)
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
  if (bypassAuth) {
    return NextResponse.next();
  }

  // Get the token from cookies - optimized single operation
  const token = request.cookies.get('access_token')?.value;

  // Allow access to signin page even if token exists
  // Users should be able to sign in again manually
  // The AuthContext will handle clearing old tokens and requiring fresh authentication

  // Allow public routes for unauthenticated users
  if (publicRoutes.includes(path) && !token) {
    return NextResponse.next();
  }

  // Protect these routes - optimized check
  const protectedPaths = ['/home', '/finance', '/cards', '/investment', '/settings',
                         '/send-money', '/receive-money', '/savings', '/startupregistration']
  
  if (!token && protectedPaths.some(protectedPath => path.startsWith(protectedPath))) {
    const redirectUrl = new URL('/signin', request.url)
    redirectUrl.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/home/:path*',
    '/finance/:path*',
    '/cards/:path*',
    '/investment/:path*',
    '/settings/:path*',
    '/send-money/:path*',
    '/receive-money/:path*',
    '/savings/:path*',
    '/startupregistration/:path*',
    '/signin',
    '/signup'
  ]
}
