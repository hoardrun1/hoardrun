'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Loader2, Mail } from 'lucide-react'
import { AuthError, AuthField, AuthShell } from '@/components/auth/auth-shell'
import { API_BASE_URL } from '@/lib/api-url'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Ask for a reset link. The answer is the same whether or not the email has an account. */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!EMAIL.test(email.trim())) {
      setError('Enter the email you use for Hoardrun.')
      return
    }
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (!response.ok && response.status !== 422) throw new Error()
      if (response.status === 422) {
        setError('Enter the email you use for Hoardrun.')
        return
      }
      setSent(true)
    } catch {
      setError("We couldn't send the email right now. Try again in a moment.")
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
            {sent ? <Check className="h-10 w-10" strokeWidth={2.5} /> : <Mail className="h-10 w-10" strokeWidth={1.5} />}
          </div>
        </div>
      }
      footerLink={
        <>
          <span>Remembered it? </span>
          <Link href="/signin" className="lp-auth-link">Sign in</Link>
        </>
      }
    >
      {sent ? (
        <div className="lp-auth-stack">
          <div>
            <h1 className="lp-auth-title">Check your email</h1>
            <p className="lp-auth-sub">
              If there&apos;s a Hoardrun account for <span className="break-all font-medium text-white">{email.trim()}</span>, a link to
              choose a new password is on its way. It works once, for 1 hour.
            </p>
          </div>
          <button type="button" onClick={() => setSent(false)} className="lp-link self-center rounded text-[13px] underline underline-offset-4">
            Use a different email
          </button>
          <p className="text-center text-xs font-light text-[var(--lp-muted)]">
            Nothing after a few minutes? Check spam or junk, then ask again. You can ask once a minute.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="lp-auth-stack" noValidate>
          <div>
            <h1 className="lp-auth-title">Forgot your password?</h1>
            <p className="lp-auth-sub">Enter your email and we&apos;ll send you a link to choose a new one.</p>
          </div>
          <AuthField id="email" label="Email">
            <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setError('') }} className="lp-input" required />
          </AuthField>
          {error && <AuthError>{error}</AuthError>}
          <button type="submit" disabled={isLoading} className="lp-btn lp-btn-primary lp-auth-btn font-medium">
            {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
