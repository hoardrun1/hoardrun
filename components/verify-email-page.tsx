'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from "@/components/ui/use-toast"
import { EmailVerificationService } from "@/services/email-verification"

export function VerifyEmailPageComponent() {
  const [isLoading, setIsLoading] = useState(false)
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()
  const [email, setEmail] = useState<string>('')

  useEffect(() => {
    // Get email from session storage
    const storedEmail = sessionStorage.getItem('verificationEmail')
    if (storedEmail) {
      setEmail(storedEmail)
    } else {
      // Redirect to signup if no email found
      router.push('/auth')
    }
  }, [router])

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleInput = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0]
    }

    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    const newCode = [...verificationCode]
    
    for (let i = 0; i < pastedData.length; i++) {
      if (/[0-9]/.test(pastedData[i])) {
        newCode[i] = pastedData[i]
      }
    }
    
    setVerificationCode(newCode)
    
    // Focus the next empty input or the last input
    const nextEmptyIndex = newCode.findIndex(digit => !digit)
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus()
    } else {
      inputRefs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.some(digit => !digit)) {
      toast({
        title: "Error",
        description: "Please enter all digits of the verification code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const codeToSubmit = verificationCode.join('');
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          verificationCode: codeToSubmit,
          email // Include email for verification
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      toast({
        title: "Success",
        description: "Email verified successfully!",
      });

      // Clear verification email from session after successful verification
      sessionStorage.removeItem('verificationEmail');
      router.push('/create-profile');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Verification failed',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || isLoading) return

    setIsLoading(true)
    try {
      await EmailVerificationService.sendVerificationEmail(email)
      toast({
        title: "Verification Code Sent",
        description: "Please check your email for the new code.",
        duration: 5000
      })
    } catch (error) {
      console.error('Error sending verification email:', error)
      toast({
        title: "Error",
        description: "Failed to send verification code. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
      // Reset verification code
      setVerificationCode(['', '', '', '', '', ''])
      // Focus first input
      inputRefs.current[0]?.focus()
    }
  }

  return (
    <div className="container flex min-h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Email Verification</h1>
          <p className="text-sm text-muted-foreground">
            Please enter the 6-digit verification code sent to{' '}
            <span className="font-medium">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="flex justify-between gap-2">
              {verificationCode.map((digit, index) => (
                <Input
                  key={index}
                  ref={el => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  className="w-12 h-12 text-center text-lg"
                  value={digit}
                  onChange={(e) => handleInput(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={isLoading}
                  required
                />
              ))}
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || verificationCode.some(digit => !digit)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive any mail?{" "}
            <button
              onClick={handleResend}
              className="text-blue-600 hover:text-blue-700 font-medium"
              disabled={isLoading}
            >
              Resend
            </button>
          </p>
          <p className="text-sm text-muted-foreground">
            If you are ready to create a profile, you can go to the 
            <a href="/create-profile" className="text-blue-600 hover:text-blue-700 font-medium"> Create Profile Page</a>.
          </p>
        </div>
      </div>
    </div>
  )
}