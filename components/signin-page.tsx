'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeOffIcon, MailIcon, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { AnimatedGradientBackground } from "@/components/ui/animated-gradient-background"
import { FrostedGlassCard } from "@/components/ui/frosted-glass-card"
import { EmailVerificationService } from '@/services/email-verification'
import { RateLimiter } from '@/lib/rate-limiter'
import { useAuth } from '@/contexts/AuthContext'

export default function SignInPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null)

  // Check online status
  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Check for lockout
  useEffect(() => {
    const lockedUntil = localStorage.getItem('lockoutUntil')
    if (lockedUntil) {
      const lockoutTime = new Date(lockedUntil)
      if (lockoutTime > new Date()) {
        setLockoutUntil(lockoutTime)
      } else {
        localStorage.removeItem('lockoutUntil')
        RateLimiter.resetLimit(email)
      }
    }
  }, [email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading || !isOnline || lockoutUntil) return

    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Please fill in all fields')
      }

      if (!EmailVerificationService.validateEmailFormat(email)) {
        throw new Error('Please enter a valid email address')
      }

      setIsLoading(true)
      setError(null)

      // Check rate limiting
      if (!RateLimiter.checkLimit(email)) {
        const lockoutTime = new Date(Date.now() + 15 * 60 * 1000)
        setLockoutUntil(lockoutTime)
        localStorage.setItem('lockoutUntil', lockoutTime.toISOString())
        throw new Error('Too many attempts. Please try again later.')
      }

      const response = await fetch('/api/sign-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(),
          password 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed')
      }

      // Clear lockout on successful login
      RateLimiter.resetLimit(email)
      localStorage.removeItem('lockoutUntil')

      await login(data.token, data.user)
      
      toast({
        title: "Success",
        description: "Signed in successfully!",
        duration: 3000
      })

      router.push('/verify-signin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Sign in error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatedGradientBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <FrostedGlassCard className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-gray-500 dark:text-gray-400">Sign in to your account</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !isOnline || !!lockoutUntil}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link href="/forgot-password" className="text-blue-600 hover:text-blue-500">
              Forgot your password?
            </Link>
          </div>

          <div className="mt-6 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </div>
        </FrostedGlassCard>
      </div>
    </AnimatedGradientBackground>
  )
}
