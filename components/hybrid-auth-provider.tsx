'use client'

import { SessionProvider } from 'next-auth/react'
import { AuthProvider as CognitoAuthProvider } from '@/contexts/AuthContext'
import { AuthProvider as NextAuthProvider } from '@/contexts/NextAuthContext'

export default function HybridAuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <CognitoAuthProvider>
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
      </CognitoAuthProvider>
    </SessionProvider>
  )
}

// Alternative: Choose auth system based on environment
export function ConditionalAuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // Use NextAuth for production (Google OAuth for clients)
  // Use Cognito for development/enterprise features
  const useNextAuth = process.env.NODE_ENV === 'production' || 
                      process.env.NEXT_PUBLIC_USE_NEXTAUTH === 'true'

  if (useNextAuth) {
    return (
      <SessionProvider>
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
      </SessionProvider>
    )
  }

  // Fallback to Cognito system
  return <CognitoAuthProvider>{children}</CognitoAuthProvider>
}
