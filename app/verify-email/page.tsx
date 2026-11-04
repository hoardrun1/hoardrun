'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Email confirmation happens with a code on /check-email, which needs the email too; older links land here
function VerifyEmailRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const email = searchParams?.get('email')
    router.replace(email ? `/check-email?email=${encodeURIComponent(email)}` : '/signin')
  }, [router, searchParams])

  return <div className="fixed inset-0 bg-black" />
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-black" />}>
      <VerifyEmailRedirect />
    </Suspense>
  )
}
