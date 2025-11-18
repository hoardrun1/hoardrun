'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, CheckCircle } from 'lucide-react'
import Link from 'next/link'

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
      const response = await fetch('https://hoardrun-backend-py-1.onrender.com/api/v1/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: code })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Verification failed')
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
      const response = await fetch('https://hoardrun-backend-py-1.onrender.com/api/v1/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      // Show success feedback
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-out"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1545486332-9e0999c535b2?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
          transform: mounted ? 'scale(1)' : 'scale(1.1)'
        }}
      />
      
      <div className="absolute inset-0 bg-black/70"></div>

      {/* Animated geometric background pattern */}
      <div className="absolute inset-0 opacity-5 sm:opacity-10">
        <div 
          className="absolute top-0 left-0 w-48 sm:w-96 h-48 sm:h-96 border border-white/30 rounded-full -translate-x-24 sm:-translate-x-48 -translate-y-24 sm:-translate-y-48 transition-all duration-[3s] ease-out"
          style={{
            transform: mounted 
              ? 'translateX(-6rem) translateY(-6rem) rotate(45deg) sm:translateX(-12rem) sm:translateY(-12rem)' 
              : 'translateX(-8rem) translateY(-8rem) rotate(0deg) sm:translateX(-16rem) sm:translateY(-16rem)'
          }}
        ></div>
        <div 
          className="absolute bottom-0 right-0 w-48 sm:w-96 h-48 sm:h-96 border border-white/30 rounded-full translate-x-24 sm:translate-x-48 translate-y-24 sm:translate-y-48 transition-all duration-[3.5s] ease-out"
          style={{
            transform: mounted 
              ? 'translateX(6rem) translateY(6rem) rotate(-45deg) sm:translateX(12rem) sm:translateY(12rem)' 
              : 'translateX(8rem) translateY(8rem) rotate(0deg) sm:translateX(16rem) sm:translateY(16rem)'
          }}
        ></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/20 rounded-full animate-bounce"
            style={{
              left: `${15 + i * 12}%`,
              top: `${25 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
        <div className="w-full max-w-7xl mx-auto">
          
          {/* Header section */}
          <div 
            className="text-center mb-8 sm:mb-12 transition-all duration-1000 ease-out"
            style={{
              transform: mounted ? 'translateY(0)' : 'translateY(-30px)',
              opacity: mounted ? 1 : 0
            }}
          >
            <div 
              className="mx-auto w-16 sm:w-20 h-16 sm:h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-2xl transition-all duration-700 ease-out hover:scale-110 border border-white/20"
              style={{
                transform: mounted ? 'scale(1) rotate(0deg)' : 'scale(0.8) rotate(-180deg)',
                transitionDelay: '300ms'
              }}
            >
              <Mail 
                className="h-8 sm:h-10 w-8 sm:w-10 text-white transition-all duration-500"
                style={{
                  transform: mounted ? 'scale(1)' : 'scale(0.5)'
                }}
              />
            </div>
            
            <h1 
              className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4 transition-all duration-700 ease-out px-2"
              style={{
                transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                opacity: mounted ? 1 : 0,
                transitionDelay: '400ms'
              }}
            >
              Verify Your Email
            </h1>
            <p 
              className="text-white text-sm sm:text-base mb-2 leading-relaxed transition-all duration-700 ease-out max-w-2xl mx-auto px-2"
              style={{
                transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                opacity: mounted ? 1 : 0,
                transitionDelay: '500ms'
              }}
            >
              We've sent a 6-digit verification code to
            </p>
            <p 
              className="text-white font-semibold text-base sm:text-lg transition-all duration-700 ease-out break-all px-2"
              style={{
                transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                opacity: mounted ? 1 : 0,
                transitionDelay: '600ms'
              }}
            >
              {email}
            </p>
          </div>

          {/* Main verification card */}
          <div 
            className="max-w-md mx-auto transition-all duration-1000 ease-out"
            style={{
              transform: mounted ? 'translateY(0)' : 'translateY(30px)',
              opacity: mounted ? 1 : 0,
              transitionDelay: '800ms'
            }}
          >
            <div className="bg-white/25 sm:bg-white/30 backdrop-blur-sm rounded-xl shadow-2xl p-4 sm:p-6 border border-white/30 transition-all duration-500 hover:shadow-3xl hover:bg-white/35">
              
              {success ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-white mb-2">Verification Successful!</h2>
                  <p className="text-white text-sm">Redirecting you to sign in...</p>
                </div>
              ) : (
                <>
                  <h2 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 text-center">
                    Enter Verification Code
                  </h2>
                  
                  {/* Code input fields */}
                  <div className="flex justify-center gap-2 mb-4">
                    {verificationCode.map((digit, index) => (
                      <input
                        key={index}
                        id={`code-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold bg-white/90 text-black rounded-lg border-2 border-white/50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all"
                        disabled={isLoading}
                      />
                    ))}
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                      <p className="text-red-200 text-sm text-center">{error}</p>
                    </div>
                  )}

                  <Button
                    onClick={handleVerifyCode}
                    className="w-full bg-white hover:bg-gray-100 text-black py-2.5 sm:py-3 text-sm font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 mb-3"
                    disabled={isLoading || verificationCode.join('').length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span className="text-xs sm:text-sm">Verifying...</span>
                      </>
                    ) : (
                      <span className="text-xs sm:text-sm">Verify Code</span>
                    )}
                  </Button>

                  <div className="text-center mb-4">
                    <button
                      onClick={handleResendEmail}
                      className="text-white hover:text-gray-200 text-sm underline transition-all duration-200"
                      disabled={isResending}
                    >
                      {isResending ? 'Resending...' : "Didn't receive the code? Resend"}
                    </button>
                  </div>

                  <div className="text-center text-white text-xs sm:text-sm">
                    <p>
                      Already verified?{' '}
                      <Link 
                        href="/signin" 
                        className="text-white hover:text-gray-200 font-semibold underline transition-all duration-200 hover:scale-105 inline-block"
                      >
                        Sign in
                      </Link>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Help section */}
          {!success && (
            <div 
              className="mt-8 max-w-md mx-auto transition-all duration-1000 ease-out"
              style={{
                transform: mounted ? 'translateY(0)' : 'translateY(30px)',
                opacity: mounted ? 1 : 0,
                transitionDelay: '900ms'
              }}
            >
              <div className="bg-white/25 backdrop-blur-sm rounded-xl shadow-2xl p-4 border border-white/30 text-center">
                <h3 className="font-bold text-white mb-3 text-sm">Can't find the code?</h3>
                <div className="space-y-2 text-white text-xs">
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 mr-2" />
                    <p>Check your spam or junk folder</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 mr-2" />
                    <p>Verify the email address is correct</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 mr-2" />
                    <p>The code expires in 24 hours</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
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