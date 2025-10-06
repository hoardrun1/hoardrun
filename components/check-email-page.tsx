'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { LanguageSwitcher } from '@/components/ui/language-switcher'

function CheckEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showCodeInput, setShowCodeInput] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Get email from URL params
    const emailFromParams = searchParams?.get('email')
    if (emailFromParams) {
      setEmail(emailFromParams)
      return
    }

    // Fallback - redirect to signup if no email
    router.push('/signup')
  }, [router, searchParams])

  const handleResendEmail = async () => {
    if (!email) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      toast({
        title: "Success",
        description: "Verification email has been resent"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resend verification email",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verificationCode || verificationCode.length !== 6) return

    setIsVerifying(true)
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          code: verificationCode 
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      toast({
        title: "Success",
        description: "Email verified successfully!"
      })

      // Redirect to sign in
      router.push('/signin')
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Verification failed",
        variant: "destructive"
      })
    } finally {
      setIsVerifying(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher variant="mobile" />
      </div>

      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-out"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1545486332-9e0999c535b2?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
          transform: mounted ? 'scale(1)' : 'scale(1.1)'
        }}
      />
      
      {/* Faded dark overlay */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* Animated geometric background pattern */}
      <div className="absolute inset-0 opacity-5 sm:opacity-10">
        <div 
          className="absolute top-0 left-0 w-48 sm:w-96 h-48 sm:h-96 border border-white/30 rounded-full -translate-x-24 sm:-translate-x-48 -translate-y-24 sm:-translate-y-48 transition-all duration-&lsqb;3s&rsqb; ease-out"
          style={{
            transform: mounted 
              ? 'translateX(-6rem) translateY(-6rem) rotate(45deg) sm:translateX(-12rem) sm:translateY(-12rem)' 
              : 'translateX(-8rem) translateY(-8rem) rotate(0deg) sm:translateX(-16rem) sm:translateY(-16rem)'
          }}
        ></div>
        <div 
          className="absolute bottom-0 right-0 w-48 sm:w-96 h-48 sm:h-96 border border-white/30 rounded-full translate-x-24 sm:translate-x-48 translate-y-24 sm:translate-y-48 transition-all duration-&lsqb;3.5s&rsqb; ease-out"
          style={{
            transform: mounted 
              ? 'translateX(6rem) translateY(6rem) rotate(-45deg) sm:translateX(12rem) sm:translateY(12rem)' 
              : 'translateX(8rem) translateY(8rem) rotate(0deg) sm:translateX(16rem) sm:translateY(16rem)'
          }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 w-32 sm:w-64 h-32 sm:h-64 border border-white/20 rounded-full -translate-x-16 sm:-translate-x-32 -translate-y-16 sm:-translate-y-32 transition-all duration-&lsqb;4s&rsqb; ease-out"
          style={{
            transform: mounted 
              ? 'translateX(-4rem) translateY(-4rem) rotate(90deg) scale(1) sm:translateX(-8rem) sm:translateY(-8rem)' 
              : 'translateX(-4rem) translateY(-4rem) rotate(0deg) scale(0.8) sm:translateX(-8rem) sm:translateY(-8rem)'
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
        <div className="w-full">
          
          {/* Main content */}
          <div className="max-w-7xl mx-auto">
            
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
                Check your email
              </h1>
              <p 
                className="text-white text-sm sm:text-base mb-2 leading-relaxed transition-all duration-700 ease-out max-w-2xl mx-auto px-2"
                style={{
                  transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                  opacity: mounted ? 1 : 0,
                  transitionDelay: '500ms'
                }}
              >
                We've sent a verification link to
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

            {/* Main action card */}
            <div 
              className="max-w-md mx-auto transition-all duration-1000 ease-out"
              style={{
                transform: mounted ? 'translateY(0)' : 'translateY(30px)',
                opacity: mounted ? 1 : 0,
                transitionDelay: '800ms'
              }}
            >
              <div className="bg-white/25 sm:bg-white/30 backdrop-blur-sm rounded-xl shadow-2xl p-4 sm:p-6 border border-white/30 transition-all duration-500 hover:shadow-3xl hover:bg-white/35 text-center">
                <h2 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Ready to continue?</h2>
                <p className="text-white mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed">
                  Click the button below if you need us to resend the verification email.
                </p>
                
                {!showCodeInput ? (
                  <>
                    <Button
                      onClick={handleResendEmail}
                      className="w-full bg-white hover:bg-gray-100 text-black py-2.5 sm:py-3 text-sm font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 mb-3 sm:mb-4"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span className="text-xs sm:text-sm">Resending...</span>
                        </>
                      ) : (
                        <span className="text-xs sm:text-sm">Resend verification email</span>
                      )}
                    </Button>

                    <Button
                      onClick={() => setShowCodeInput(true)}
                      variant="outline"
                      className="w-full bg-transparent border-white text-white hover:bg-white/10 py-2.5 sm:py-3 text-sm font-semibold rounded-lg transition-all duration-300 mb-3 sm:mb-4"
                    >
                      <span className="text-xs sm:text-sm">Enter verification code</span>
                    </Button>
                  </>
                ) : (
                  <form onSubmit={handleVerifyCode} className="space-y-4">
                    <div>
                      <Label htmlFor="verificationCode" className="text-white text-sm font-medium mb-2 block">
                        Verification Code
                      </Label>
                      <Input
                        id="verificationCode"
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full bg-white/10 border-white/30 text-white placeholder-white/60 focus:border-white focus:bg-white/20"
                        maxLength={6}
                        required
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="flex-1 bg-white hover:bg-gray-100 text-black py-2.5 sm:py-3 text-sm font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                        disabled={isVerifying || verificationCode.length !== 6}
                      >
                        {isVerifying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span className="text-xs sm:text-sm">Verifying...</span>
                          </>
                        ) : (
                          <span className="text-xs sm:text-sm">Verify Code</span>
                        )}
                      </Button>
                      
                      <Button
                        type="button"
                        onClick={() => {
                          setShowCodeInput(false)
                          setVerificationCode('')
                        }}
                        variant="outline"
                        className="bg-transparent border-white text-white hover:bg-white/10 py-2.5 sm:py-3 text-sm font-semibold rounded-lg transition-all duration-300"
                      >
                        <span className="text-xs sm:text-sm">Cancel</span>
                      </Button>
                    </div>
                  </form>
                )}

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
              </div>
            </div>

            {/* Help section */}
            <div 
              className="mt-8 max-w-md mx-auto transition-all duration-1000 ease-out"
              style={{
                transform: mounted ? 'translateY(0)' : 'translateY(30px)',
                opacity: mounted ? 1 : 0,
                transitionDelay: '900ms'
              }}
            >
              <div className="bg-white/25 backdrop-blur-sm rounded-xl shadow-2xl p-4 border border-white/30 text-center">
                <h3 className="font-bold text-white mb-3 text-sm">Can't find the email?</h3>
                <div className="space-y-2 text-white text-xs">
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 mr-2" />
                    <p>Check your spam folder</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 mr-2" />
                    <p>Verify email address is correct</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CheckEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div>Loading...</div></div>}>
      <CheckEmailContent />
    </Suspense>
  )
}
