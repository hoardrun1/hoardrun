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

      {/* Animated geometric background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute top-0 left-0 w-96 h-96 border border-white/30 rounded-full -translate-x-48 -translate-y-48 transition-all duration-[3000ms] ease-out"
          style={{
            transform: mounted 
              ? 'translateX(-12rem) translateY(-12rem) rotate(45deg)' 
              : 'translateX(-16rem) translateY(-16rem) rotate(0deg)'
          }}
        ></div>
        <div 
          className="absolute bottom-0 right-0 w-96 h-96 border border-white/30 rounded-full translate-x-48 translate-y-48 transition-all duration-[3500ms] ease-out"
          style={{
            transform: mounted 
              ? 'translateX(12rem) translateY(12rem) rotate(-45deg)' 
              : 'translateX(16rem) translateY(16rem) rotate(0deg)'
          }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 w-64 h-64 border border-white/20 rounded-full -translate-x-32 -translate-y-32 transition-all duration-[4000ms] ease-out"
          style={{
            transform: mounted 
              ? 'translateX(-8rem) translateY(-8rem) rotate(90deg) scale(1)' 
              : 'translateX(-8rem) translateY(-8rem) rotate(0deg) scale(0.8)'
          }}
        ></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-bounce"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 4) * 20}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full">
          
          {/* Main content - Full width layout */}
          <div className="max-w-7xl mx-auto">
            
            {/* Header section - Centered */}
            <div 
              className="text-center mb-12 transition-all duration-1000 ease-out"
              style={{
                transform: mounted ? 'translateY(0)' : 'translateY(-30px)',
                opacity: mounted ? 1 : 0
              }}
            >
              <div 
                className="mx-auto w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 shadow-2xl transition-all duration-700 ease-out hover:scale-110 border border-white/20"
                style={{
                  transform: mounted ? 'scale(1) rotate(0deg)' : 'scale(0.8) rotate(-180deg)',
                  transitionDelay: '300ms'
                }}
              >
                <Mail 
                  className="h-10 w-10 text-white transition-all duration-500"
                  style={{
                    transform: mounted ? 'scale(1)' : 'scale(0.5)'
                  }}
                />
              </div>
              
              <h1 
                className="text-2xl lg:text-3xl font-bold text-white mb-4 transition-all duration-700 ease-out"
                style={{
                  transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                  opacity: mounted ? 1 : 0,
                  transitionDelay: '400ms'
                }}
              >
                Check your email
              </h1>
              <p 
                className="text-white text-base mb-2 leading-relaxed transition-all duration-700 ease-out max-w-2xl mx-auto"
                style={{
                  transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                  opacity: mounted ? 1 : 0,
                  transitionDelay: '500ms'
                }}
              >
                We've sent a verification link to
              </p>
              <p 
                className="text-white font-semibold text-lg transition-all duration-700 ease-out"
                style={{
                  transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                  opacity: mounted ? 1 : 0,
                  transitionDelay: '600ms'
                }}
              >
                {email}
              </p>
            </div>

            {/* Three column layout for lg screens */}
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-start">
              
              {/* Left column - Instructions */}
              <div 
                className="lg:order-1 order-2 transition-all duration-1000 ease-out"
                style={{
                  transform: mounted ? 'translateX(0) translateY(0)' : 'translateX(-50px) translateY(20px)',
                  opacity: mounted ? 1 : 0,
                  transitionDelay: '700ms'
                }}
              >
                <div className="bg-white/30 backdrop-blur-sm rounded-2xl shadow-2xl p-6 lg:p-8 border border-white/30 transition-all duration-500 hover:shadow-3xl hover:bg-white/40">
                  <div className="flex items-start mb-4">
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

              {/* Center column - Main action */}
              <div 
                className="lg:order-2 order-1 transition-all duration-1000 ease-out"
                style={{
                  transform: mounted ? 'translateY(0)' : 'translateY(30px)',
                  opacity: mounted ? 1 : 0,
                  transitionDelay: '800ms'
                }}
              >
                <div className="bg-white/30 backdrop-blur-sm rounded-2xl shadow-2xl p-8 lg:p-10 border border-white/30 transition-all duration-500 hover:shadow-3xl hover:bg-white/40 text-center">
                  <h2 className="text-xl font-bold text-white mb-6">Ready to continue?</h2>
                  <p className="text-white mb-8 text-sm leading-relaxed">
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
                        Resending...
                      </>
                    ) : (
                      "Resend verification email"
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

              {/* Right column - Help */}
              <div 
                className="lg:order-3 order-3 transition-all duration-1000 ease-out"
                style={{
                  transform: mounted ? 'translateX(0) translateY(0)' : 'translateX(50px) translateY(20px)',
                  opacity: mounted ? 1 : 0,
                  transitionDelay: '900ms'
                }}
              >
                <div className="bg-white/30 backdrop-blur-sm rounded-2xl shadow-2xl p-6 lg:p-8 border border-white/30 transition-all duration-500 hover:shadow-3xl hover:bg-white/40">
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

            {/* Development mode section - Full width */}
            {process.env.NODE_ENV === 'development' && (
              <div 
                className="mt-12 max-w-4xl mx-auto transition-all duration-1000 ease-out"
                style={{
                  transform: mounted ? 'translateY(0)' : 'translateY(30px)',
                  opacity: mounted ? 1 : 0,
                  transitionDelay: '1000ms'
                }}
              >
                <div className="bg-white/30 text-white p-8 rounded-2xl border-2 border-white/30 transition-all duration-500 hover:shadow-2xl hover:bg-white/40 text-center">
                  <h3 className="font-bold mb-4 text-lg">Development Mode</h3>
                  <p className="text-white mb-6 text-sm leading-relaxed max-w-2xl mx-auto">
                    If the real email fails to send, you can view the backup development email using the link below.
                  </p>
                  <Link
                    href={`/dev/emails?email=${encodeURIComponent(email)}`}
                    className="inline-block bg-white text-black hover:bg-gray-100 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 shadow-lg"
                    target="_blank"
                  >
                    View Development Emails →
                  </Link>
                  <p className="text-white text-xs mt-4">
                    This section only appears in development mode.
                  </p>
                </div>
              </div>
            )}

            {/* Bottom feature highlights - Full width */}
            <div 
              className="mt-16 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto transition-all duration-1000 ease-out"
              style={{
                transform: mounted ? 'translateY(0)' : 'translateY(30px)',
                opacity: mounted ? 1 : 0,
                transitionDelay: '1100ms'
              }}
            >
              {[
                { title: "Secure Verification", desc: "Advanced email verification keeps your account safe", delay: '0ms' },
                { title: "Instant Access", desc: "Verify once and enjoy seamless access to all features", delay: '100ms' },
                { title: "Privacy First", desc: "Your email is protected and never shared", delay: '200ms' }
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
                  <div className="w-3 h-3 bg-white rounded-full mx-auto mb-4 animate-pulse"></div>
                  <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                  <p className="text-white text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}