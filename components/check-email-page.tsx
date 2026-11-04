'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Mail, Check } from 'lucide-react'
import Link from 'next/link'
import { AuthError, AuthShell } from '@/components/auth/auth-shell'
import { API_BASE_URL } from '@/lib/api-url'

function CheckEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resent, setResent] = useState(false)

  useEffect(() => {
    setMounted(true)

    const emailFromParams = searchParams?.get('email')
    if (emailFromParams) {
      setEmail(decodeURIComponent(emailFromParams))
      return
    }

    setTimeout(() => {
      router.push('/signup')
    }, 100)
  }, [router, searchParams])

  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return // Only allow digits

    const newCode = [...verificationCode]
    newCode[index] = value.slice(-1) // Only take last character
    setVerificationCode(newCode)
    setError('')

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newCode = [...verificationCode]
    
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i]
    }
    
    setVerificationCode(newCode)
    
    // Focus the next empty input or the last one
    const nextEmptyIndex = newCode.findIndex(c => !c)
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex
    document.getElementById(`code-${focusIndex}`)?.focus()
  }

  const handleVerifyCode = async () => {
    const code = verificationCode.join('')
    
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: code })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || data.detail || 'Verification failed')
      }

      setSuccess(true)
      
      // Redirect to signin after 2 seconds
      setTimeout(() => {
        router.push('/signin')
      }, 2000)

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to verify code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    if (!email) return

    setIsResending(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      // Show success feedback
      setResent(true)
      setTimeout(() => setResent(false), 3000)
      
      // Clear the code inputs
      setVerificationCode(['', '', '', '', '', ''])
      document.getElementById('code-0')?.focus()

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to resend verification email')
    } finally {
      setIsResending(false)
    }
  }

  if (!mounted) return null

  return (
    <AuthShell
      visual={
        <div className="flex h-full items-center justify-center">
          <div className="lp-auth-art flex flex-col items-center">
            <div className="lp-glass flex h-24 w-24 items-center justify-center rounded-full">
              {success ? <Check className="h-10 w-10" strokeWidth={2.5} /> : <Mail className="h-10 w-10" strokeWidth={1.5} />}
            </div>
            <div className="mt-8 flex gap-2.5" aria-hidden="true">
              {verificationCode.map((digit, index) => (
                <span
                  key={index}
                  className={`lp-glass flex h-20 w-14 items-center justify-center rounded-2xl text-4xl font-semibold tabular-nums transition-opacity ${digit ? '' : 'opacity-50'}`}
                >
                  {digit}
                </span>
              ))}
            </div>
          </div>
        </div>
      }
      footerLink={
        <>
          <span>Already verified? </span>
          <Link href="/signin" className="lp-auth-link">
            Sign in
          </Link>
        </>
      }
    >
      {success ? (
        <div>
          <h1 className="lp-auth-title">Verification successful</h1>
          <p className="lp-auth-sub">Redirecting you to sign in...</p>
        </div>
      ) : (
        <div className="lp-auth-stack">
          <div>
            <h1 className="lp-auth-title">Verify your email</h1>
            <p className="lp-auth-sub">
              We&apos;ve sent a 6-digit code to <span className="break-all font-medium text-white">{email}</span>
            </p>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                aria-label={`Digit ${index + 1}`}
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="lp-input !h-14 !px-0 text-center !text-2xl font-semibold"
                disabled={isLoading}
              />
            ))}
          </div>

          {error && <AuthError>{error}</AuthError>}

          <button
            onClick={handleVerifyCode}
            className="lp-btn lp-btn-primary lp-auth-btn font-medium"
            disabled={isLoading || verificationCode.join('').length !== 6}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify code'
            )}
          </button>

          <button onClick={handleResendEmail} className="lp-link self-center rounded text-[13px] underline underline-offset-4" disabled={isResending}>
            {isResending ? 'Resending...' : resent ? 'Code sent' : "Didn't receive the code? Resend"}
          </button>

          <p className="text-center text-xs font-light text-[var(--lp-muted)]">
            Check your spam or junk folder, and make sure the address is correct. The code expires in 24 hours.
          </p>
        </div>
      )}
    </AuthShell>
  )
}

export function CheckEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    }>
      <CheckEmailContent />
    </Suspense>
  )
}