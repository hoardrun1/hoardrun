'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'

export function CheckEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const { sendEmailVerification, verifyEmail, user } = useFirebaseAuth();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');

  useEffect(() => {
    // Check if this is a Firebase email verification callback
    const actionCode = searchParams.get('oobCode');
    const mode = searchParams.get('mode');

    if (mode === 'verifyEmail' && actionCode) {
      handleEmailVerification(actionCode);
      return;
    }

    // Get email from URL params or user
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else if (user?.email) {
      setEmail(user.email);
    } else {
      // No email found, redirect to signup
      router.push('/signup');
    }
  }, [router, searchParams, user]);

  const handleEmailVerification = async (actionCode: string) => {
    setVerificationStatus('pending');
    try {
      await verifyEmail(actionCode);
      setVerificationStatus('success');

      addToast({
        title: "Email Verified",
        description: "Your email has been successfully verified!",
      });

      // Redirect to signin page after a delay
      setTimeout(() => {
        router.push('/signin?verified=true');
      }, 2000);

    } catch (err) {
      setVerificationStatus('error');
      addToast({
        title: "Verification Failed",
        description: err instanceof Error ? err.message : 'Email verification failed',
        variant: "destructive",
      });
    }
  };

  const handleResendEmail = async () => {
    if (!user?.uid) {
      addToast({
        title: "Error",
        description: "No user found. Please sign up again.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await sendEmailVerification(user.uid);
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
                  Check your email
                </h1>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                  We've sent a verification link to{' '}
                  <span className="font-semibold text-black">{email}</span>
                </p>

                {/* Content sections */}
                <div className="space-y-6">
                  {/* Primary instruction */}
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-black mr-3 flex-shrink-0 mt-1" />
                      <div className="text-left">
                        <h3 className="font-semibold text-black mb-2">Verify Your Account</h3>
                        <p className="text-gray-700">
                          Click the verification link in your email to activate your account and get started.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Email instructions */}
                  <div className="bg-gray-50 border-2 border-gray-200 p-6 rounded-xl">
                    <h3 className="font-bold text-black mb-3 text-left">Can't find the email?</h3>
                    <div className="text-left space-y-2 text-gray-700">
                      <p>• Check your spam or junk folder</p>
                      <p>• Make sure you entered the correct email address</p>
                      <p>• Wait a few minutes for the email to arrive</p>
                    </div>
                  </div>

                  {/* Development mode instructions */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="bg-black text-white p-6 rounded-xl border-2 border-gray-800">
                      <h3 className="font-bold mb-3 text-left">Development Mode</h3>
                      <p className="text-gray-300 mb-3 text-left">
                        If the real email fails to send, you can view the backup development email:
                      </p>
                      <Link
                        href={`/dev/emails?email=${encodeURIComponent(email)}`}
                        className="text-white hover:text-gray-300 underline block mb-2 text-left"
                        target="_blank"
                      >
                        View Development Emails →
                      </Link>
                      <p className="text-gray-400 text-sm text-left">
                        This message only appears in development mode.
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-4 pt-4">
                    <Button
                      onClick={handleResendEmail}
                      className="w-full bg-black hover:bg-gray-800 text-white py-3 text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Resending...
                        </>
                      ) : (
                        "Resend verification email"
                      )}
                    </Button>

                    <div className="text-center text-gray-500 pt-2">
                      <p>
                        Already verified?{' '}
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