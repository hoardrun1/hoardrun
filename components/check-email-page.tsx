'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { navigation } from '@/lib/navigation'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export function CheckEmailPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (!navigation.isValidTransition('signup', 'check-email')) {
      router.push('/signup');
      return;
    }

    const data = navigation.getData('check-email');
    if (!data?.email) {
      router.push('/signup');
      return;
    }

    setEmail(data.email);
  }, [router]);

  const handleResendEmail = async () => {
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      addToast({
        title: "Success",
        description: "Verification email has been resent"
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resend verification email",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationComplete = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      navigation.connect('check-email', 'verify-email');
      router.push('/verify-email');
    } catch (error) {
      addToast({
        title: "Error",
        description: "Verification failed",
        variant: "destructive"
      });
    }
  };

  if (!mounted) return null;

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
      
      {/* Faded dark overlay */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* Animated geometric background pattern - Adjusted for mobile */}
      <div className="absolute inset-0 opacity-5 sm:opacity-10">
        <div 
          className="absolute top-0 left-0 w-48 sm:w-96 h-48 sm:h-96 border border-white/30 rounded-full -translate-x-24 sm:-translate-x-48 -translate-y-24 sm:-translate-y-48 transition-all duration-[3000ms] ease-out"
          style={{
            transform: mounted 
              ? 'translateX(-6rem) translateY(-6rem) rotate(45deg) sm:translateX(-12rem) sm:translateY(-12rem)' 
              : 'translateX(-8rem) translateY(-8rem) rotate(0deg) sm:translateX(-16rem) sm:translateY(-16rem)'
          }}
        ></div>
        <div 
          className="absolute bottom-0 right-0 w-48 sm:w-96 h-48 sm:h-96 border border-white/30 rounded-full translate-x-24 sm:translate-x-48 translate-y-24 sm:translate-y-48 transition-all duration-[3500ms] ease-out"
          style={{
            transform: mounted 
              ? 'translateX(6rem) translateY(6rem) rotate(-45deg) sm:translateX(12rem) sm:translateY(12rem)' 
              : 'translateX(8rem) translateY(8rem) rotate(0deg) sm:translateX(16rem) sm:translateY(16rem)'
          }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 w-32 sm:w-64 h-32 sm:h-64 border border-white/20 rounded-full -translate-x-16 sm:-translate-x-32 -translate-y-16 sm:-translate-y-32 transition-all duration-[4000ms] ease-out"
          style={{
            transform: mounted 
              ? 'translateX(-4rem) translateY(-4rem) rotate(90deg) scale(1) sm:translateX(-8rem) sm:translateY(-8rem)' 
              : 'translateX(-4rem) translateY(-4rem) rotate(0deg) scale(0.8) sm:translateX(-8rem) sm:translateY(-8rem)'
          }}
        ></div>
      </div>

      {/* Floating particles - Reduced for mobile */}
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
          
          {/* Main content - Full width layout */}
          <div className="max-w-7xl mx-auto">
            
            {/* Header section - Centered with better mobile spacing */}
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

            {/* Mobile-first layout - Side sections on mobile, main action full width */}
            <div className="space-y-4 sm:space-y-6">
              
              {/* Side sections - Side by side on mobile */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:hidden">
                
                {/* Instructions card */}
                <div 
                  className="transition-all duration-1000 ease-out"
                  style={{
                    transform: mounted ? 'translateX(0) translateY(0)' : 'translateX(-30px) translateY(20px)',
                    opacity: mounted ? 1 : 0,
                    transitionDelay: '700ms'
                  }}
                >
                  <div className="bg-white/25 backdrop-blur-sm rounded-lg shadow-2xl p-3 sm:p-4 border border-white/30 transition-all duration-500 hover:shadow-3xl hover:bg-white/35 h-full">
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-white mr-2 flex-shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <h3 className="font-bold text-white mb-1.5 text-xs">Verify Your Account</h3>
                        <p className="text-white text-xs leading-relaxed">
                          Click the verification link in your email to activate your account.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Help card */}
                <div 
                  className="transition-all duration-1000 ease-out"
                  style={{
                    transform: mounted ? 'translateX(0) translateY(0)' : 'translateX(30px) translateY(20px)',
                    opacity: mounted ? 1 : 0,
                    transitionDelay: '900ms'
                  }}
                >
                  <div className="bg-white/25 backdrop-blur-sm rounded-lg shadow-2xl p-3 sm:p-4 border border-white/30 transition-all duration-500 hover:shadow-3xl hover:bg-white/35 h-full">
                    <h3 className="font-bold text-white mb-2 text-xs">Can't find the email?</h3>
                    <div className="space-y-1.5 text-white text-xs">
                      <div className="flex items-start">
                        <div className="w-1 h-1 bg-white rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                        <p>Check spam folder</p>
                      </div>
                      <div className="flex items-start">
                        <div className="w-1 h-1 bg-white rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                        <p>Verify email address</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main action card - Full width on mobile */}
              <div 
                className="lg:hidden transition-all duration-1000 ease-out"
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

              {/* Desktop layout - Three columns side by side */}
              <div className="hidden lg:grid lg:grid-cols-3 gap-6 lg:gap-12">
                
                {/* Instructions card */}
                <div 
                  className="transition-all duration-1000 ease-out"
                  style={{
                    transform: mounted ? 'translateX(0) translateY(0)' : 'translateX(-50px) translateY(20px)',
                    opacity: mounted ? 1 : 0,
                    transitionDelay: '700ms'
                  }}
                >
                  <div className="bg-white/30 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/30 transition-all duration-500 hover:shadow-3xl hover:bg-white/40">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-white mr-3 flex-shrink-0 mt-1 animate-pulse" />
                      <div>
                        <h3 className="font-bold text-white mb-2 text-base">Verify Your Account</h3>
                        <p className="text-white text-sm leading-relaxed">
                          Click the verification link in your email to activate your account and get started.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main action card */}
                <div 
                  className="transition-all duration-1000 ease-out"
                  style={{
                    transform: mounted ? 'translateY(0)' : 'translateY(30px)',
                    opacity: mounted ? 1 : 0,
                    transitionDelay: '800ms'
                  }}
                >
                  <div className="bg-white/30 backdrop-blur-sm rounded-2xl shadow-2xl p-10 border border-white/30 transition-all duration-500 hover:shadow-3xl hover:bg-white/40 text-center">
                    <h2 className="text-xl font-bold text-white mb-6">Ready to continue?</h2>
                    <p className="text-white mb-8 text-sm leading-relaxed px-2">
                      Click the button below if you need us to resend the verification email.
                    </p>
                    
                    <Button
                      onClick={handleResendEmail}
                      className="w-full bg-white hover:bg-gray-100 text-black py-3 text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 mb-6"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span className="text-sm">Resending...</span>
                        </>
                      ) : (
                        <span className="text-sm">Resend verification email</span>
                      )}
                    </Button>

                    <div className="text-center text-white text-sm">
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

                {/* Help card */}
                <div 
                  className="transition-all duration-1000 ease-out"
                  style={{
                    transform: mounted ? 'translateX(0) translateY(0)' : 'translateX(50px) translateY(20px)',
                    opacity: mounted ? 1 : 0,
                    transitionDelay: '900ms'
                  }}
                >
                  <div className="bg-white/30 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/30 transition-all duration-500 hover:shadow-3xl hover:bg-white/40">
                    <h3 className="font-bold text-white mb-4 text-base">Can't find the email?</h3>
                    <div className="space-y-3 text-white text-sm">
                      <div className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <p>Check your spam or junk folder</p>
                      </div>
                      <div className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <p>Make sure you entered the correct email address</p>
                      </div>
                      <div className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <p>Wait a few minutes for the email to arrive</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Development mode section - Better mobile layout */}
            {process.env.NODE_ENV === 'development' && (
              <div 
                className="mt-8 sm:mt-12 max-w-4xl mx-auto transition-all duration-1000 ease-out"
                style={{
                  transform: mounted ? 'translateY(0)' : 'translateY(30px)',
                  opacity: mounted ? 1 : 0,
                  transitionDelay: '1000ms'
                }}
              >
                <div className="bg-white/25 sm:bg-white/30 text-white p-6 sm:p-8 rounded-xl sm:rounded-2xl border-2 border-white/30 transition-all duration-500 hover:shadow-2xl hover:bg-white/35 sm:hover:bg-white/40 text-center">
                  <h3 className="font-bold mb-3 sm:mb-4 text-base sm:text-lg">Development Mode</h3>
                  <p className="text-white mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto px-2">
                    If the real email fails to send, you can view the backup development email using the link below.
                  </p>
                  <Link
                    href={`/dev/emails?email=${encodeURIComponent(email)}`}
                    className="inline-block bg-white text-black hover:bg-gray-100 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 hover:scale-105 shadow-lg"
                    target="_blank"
                  >
                    View Development Emails →
                  </Link>
                  <p className="text-white text-xs mt-3 sm:mt-4">
                    This section only appears in development mode.
                  </p>
                </div>
              </div>
            )}

            {/* Bottom feature highlights - Side by side on mobile, 3 columns on larger screens */}
            <div 
              className="mt-12 sm:mt-16 max-w-5xl mx-auto transition-all duration-1000 ease-out"
              style={{
                transform: mounted ? 'translateY(0)' : 'translateY(30px)',
                opacity: mounted ? 1 : 0,
                transitionDelay: '1100ms'
              }}
            >
              {/* Mobile layout - First two side by side, third full width */}
              <div className="sm:hidden space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { title: "Secure Verification", desc: "Advanced email verification keeps your account safe" },
                    { title: "Instant Access", desc: "Verify once and enjoy seamless access to all features" }
                  ].map((feature, i) => (
                    <div 
                      key={i}
                      className="text-center text-white transition-all duration-700 ease-out hover:scale-105"
                      style={{
                        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                        opacity: mounted ? 1 : 0,
                        transitionDelay: `${1200 + i * 100}ms`
                      }}
                    >
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mb-2 animate-pulse"></div>
                      <h3 className="text-xs font-semibold mb-1.5">{feature.title}</h3>
                      <p className="text-white text-xs leading-relaxed">{feature.desc}</p>
                    </div>
                  ))}
                </div>
                
                {/* Third feature full width on mobile */}
                <div 
                  className="text-center text-white transition-all duration-700 ease-out hover:scale-105"
                  style={{
                    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                    opacity: mounted ? 1 : 0,
                    transitionDelay: '1400ms'
                  }}
                >
                  <div className="w-2 h-2 bg-white rounded-full mx-auto mb-2 animate-pulse"></div>
                  <h3 className="text-xs font-semibold mb-1.5">Privacy First</h3>
                  <p className="text-white text-xs leading-relaxed">Your email is protected and never shared</p>
                </div>
              </div>

              {/* Tablet and desktop layout - All three side by side */}
              <div className="hidden sm:grid grid-cols-3 gap-6 sm:gap-8">
                {[
                  { title: "Secure Verification", desc: "Advanced email verification keeps your account safe" },
                  { title: "Instant Access", desc: "Verify once and enjoy seamless access to all features" },
                  { title: "Privacy First", desc: "Your email is protected and never shared" }
                ].map((feature, i) => (
                  <div 
                    key={i}
                    className="text-center text-white transition-all duration-700 ease-out hover:scale-105 px-2"
                    style={{
                      transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                      opacity: mounted ? 1 : 0,
                      transitionDelay: `${1200 + i * 100}ms`
                    }}
                  >
                    <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-white rounded-full mx-auto mb-3 sm:mb-4 animate-pulse"></div>
                    <h3 className="text-sm sm:text-base font-semibold mb-2">{feature.title}</h3>
                    <p className="text-white text-xs sm:text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}