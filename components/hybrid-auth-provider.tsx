'use client'

import { SessionProvider } from 'next-auth/react'
import { AuthProvider as CognitoAuthProvider } from '@/contexts/AuthContext'

export default function HybridAuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <CognitoAuthProvider>
        {children}
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
  // Use Cognito for all authentication now that Firebase is removed
  return <CognitoAuthProvider>{children}</CognitoAuthProvider>
}
