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
    if (verificationCode.length === 6) {
      window.location.href = '/home';
    } else {
      setError('Please enter a valid verification code');
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
                  required
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>

              <Link href="/home" className="block mt-6">
                <Button 
                  type="button"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Continue to Home
                </Button>
              </Link>

              <div className="mt-6 space-y-4 text-center">
                <a 
                  href="/signin" 
                  className="text-sm text-gray-600 hover:text-blue-500 block"
                >
                  Back to Sign In
                </a>
                <Link 
                  href="/" 
                  className="text-sm text-gray-600 hover:text-blue-500 block"
                >
                  Back to Landing Page
                </Link>
                <div>
                  <a href="/home" className="text-sm text-gray-600 hover:text-blue-500">
                    Go to Home Page
                  </a>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  );
}