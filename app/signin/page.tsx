'use client'

import { SignInPage } from '@/components/signin-page'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

export default function SignIn() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <SignInPage />
    </Suspense>
  )
}
