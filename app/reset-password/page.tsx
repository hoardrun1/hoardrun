'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, KeyRound, Loader2 } from 'lucide-react'
import { AuthError, AuthField, AuthShell, PasswordInput } from '@/components/auth/auth-shell'
import { API_BASE_URL } from '@/lib/api-url'

// The sign-up rule, so the server never has to refuse it
const passwordProblem = (password: string) => {
  if (password.length < 8) return 'Use at least 8 characters.'
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) return 'Use upper and lower case letters.'
  if (!/\d/.test(password)) return 'Include at least one number.'
  return null
}

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams?.get('token') ?? ''
  const [valid, setValid] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  // Say up front if the link has expired, before a new password is typed
  useEffect(() => {
    if (!token) {
      setValid(false)
      return
    }
    fetch(`${API_BASE_URL}/auth/reset-password/check?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((body) => setValid(Boolean(body?.data?.valid)))
      .catch(() => setValid(true)) // The submit will say if it isn't
  }, [token])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const problem = passwordProblem(password)
    if (problem) return setError(problem)
    if (password !== confirm) return setError("The passwords don't match.")
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        const detail = typeof body?.detail === 'string' ? body.detail : body?.message
        setError(detail || "We couldn't change your password. Try again.")
        if (/expired|already used/i.test(detail || '')) setValid(false)
        return
      }
      setDone(true)
      setTimeout(() => router.push('/signin?reset=true'), 2000)
    } catch {
      setError("We couldn't reach Hoardrun. Check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell
      skipWelcome
      visual={
        <div className="flex h-full items-center justify-center">
          <div className="lp-glass flex h-24 w-24 items-center justify-center rounded-full">
            {done ? <Check className="h-10 w-10" strokeWidth={2.5} /> : <KeyRound className="h-10 w-10" strokeWidth={1.5} />}
          </div>
        </div>
      }
      footerLink={
        <>
          <span>Back to </span>
          <Link href="/signin" className="lp-auth-link">Sign in</Link>
        </>
      }
    >
      {done ? (
        <div>
          <h1 className="lp-auth-title">Password changed</h1>
          <p className="lp-auth-sub">Taking you to sign in…</p>
        </div>
      ) : valid === false ? (
        <div className="lp-auth-stack">
          <div>
            <h1 className="lp-auth-title">This link has expired</h1>
            <p className="lp-auth-sub">Reset links work once, for 1 hour. Ask for a new one and use the newest email.</p>
          </div>
          <Link href="/forgot-password" className="lp-btn lp-btn-primary lp-auth-btn font-medium">Get a new link</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="lp-auth-stack" noValidate>
          <div>
            <h1 className="lp-auth-title">Choose a new password</h1>
            <p className="lp-auth-sub">At least 8 characters, with upper and lower case letters and a number.</p>
          </div>
          <AuthField id="password" label="New password">
            <PasswordInput id="password" autoComplete="new-password" value={password} onChange={(e) => { setPassword(e.target.value); setError('') }} required />
          </AuthField>
          <AuthField id="confirm" label="Type it again">
            <PasswordInput id="confirm" autoComplete="new-password" value={confirm} onChange={(e) => { setConfirm(e.target.value); setError('') }} required />
          </AuthField>
          {error && <AuthError>{error}</AuthError>}
          <button type="submit" disabled={isLoading || valid === null} className="lp-btn lp-btn-primary lp-auth-btn font-medium">
            {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : 'Change password'}
          </button>
        </form>
      )}
    </AuthShell>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-black"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
