import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { navigation } from '@/lib/navigation';

const publicRoutes = ['/signin', '/signup'];
const protectedRoutes = ['home', 'dashboard', 'create-profile', 'verify-email'];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const routeName = path.split('/')[1];

  // Allow public routes
  if (publicRoutes.includes(path)) {
    return NextResponse.next();
  }

  // Check if we should bypass auth globally (not just in development)
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
  if (bypassAuth) {
    console.log('Auth bypass enabled globally');
    return NextResponse.next();
  }

  // Get the token from cookies
  const token = request.cookies.get('auth-token')?.value;

  // Protect these routes
  const protectedPaths = ['/home', '/finance', '/cards', '/investment', '/settings',
                         '/send-money', '/receive-money', '/savings']
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !token) {
    const redirectUrl = new URL('/signin', request.url)
    redirectUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
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
    '/signin',
    '/signup'
  ]
}
