'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AnimatedGradientBackground } from "@/components/ui/animated-gradient-background"
import { FrostedGlassCard } from "@/components/ui/frosted-glass-card"
import { Loader2, ArrowLeft, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTheme } from 'next-themes'

export default function VerifySigninPage() {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resendDisabled, setResendDisabled] = useState(true)
  const [countdown, setCountdown] = useState(30)
  const [verificationProgress, setVerificationProgress] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()
  const { theme } = useTheme()

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }

    // Start countdown for resend button
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setResendDisabled(false)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Update verification progress based on filled inputs
  useEffect(() => {
    const filledInputs = verificationCode.filter(code => code !== '').length
    setVerificationProgress((filledInputs / 6) * 100)
  }, [verificationCode])

  const handleInput = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.slice(0, 6).split('')
      const newCode = [...verificationCode]
      digits.forEach((digit, i) => {
        if (i + index < 6) {
          newCode[i + index] = digit
        }
      })
      setVerificationCode(newCode)
      
      // Focus last input or next empty input
      const nextEmptyIndex = newCode.findIndex((digit) => !digit)
      if (nextEmptyIndex === -1) {
        inputRefs.current[5]?.focus()
      } else {
        inputRefs.current[nextEmptyIndex]?.focus()
      }
    } else {
      // Handle single digit input
      const newCode = [...verificationCode]
      newCode[index] = value
      setVerificationCode(newCode)

      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      // Move to previous input on backspace if current input is empty
      const newCode = [...verificationCode]
      newCode[index - 1] = ''
      setVerificationCode(newCode)
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const digits = pastedData.split('')
    const newCode = [...verificationCode]
    digits.forEach((digit, i) => {
      if (i < 6) newCode[i] = digit
    })
    setVerificationCode(newCode)
    
    // Focus last input or next empty input
    const nextEmptyIndex = newCode.findIndex((digit) => !digit)
    if (nextEmptyIndex === -1) {
      inputRefs.current[5]?.focus()
    } else {
      inputRefs.current[nextEmptyIndex]?.focus()
    }
  }

  const handleResendCode = async () => {
    try {
      setResendDisabled(true)
      setCountdown(30)
      
      // Call your API to resend verification code
      await fetch('/api/resend-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      // Start countdown again
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setResendDisabled(false)
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      setError('Failed to resend verification code')
      setResendDisabled(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const code = verificationCode.join('')
      if (code.length !== 6) {
        throw new Error('Please enter a valid 6-digit verification code')
      }

      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verificationCode: code }),
      })

      if (!response.ok) {
        throw new Error('Invalid verification code')
      }

      // Success animation
      await new Promise(resolve => setTimeout(resolve, 500))
      router.push('/home')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
      setVerificationCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatedGradientBackground>
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <FrostedGlassCard className="w-full max-w-md p-6 sm:p-8">
          <motion.div 
            className="text-center space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/">
              <motion.h1 
                className={`text-sm sm:text-base md:text-lg font-bold ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Hoardrun
              </motion.h1>
            </Link>
            <h2 className={`text-base sm:text-lg md:text-xl font-extrabold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Verify Sign In
            </h2>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Please enter the verification code sent to your email
            </p>
          </motion.div>

          {/* Progress bar */}
          <motion.div 
            className="mt-6 h-1 bg-gray-200 rounded-full overflow-hidden"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div 
              className="h-full bg-gray-600"
              initial={{ width: '0%' }}
              animate={{ width: `${verificationProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-6"
              >
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form 
            onSubmit={handleSubmit} 
            className="mt-8 space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex justify-between gap-2">
              {verificationCode.map((digit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Input
                    ref={el => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    className={`w-12 h-12 text-center text-lg font-semibold ${
                      theme === 'dark' 
                        ? 'bg-gray-800 border-gray-700' 
                        : 'bg-white border-gray-200'
                    }`}
                    value={digit}
                    onChange={(e) => handleInput(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={isLoading}
                    required
                  />
                </motion.div>
              ))}
            </div>

            <Button
              type="submit"
              className="w-full bg-gray-600 hover:bg-gray-700"
              disabled={isLoading || verificationCode.some(digit => !digit)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify and Continue"
              )}
            </Button>

            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="ghost"
                className="text-sm"
                onClick={() => router.push('/signin')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="text-sm"
                onClick={handleResendCode}
                disabled={resendDisabled}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${resendDisabled ? 'animate-spin' : ''}`} />
                Resend Code
                {resendDisabled && countdown > 0 && ` (${countdown}s)`}
              </Button>
            </div>
          </motion.form>
        </FrostedGlassCard>
      </div>
    </AnimatedGradientBackground>
  )
}