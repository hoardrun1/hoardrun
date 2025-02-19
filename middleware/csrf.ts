import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { generateToken, validateToken } from '@/lib/csrf'

export async function middleware(request: NextRequest) {
  // Skip CSRF check for non-mutation methods
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    return NextResponse.next()
  }

  const csrfToken = request.headers.get('X-CSRF-Token')
  
  if (!csrfToken) {
    return new NextResponse(
      JSON.stringify({ message: 'CSRF token missing' }),
      { status: 403 }
    )
  }

  try {
    await validateToken(csrfToken)
    return NextResponse.next()
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: 'Invalid CSRF token' }),
      { status: 403 }
    )
  }
}

export const config = {
  matcher: '/api/:path*',
} 