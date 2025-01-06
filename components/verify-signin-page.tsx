'use client'

import { useState } from 'react';
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LayoutWrapper } from "@/components/ui/layout-wrapper"
import { responsiveStyles as rs } from '@/styles/responsive-utilities'

export default function VerifySigninPage() {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (verificationCode.length !== 6) {
        setError('Please enter a valid 6-digit verification code');
        return;
      }

      // Here you would typically verify the code with your backend
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verificationCode }),
      });

      if (!response.ok) {
        throw new Error('Invalid verification code');
      }

      // If verification successful, redirect to home
      window.location.href = '/home';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    }
  };

  return (
    <LayoutWrapper className="bg-gradient-to-br from-blue-50 to-white">
      <div className={`min-h-screen ${rs.flexCenter}`}>
        <Card className="w-full max-w-[95%] sm:max-w-[440px] md:max-w-[480px] lg:max-w-[520px]">
          <CardHeader className="text-center space-y-2">
            <Link href="/" className="inline-block mb-4 sm:mb-6">
              <span className="text-xl sm:text-2xl font-bold">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">Hoard</span>
                <span className="text-gray-900">run</span>
              </span>
            </Link>
            <CardTitle className={rs.heading2}>Verify Sign In</CardTitle>
            <CardDescription className={rs.bodyText}>
              Please enter the verification code sent to your email
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className={rs.formGroup}>
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium text-gray-700">
                  Verification Code
                </Label>
                <Input
                  type="text"
                  id="code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="mt-1"
                  maxLength={6}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>

              <Button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 mt-6"
              >
                Verify and Continue
              </Button>

              <div className="mt-6 text-center">
                <Link 
                  href="/signin" 
                  className="text-sm text-gray-600 hover:text-blue-500"
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  );
}