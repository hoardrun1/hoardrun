'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function LoginRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the signin page
    router.replace('/signin')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
        <p className="text-white">Redirecting to sign in...</p>
      </div>
    </div>
  )
}
