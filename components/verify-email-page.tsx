'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [status, setStatus] = useState<'loading' | 'input' | 'success' | 'error'>('input')
  const [message, setMessage] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const verifyEmail = async () => {
      // Check if we came from the backend redirect with success/error params
      const successParam = searchParams?.get('success')
      const errorParam = searchParams?.get('error')
      const token = searchParams?.get('token')

      // Handle backend redirect results (for backward compatibility)
      if (successParam === 'true') {
        setStatus('success')
        setMessage('Your email has been verified successfully!')
        toast({
          title: "Success",
          description: "Your email has been verified. You can now sign in.",
        })

        // Clear any old user data from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-user')
        }

        // Redirect to signin after 3 seconds
        setTimeout(() => {
          router.push('/signin?verified=true')
        }, 3000)
        return
      }

      if (errorParam) {
        let errorMessage = 'Verification failed. The code may be invalid or expired.'

        if (errorParam === 'missing_token') {
          errorMessage = 'Invalid verification code - no code provided.'
        } else if (errorParam === 'network_error') {
          errorMessage = 'Network error occurred. Please try again.'
        }

        setStatus('error')
        setMessage(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        })
        return
      }

      // If token is provided in URL (backward compatibility), auto-verify
      if (token) {
        setStatus('loading')
        try {
          const response = await fetch('/api/auth/verify-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          })

          const data = await response.json()

          if (response.ok && data.verified) {
            setStatus('success')
            setMessage('Your email has been verified successfully!')
            toast({
              title: "Success",
              description: "Your email has been verified. You can now sign in.",
            })

            // Clear any old user data from localStorage
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth-user')
            }

            // Redirect to signin after 3 seconds
            setTimeout(() => {
              router.push('/signin?verified=true')
            }, 3000)
          } else {
            setStatus('error')
            setMessage(data.message || 'Verification failed. The code may be invalid or expired.')
            toast({
              title: "Error",
              description: data.message || 'Verification failed',
              variant: "destructive"
            })
          }
        } catch (error) {
          setStatus('error')
          setMessage('An error occurred during verification. Please try again.')
          toast({
            title: "Error",
            description: 'Network error occurred',
            variant: "destructive"
          })
        }
      } else {
        // No token in URL, show input form
        setStatus('input')
      }
    }

    verifyEmail()
  }, [searchParams, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!verificationCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter the verification code",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    setStatus('loading')

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationCode.trim() })
      })

      const data = await response.json()

      if (response.ok && data.verified) {
        setStatus('success')
        setMessage('Your email has been verified successfully!')
        toast({
          title: "Success",
          description: "Your email has been verified. You can now sign in.",
        })

        // Clear any old user data from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-user')
        }

        // Redirect to signin after 3 seconds
        setTimeout(() => {
          router.push('/signin?verified=true')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(data.message || 'Verification failed. The code may be invalid or expired.')
        toast({
          title: "Error",
          description: data.message || 'Verification failed',
          variant: "destructive"
        })
      }
    } catch (error) {
      setStatus('error')
      setMessage('An error occurred during verification. Please try again.')
      toast({
        title: "Error",
        description: 'Network error occurred',
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1545486332-9e0999c535b2?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
        }}
      />
      <div className="absolute inset-0 bg-black/70"></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <div className="bg-white/25 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-white/30 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 text-white animate-spin mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Verifying your email...</h1>
              <p className="text-white/80 text-sm">Please wait while we verify your email address.</p>
            </>
          )}

          {status === 'input' && (
            <>
              <div className="bg-blue-500/20 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Mail className="h-12 w-12 text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Verify Your Email</h1>
              <p className="text-white/80 text-sm mb-6">
                Enter the 6-digit verification code sent to your email address.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Enter verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full text-center text-2xl font-mono tracking-widest bg-white/10 border-white/30 text-white placeholder:text-white/50"
                  maxLength={6}
                  disabled={isSubmitting}
                />
                <Button
                  type="submit"
                  disabled={verificationCode.length !== 6 || isSubmitting}
                  className="w-full bg-white hover:bg-gray-100 text-black font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Email'
                  )}
                </Button>
              </form>
              <div className="mt-6 space-y-3">
                <Link
                  href="/check-email"
                  className="block text-white hover:text-gray-200 text-sm underline"
                >
                  Didn't receive the code? Check your email
                </Link>
                <Link
                  href="/signup"
                  className="block text-white hover:text-gray-200 text-sm underline"
                >
                  Create a new account
                </Link>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="bg-green-500/20 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Email Verified!</h1>
              <p className="text-white/80 text-sm mb-6">{message}</p>
              <p className="text-white/60 text-xs mb-4">Redirecting to sign in...</p>
              <Button
                onClick={() => router.push('/signin?verified=true')}
                className="w-full bg-white hover:bg-gray-100 text-black font-semibold"
              >
                Go to Sign In
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="bg-red-500/20 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <XCircle className="h-12 w-12 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
              <p className="text-white/80 text-sm mb-6">{message}</p>
              <div className="space-y-3">
                <Button
                  onClick={() => setStatus('input')}
                  className="w-full bg-white hover:bg-gray-100 text-black font-semibold"
                >
                  Try Again
                </Button>
                <Link
                  href="/signup"
                  className="block text-white hover:text-gray-200 text-sm underline"
                >
                  Create a new account
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}