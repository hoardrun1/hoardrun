'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeOffIcon, MailIcon, UserIcon, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PasswordStrengthMeter } from "@/components/ui/password-strength-meter"
import { AnimatedGradientBackground } from "@/components/ui/animated-gradient-background"
import { FrostedGlassCard } from "@/components/ui/frosted-glass-card"
import { useToast } from "@/components/ui/use-toast"
import { EmailVerificationService } from '@/services/email-verification'
import { PasswordValidationService } from '@/services/password-validation'
import { useAuth } from '@/contexts/AuthContext'

export default function SignUpPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { signup } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)

  // Email availability check with debounce
  useEffect(() => {
    const checkEmail = async () => {
      if (!formData.email || !EmailVerificationService.validateEmailFormat(formData.email)) {
        setIsEmailAvailable(null)
        return
      }

      setIsCheckingEmail(true)
      try {
        const isAvailable = await EmailVerificationService.checkEmailAvailability(formData.email)
        setIsEmailAvailable(isAvailable)
      } catch (error) {
        console.error('Email check error:', error)
        setIsEmailAvailable(null)
      } finally {
        setIsCheckingEmail(false)
      }
    }

    const timeoutId = setTimeout(checkEmail, 500)
    return () => clearTimeout(timeoutId)
  }, [formData.email])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Name is required')
      return false
    }

    if (!EmailVerificationService.validateEmailFormat(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }

    if (!isEmailAvailable) {
      setError('Email is already in use')
      return false
    }

    const passwordValidation = PasswordValidationService.validatePassword(formData.password)
    if (!passwordValidation.isValid) {
      setError(`Password requirements: ${passwordValidation.failedRequirements.join(', ')}`)
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    if (!validateForm()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create account')
      }

      await signup(data.token, data.user)
      
      toast({
        title: "Account Created",
        description: "Please check your email to verify your account.",
        duration: 5000
      })

      router.push('/verify-email')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Signup error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatedGradientBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <FrostedGlassCard className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Create Account</h1>
            <p className="text-gray-500 dark:text-gray-400">Join us today</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  className="pl-10"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className={`pl-10 ${
                    isEmailAvailable === true ? 'border-green-500' : 
                    isEmailAvailable === false ? 'border-red-500' : ''
                  }`}
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {isCheckingEmail && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-500" />
                )}
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="pr-10"
                  value={formData.password}
                  onChange={handleChange}
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
              <PasswordStrengthMeter password={formData.password} />
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || isCheckingEmail}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link href="/signin" className="text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </div>
        </FrostedGlassCard>
      </div>
    </AnimatedGradientBackground>
  )
}
