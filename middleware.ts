import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthPage = request.nextUrl.pathname.startsWith('/signin') || 
                     request.nextUrl.pathname.startsWith('/signup')

  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(new URL('/home', request.url))
    }
    return NextResponse.next()
  }

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

  return NextResponse.next()
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
