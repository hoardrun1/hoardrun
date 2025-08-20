'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export function Web3FormsVerifyEmail() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'expired'>('idle')

  useEffect(() => {
    const token = searchParams.get('token')
    const emailParam = searchParams.get('email')

    if (token && emailParam) {
      setEmail(emailParam)
      setVerificationStatus('loading')
      verifyEmail(token, emailParam)
    } else {
      // If no token, show the resend form
      const emailFromParams = searchParams.get('email')
      if (emailFromParams) {
        setEmail(emailFromParams)
      }
    }
  }, [searchParams])

  const verifyEmail = async (token: string, email: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, email }),
      })

      const data = await response.json()

      if (data.success) {
        setVerificationStatus('success')
        setMessage('Your email has been verified successfully! You can now sign in to your account.')
        setIsSuccess(true)
        
        // Redirect to sign-in page after 3 seconds
        setTimeout(() => {
          router.push('/signin?verified=true')
        }, 3000)
      } else {
        if (data.expired) {
          setVerificationStatus('expired')
          setMessage('Your verification link has expired. Please request a new one below.')
        } else {
          setVerificationStatus('error')
          setMessage(data.error || 'Email verification failed. Please try again.')
        }
        setIsSuccess(false)
      }
    } catch (error) {
      setVerificationStatus('error')
      setMessage('An error occurred while verifying your email. Please try again.')
      setIsSuccess(false)
    }
  }

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
        setMessage('Verification email sent! Please check your inbox and spam folder.')
      } else {
        setIsSuccess(false)
        setMessage(data.error || 'Failed to send verification email. Please try again.')
      }
    } catch (error) {
      setIsSuccess(false)
      setMessage('Failed to send verification email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getIcon = () => {
    switch (verificationStatus) {
      case 'loading':
        return <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />
      case 'error':
      case 'expired':
        return <XCircle className="h-16 w-16 text-red-500" />
      default:
        return <Mail className="h-16 w-16 text-blue-500" />
    }
  }

  const getTitle = () => {
    switch (verificationStatus) {
      case 'loading':
        return 'Verifying Your Email...'
      case 'success':
        return 'Email Verified Successfully!'
      case 'expired':
        return 'Verification Link Expired'
      case 'error':
        return 'Verification Failed'
      default:
        return 'Check Your Email'
    }
  }

  // If we're in verification mode (have token), show verification status
  if (verificationStatus !== 'idle') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🏦 HoardRun</h1>
            <p className="text-gray-600">Email Verification</p>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {getIcon()}
              </div>
              <CardTitle className="text-xl">{getTitle()}</CardTitle>
              <CardDescription>
                {email && `Email: ${email}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className={
                verificationStatus === 'success' ? 'border-green-200 bg-green-50' :
                verificationStatus === 'error' || verificationStatus === 'expired' ? 'border-red-200 bg-red-50' :
                'border-blue-200 bg-blue-50'
              }>
                <AlertDescription className={
                  verificationStatus === 'success' ? 'text-green-800' :
                  verificationStatus === 'error' || verificationStatus === 'expired' ? 'text-red-800' :
                  'text-blue-800'
                }>
                  {message}
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {verificationStatus === 'success' && (
                  <div className="space-y-2">
                    <Button asChild className="w-full">
                      <Link href="/signin?verified=true">
                        Continue to Sign In
                      </Link>
                    </Button>
                    <p className="text-sm text-gray-500 text-center">
                      Redirecting automatically in 3 seconds...
                    </p>
                  </div>
                )}

                {(verificationStatus === 'expired' || verificationStatus === 'error') && (
                  <div className="space-y-2">
                    <form onSubmit={handleResendVerification} className="space-y-3">
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email address"
                          required
                        />
                      </div>
                      <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Send New Verification Email'
                        )}
                      </Button>
                    </form>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/signin">
                        Back to Sign In
                      </Link>
                    </Button>
                  </div>
                )}

                {verificationStatus === 'loading' && (
                  <div className="text-center">
                    <p className="text-sm text-gray-500">
                      Please wait while we verify your email address...
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Default view - resend verification form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏦 HoardRun</h1>
          <p className="text-gray-600">Email Verification</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Mail className="h-16 w-16 text-blue-500" />
            </div>
            <CardTitle className="text-xl">Check Your Email</CardTitle>
            <CardDescription>
              We've sent a verification link to your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-gray-600">
              <p>Didn't receive the email? Check your spam folder or request a new one below.</p>
            </div>

            {message && (
              <Alert className={isSuccess ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <AlertDescription className={isSuccess ? 'text-green-800' : 'text-red-800'}>
                  {message}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleResendVerification} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Resend Verification Email'
                )}
              </Button>
            </form>

            <div className="text-center">
              <Button asChild variant="ghost" size="sm">
                <Link href="/signin">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
