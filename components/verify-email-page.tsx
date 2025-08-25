'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()
  const { user, resendConfirmationCode, confirmSignUp } = useAuth()

  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [showCodeInput, setShowCodeInput] = useState(false)

  useEffect(() => {
    // Get email from URL params or user context
    const emailParam = searchParams?.get('email')
    const codeParam = searchParams?.get('code')

    if (emailParam) {
      setEmail(emailParam)
    } else if (user?.email) {
      setEmail(user.email)
    } else {
      // No email found, redirect to signup
      router.push('/signup')
      return
    }

    // If there's a verification code in URL, show the input
    if (codeParam) {
      setVerificationCode(codeParam)
      setShowCodeInput(true)
      handleEmailVerification(codeParam, emailParam || user?.email || '')
    }
  }, [router, searchParams, user])

  const handleEmailVerification = async (code: string, userEmail: string) => {
    if (!code || !userEmail) return

    setVerificationStatus('pending')
    setIsLoading(true)

    try {
      // Use AWS Cognito confirmSignUp
      await confirmSignUp(userEmail, code)

      setVerificationStatus('success')
      addToast({
        title: "Email Verified!",
        description: "Your account has been successfully verified. You can now sign in.",
      })

      // Redirect to signin page after a delay
      setTimeout(() => {
        router.push('/signin?verified=true')
      }, 2000)

    } catch (error: any) {
      console.error('Email verification error:', error)
      setVerificationStatus('error')

      let errorMessage = 'Email verification failed'
      if (error.name === 'CodeMismatchException') {
        errorMessage = 'Invalid verification code. Please check and try again.'
      } else if (error.name === 'ExpiredCodeException') {
        errorMessage = 'Verification code has expired. Please request a new one.'
      } else if (error.name === 'NotAuthorizedException') {
        errorMessage = 'User is already confirmed or verification failed.'
      }

      addToast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!email) {
      addToast({
        title: "Error",
        description: "No email address found. Please sign up again.",
        variant: "destructive"
      })
      return
    }

    setIsResending(true)
    try {
      // Use AWS Cognito resendConfirmationCode
      await resendConfirmationCode(email)

      addToast({
        title: "Success",
        description: "Verification code has been resent to your email"
      })
    } catch (error: any) {
      console.error('Resend code error:', error)

      let errorMessage = 'Failed to resend verification code'
      if (error.name === 'UserNotFoundException') {
        errorMessage = 'User not found. Please sign up again.'
      } else if (error.name === 'InvalidParameterException') {
        errorMessage = 'User is already confirmed.'
      }

      addToast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsResending(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verificationCode.trim()) {
      addToast({
        title: "Error",
        description: "Please enter the verification code",
        variant: "destructive"
      })
      return
    }

    await handleEmailVerification(verificationCode.trim(), email)
  }


  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Geometric background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 border border-white/20 rounded-full -translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 border border-white/20 rounded-full translate-x-48 translate-y-48"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 border border-white/10 rounded-full -translate-x-32 -translate-y-32"></div>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-black to-gray-900/50"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left side - Decorative content */}
          <div className="text-white space-y-8 hidden lg:block">
            <div className="space-y-6">
              <h2 className="text-5xl font-bold leading-tight">
                Almost
                <span className="block text-gray-400">There</span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                Just one more step to unlock your account and join thousands of users who trust our platform.
              </p>
            </div>
            
            {/* Feature highlights */}
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-white rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Secure Verification</h3>
                  <p className="text-gray-400">Advanced email verification keeps your account safe</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-white rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Instant Access</h3>
                  <p className="text-gray-400">Verify once and enjoy seamless access to all features</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-white rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Privacy First</h3>
                  <p className="text-gray-400">Your email is protected and never shared</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Main content */}
          <div className="w-full">
            <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-12 border border-gray-100">
              <div className="text-center">
                {/* Icon */}
                <div className="mx-auto w-20 h-20 bg-black rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <Mail className="h-10 w-10 text-white" />
                </div>

                {/* Header */}
                <h1 className="text-3xl lg:text-4xl font-bold text-black mb-3">
                  {verificationStatus === 'success' ? 'Email Verified!' :
                   verificationStatus === 'error' ? 'Verification Failed' :
                   'Verify Your Email'}
                </h1>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                  {verificationStatus === 'success' ? (
                    <>Your email has been successfully verified. You can now sign in to your account.</>
                  ) : verificationStatus === 'error' ? (
                    <>There was an issue verifying your email. Please try again or request a new code.</>
                  ) : (
                    <>We've sent a verification code to{' '}
                    <span className="font-semibold text-black">{email}</span></>
                  )}
                </p>

                {/* Content sections */}
                <div className="space-y-6">
                  {verificationStatus === 'success' ? (
                    /* Success state */
                    <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                      <div className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                        <div className="text-left">
                          <h3 className="font-semibold text-green-800 mb-2">Email Verified Successfully!</h3>
                          <p className="text-green-700">
                            Your account is now active. You will be redirected to the sign-in page shortly.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : verificationStatus === 'error' ? (
                    /* Error state */
                    <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                      <div className="flex items-start">
                        <XCircle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0 mt-1" />
                        <div className="text-left">
                          <h3 className="font-semibold text-red-800 mb-2">Verification Failed</h3>
                          <p className="text-red-700">
                            Please check your verification code and try again, or request a new code.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Verification code input */
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                      <div className="text-left">
                        <h3 className="font-semibold text-blue-800 mb-4">Enter Verification Code</h3>
                        <form onSubmit={handleCodeSubmit} className="space-y-4">
                          <div>
                            <input
                              type="text"
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value)}
                              placeholder="Enter 6-digit code"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono"
                              maxLength={6}
                              disabled={isLoading}
                            />
                          </div>
                          <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-lg"
                            disabled={isLoading || !verificationCode.trim()}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              'Verify Email'
                            )}
                          </Button>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Email instructions - only show in pending state */}
                  {verificationStatus === 'pending' && (
                    <div className="bg-gray-50 border-2 border-gray-200 p-6 rounded-xl">
                      <h3 className="font-bold text-black mb-3 text-left">Can't find the verification code?</h3>
                      <div className="text-left space-y-2 text-gray-700">
                        <p>• Check your spam or junk folder</p>
                        <p>• Make sure you entered the correct email address</p>
                        <p>• Wait a few minutes for the email to arrive</p>
                        <p>• The code is valid for 24 hours</p>
                      </div>
                    </div>
                  )}

                  {/* Development mode instructions */}
                  {process.env.NODE_ENV === 'development' && verificationStatus === 'pending' && (
                    <div className="bg-black text-white p-6 rounded-xl border-2 border-gray-800">
                      <h3 className="font-bold mb-3 text-left">Development Mode</h3>
                      <p className="text-gray-300 mb-3 text-left">
                        In development, you can use any 6-digit code for testing (e.g., 123456).
                      </p>
                      <p className="text-gray-400 text-sm text-left">
                        This message only appears in development mode.
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-4 pt-4">
                    {verificationStatus === 'success' ? (
                      <Button
                        onClick={() => router.push('/signin?verified=true')}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        Continue to Sign In
                      </Button>
                    ) : verificationStatus === 'error' ? (
                      <div className="space-y-3">
                        <Button
                          onClick={handleResendCode}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                          disabled={isResending}
                        >
                          {isResending ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            "Send New Code"
                          )}
                        </Button>
                        <Button
                          onClick={() => setVerificationStatus('pending')}
                          variant="outline"
                          className="w-full py-3 text-lg font-semibold rounded-xl"
                        >
                          Try Again
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={handleResendCode}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                        disabled={isResending}
                      >
                        {isResending ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Resending...
                          </>
                        ) : (
                          "Resend verification code"
                        )}
                      </Button>
                    )}

                    <div className="text-center text-gray-500 pt-2">
                      <p>
                        Need help?{' '}
                        <Link
                          href="/signup"
                          className="text-black hover:text-gray-700 font-semibold underline transition-colors"
                        >
                          Sign up again
                        </Link>
                        {' or '}
                        <Link
                          href="/signin"
                          className="text-black hover:text-gray-700 font-semibold underline transition-colors"
                        >
                          Sign in
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CheckEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div>Loading...</div></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}