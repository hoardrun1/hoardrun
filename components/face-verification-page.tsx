'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, Clock, IdCard, Loader2, X } from 'lucide-react'
import { AuthError, AuthShell } from '@/components/auth/auth-shell'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient, type IdentityStatus } from '@/lib/api-client'

const COPY: Record<IdentityStatus['state'], { title: string; body: string; button?: string }> = {
  not_started: {
    title: 'Verify your identity',
    body: "US law asks us to confirm who you are before you send money or withdraw. You'll take a photo of a government ID and a quick selfie on Persona's secure page. It takes about two minutes.",
    button: 'Verify my identity',
  },
  in_progress: {
    title: 'Finish verifying',
    body: 'You started an identity check. Pick up where you left off on Persona’s secure page.',
    button: 'Continue',
  },
  in_review: {
    title: 'Checking your details',
    body: "Your identity check is with a reviewer. We'll email you as soon as it's done, usually within a day.",
  },
  verified: {
    title: 'Identity verified',
    body: 'You’re all set. Sending money and withdrawals are open to you.',
  },
  declined: {
    title: "We couldn't verify you",
    body: 'Your identity check didn’t go through. Try again with a clear, uncovered photo of a valid government ID.',
    button: 'Try again',
  },
}

function VerifyIdentity() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, loading } = useAuth()
  const [status, setStatus] = useState<IdentityStatus | null>(null)
  const [opening, setOpening] = useState(false)
  const [error, setError] = useState('')
  const loaded = useRef(false)

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      router.push('/signin?callbackUrl=/face-verification')
      return
    }
    if (loaded.current) return
    loaded.current = true
    // Back from Persona: ask the server, which asks Persona; the redirect itself proves nothing
    const back = searchParams?.get('done') === '1'
    ;(back ? apiClient.refreshIdentityCheck() : apiClient.getIdentityStatus()).then((response) => {
      if (response.data) setStatus(response.data)
      else setError(response.error || "We couldn't load your identity check.")
      if (back) window.history.replaceState(null, '', '/face-verification')
    })
  }, [loading, isAuthenticated, router, searchParams])

  const open = async () => {
    setOpening(true)
    setError('')
    const response = await apiClient.startIdentityCheck()
    if (response.error || !response.data?.url) {
      setError(response.error || "We couldn't open the identity check. Try again.")
      setOpening(false)
      return
    }
    window.location.assign(response.data.url)
  }

  const state = status?.state ?? 'not_started'
  const copy = COPY[state]
  const Icon = state === 'verified' ? Check : state === 'declined' ? X : state === 'in_review' ? Clock : IdCard

  return (
    <AuthShell
      skipWelcome
      visual={
        <div className="flex h-full items-center justify-center">
          <div className="lp-glass flex h-24 w-24 items-center justify-center rounded-full">
            {status ? <Icon className="h-10 w-10" strokeWidth={1.75} /> : <Loader2 className="h-10 w-10 animate-spin" strokeWidth={1.5} />}
          </div>
        </div>
      }
      footerLink={
        <>
          <span>Questions? </span>
          <Link href="/help" className="lp-auth-link">Get help</Link>
        </>
      }
    >
      {!status && !error ? (
        <div>
          <h1 className="lp-auth-title">One moment…</h1>
          <p className="lp-auth-sub">Checking where your identity check stands.</p>
        </div>
      ) : (
        <div className="lp-auth-stack">
          <div>
            <h1 className="lp-auth-title">{copy.title}</h1>
            <p className="lp-auth-sub">
              {status && !status.configured && state !== 'verified'
                ? "Identity checks aren't set up yet, so you can keep using Hoardrun for now."
                : copy.body}
            </p>
          </div>
          {error && <AuthError>{error}</AuthError>}
          {copy.button && status?.configured && (
            <button type="button" onClick={open} disabled={opening} className="lp-btn lp-btn-primary lp-auth-btn font-medium">
              {opening ? <><Loader2 className="h-4 w-4 animate-spin" /> Opening…</> : copy.button}
            </button>
          )}
          <Link href="/home" className={state === 'verified' || !copy.button || !status?.configured
            ? 'lp-btn lp-btn-primary lp-auth-btn font-medium'
            : 'lp-link self-center rounded text-[13px] underline underline-offset-4'}>
            {state === 'verified' || !copy.button || !status?.configured ? 'Go to Hoardrun' : 'Skip for now'}
          </Link>
          {copy.button && status?.configured && (
            <p className="text-center text-xs font-light text-[var(--lp-muted)]">
              Persona checks your ID for Hoardrun. Your photos go to Persona, not to Hoardrun&apos;s servers.
            </p>
          )}
        </div>
      )}
    </AuthShell>
  )
}

export function FaceVerificationPageComponent() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-black" />}>
      <VerifyIdentity />
    </Suspense>
  )
}
