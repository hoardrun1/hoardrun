import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// List of public routes that don't require authentication
const publicRoutes = [
  '/api/sign-in',
  '/api/sign-up',
  '/api/verify-code',
  '/api/forgot-password',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check for auth token
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new NextResponse(
      JSON.stringify({ error: 'Missing or invalid authorization header' }),
      { status: 401 }
    )
  }

  const token = authHeader.split(' ')[1]

  try {
    // Verify JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)

    // Add user info to request headers for downstream use
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.sub as string)
    requestHeaders.set('x-user-email', payload.email as string)

    // Continue with modified headers
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    return response
  } catch (error) {
    console.error('Auth middleware error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Invalid or expired token' }),
      { status: 401 }
    )
  }
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    '/api/:path*',
    // Exclude public routes
    '/((?!api/sign-in|api/sign-up|api/verify-code|api/forgot-password).*)',
  ],
} 