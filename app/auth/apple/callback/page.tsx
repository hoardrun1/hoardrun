'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, X } from 'lucide-react'
import { AuthShell } from '@/components/auth/auth-shell'
import { useAuth } from '@/contexts/AuthContext'
import { API_BASE_URL } from '@/lib/api-url'
import { APP_SCHEME, isAppSignIn, isNativeApp, takeAppSignInProof } from '@/lib/native'

const APPLE_ERRORS: Record<string, string> = {
  cancelled: 'You cancelled signing in with Apple.',
  expired: 'That sign-in took too long or was already used. Try again.',
  closed: 'This account is closed.',
}
const GENERIC = "Apple didn't finish signing you in. Try again."

/**
 * The server finishes the Apple sign-in and sends people here with a one-time ticket, which this page
 * turns into a Hoardrun session. A sign-in started in the phone app is handed back to the app.
 */
function AppleCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { login } = useAuth()
  const [error, setError] = useState('')
  const [appLink, setAppLink] = useState('')
  // A ticket works once, and React runs effects twice in development
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    const ticket = searchParams?.get('ticket')
    const appleError = searchParams?.get('error')
    const fromApp = (ticket && isAppSignIn(ticket)) || searchParams?.get('app') === '1'

    if (fromApp && !isNativeApp()) {
      // In the phone's browser: hand the result back to the app, which holds the secret to finish it
      const link = `${APP_SCHEME}://auth/apple/callback?${searchParams?.toString() ?? ''}`
      setAppLink(link)
      window.location.replace(link)
      return
    }

    if (appleError || !ticket) {
      if (fromApp) takeAppSignInProof()
      setError(APPLE_ERRORS[appleError ?? ''] ?? GENERIC)
      return
    }

    ;(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/apple/redeem`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticket, app_proof: isAppSignIn(ticket) ? takeAppSignInProof() : undefined }),
        })
        const body = await response.json().catch(() => ({}))
        const data = body?.data
        if (!response.ok || !data?.access_token) {
          throw new Error(typeof body?.detail === 'string' ? body.detail : body?.message || GENERIC)
        }
        login(data.access_token, {
          id: data.user.id,
          email: data.user.email,
          name: `${data.user.first_name} ${data.user.last_name === '-' ? '' : data.user.last_name}`.trim(),
          emailVerified: data.user.email_verified,
          profilePictureUrl: data.user.profile_picture_url,
        }, data.refresh_token)
        router.replace(data.next || '/home')
      } catch (err) {
        setError(err instanceof Error ? err.message : GENERIC)
      }
    })()
  }, [searchParams, login, router])

  return (
    <AuthShell
      skipWelcome
      visual={
        <div className="flex h-full items-center justify-center">
          <div className="lp-glass flex h-24 w-24 items-center justify-center rounded-full">
            {error ? <X className="h-10 w-10" strokeWidth={2} /> : <Loader2 className="h-10 w-10 animate-spin" strokeWidth={1.5} />}
          </div>
        </div>
      }
      footerLink={
        <>
          <span>New here? </span>
          <Link href="/signup" className="lp-auth-link">Create an account</Link>
        </>
      }
    >
      {appLink ? (
        <div className="lp-auth-stack">
          <div>
            <h1 className="lp-auth-title">Back to the Hoardrun app</h1>
            <p className="lp-auth-sub">If the app didn&apos;t open by itself, tap below.</p>
          </div>
          <a href={appLink} className="lp-btn lp-btn-primary lp-auth-btn font-medium">Open Hoardrun</a>
        </div>
      ) : error ? (
        <div className="lp-auth-stack">
          <div>
            <h1 className="lp-auth-title">Couldn&apos;t sign you in</h1>
            <p className="lp-auth-sub">{error}</p>
          </div>
          <Link href="/signin" className="lp-btn lp-btn-primary lp-auth-btn font-medium">Back to sign in</Link>
        </div>
      ) : (
        <div>
          <h1 className="lp-auth-title">Signing you in…</h1>
          <p className="lp-auth-sub">Finishing up with Apple.</p>
        </div>
      )}
    </AuthShell>
  )
}

export default function AppleCallbackPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-black" />}>
      <AppleCallbackContent />
    </Suspense>
  )
}
