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

  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Check your email</h1>
          <p className="text-gray-600 mb-6">
            We've sent a verification link to <span className="font-medium">{email}</span>
          </p>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg text-sm">
              <p className="flex items-start">
                <CheckCircle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>Click the link in the email to verify your account</span>
              </p>
            </div>

            {/* Email instructions */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm">
              <h3 className="font-semibold text-blue-800 mb-2">Check Your Email</h3>
              <p className="text-blue-700 mb-2">
                We've sent a verification email to your inbox. Please check your email and follow the instructions to verify your account.
              </p>
              <p className="text-blue-700 mb-2">
                If you don't see the email in your inbox, please check your spam or junk folder.
              </p>
            </div>

            {/* Development mode instructions */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-sm mt-4">
                <h3 className="font-semibold text-amber-800 mb-2">Development Mode</h3>
                <p className="text-amber-700 mb-2">
                  If the real email fails to send, you can view the backup development email at:
                </p>
                <Link
                  href={`/dev/emails?email=${encodeURIComponent(email)}`}
                  className="text-blue-600 hover:underline block mb-2"
                  target="_blank"
                >
                  View Development Emails
                </Link>
                <p className="text-amber-700 text-xs">
                  This message only appears in development mode.
                </p>
              </div>
            )}

            <Button
              onClick={handleResendEmail}
              variant="outline"
              className="w-full"
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

            <div className="text-center text-sm text-gray-500">
              <p>
                Already verified? <Link href="/signin" className="text-blue-600 hover:underline">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}