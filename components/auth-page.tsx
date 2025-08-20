"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  EyeIcon, 
  EyeOffIcon, 
  MailIcon, 
  UserIcon, 
  Loader2,
  ArrowLeft,
  Globe, // Using Globe instead of LucideGoogle which doesn't exist
  Facebook,
  Apple,
  ChevronRight,
  Lock
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PasswordStrengthMeter } from "@/components/ui/password-strength-meter"
import { AnimatedGradientBackground } from "@/components/ui/animated-gradient-background"
import { FrostedGlassCard } from "@/components/ui/frosted-glass-card"
import { useToast } from "@/components/ui/use-toast"
import { EmailVerificationService } from '@/services/email-verification'
import { PasswordValidationService } from '@/services/password-validation'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
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

  const router = useRouter()
  const { toast } = useToast()
  const { signUpWithFirebase, signInWithFirebase } = useAuth()

  useEffect(() => {
    const validateEmail = async () => {
      if (!formData.email || !EmailVerificationService.validateEmailFormat(formData.email)) {
        setIsEmailAvailable(null);
        return;
      }

      setIsCheckingEmail(true);
      try {
        const isAvailable = await EmailVerificationService.checkEmailAvailability(formData.email);
        setIsEmailAvailable(isAvailable);
      } catch (error) {
        console.error('Email check error:', error);
        setIsEmailAvailable(null);
        toast({
          title: "Error",
          description: "Failed to check email availability",
          variant: "destructive"
        });
      } finally {
        setIsCheckingEmail(false);
      }
    };

    const debounceTimeout = setTimeout(validateEmail, 500);
    return () => clearTimeout(debounceTimeout);
  }, [formData.email]);

  const handleSocialAuth = async (provider: 'google' | 'facebook' | 'apple') => {
    setIsLoading(true)
    try {
      if (provider === 'google') {
        // Use Render backend only for Google OAuth
        const response = await fetch(`${process.env.NEXT_PUBLIC_GOOGLE_AUTH_BACKEND_URL}/api/v1/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.message)

        // Handle successful auth
        router.push('/dashboard')
      } else {
        // Use Firebase for Facebook and Apple (not implemented yet)
        throw new Error(`${provider} authentication not implemented yet. Please use Google or email/password.`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    try {
      setIsLoading(true)
      setError(null)

      if (!validateForm()) return

      // Create account
      const response = await fetch('/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          deviceInfo: {
            userAgent: window.navigator.userAgent,
            deviceId: Math.random().toString(36).substring(2, 15), // Simple device ID
            ip: '', // Will be set by server
            components: {} // Add device fingerprinting if needed
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account')
      }

      // Store verification data
      sessionStorage.setItem('verificationEmail', formData.email)
      sessionStorage.setItem('userId', data.userId)
      sessionStorage.setItem('tempToken', data.token)

      toast({
        title: "Account Created",
        description: "Please check your email for the verification code.",
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      await signInWithFirebase(formData.email.toLowerCase().trim(), formData.password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedGradientBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <FrostedGlassCard className="w-full max-w-md p-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
                Welcome to Hoardrun
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Your financial journey starts here
              </p>
            </div>

            <Tabs 
              defaultValue={activeTab} 
              onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')}
              className="space-y-6"
            >
              <TabsList className="grid grid-cols-2 w-full p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <TabsTrigger 
                  value="signin"
                  className="rounded-md py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm transition-all"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="rounded-md py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm transition-all"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                <TabsContent value="signin" className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <div className="space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signin-email" className="text-sm font-medium">
                            Email
                          </Label>
                          <div className="relative">
                            <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                            <Input
                              id="signin-email"
                              type="email"
                              placeholder="you@example.com"
                              className="pl-10 h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signin-password" className="text-sm font-medium">
                            Password
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                            <Input
                              id="signin-password"
                              type={showPassword ? "text" : "password"}
                              className="pl-10 pr-10 h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                            >
                              {showPassword ? (
                                <EyeOffIcon className="h-4 w-4" />
                              ) : (
                                <EyeIcon className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                          <span className="text-gray-600 dark:text-gray-400">Remember me</span>
                        </label>
                        <a href="/forgot-password" className="text-blue-600 hover:text-blue-500 transition-colors">
                          Forgot password?
                        </a>
                      </div>

                      <Button 
                        className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                        disabled={isLoading}
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
                    </div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="signup" className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="John Doe"
                            className="pl-10 h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all"
                            disabled={isLoading}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                        <div className="relative">
                          <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="you@example.com"
                            className={`pl-10 h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all ${
                              isEmailAvailable === true ? 'border-green-500' : 
                              isEmailAvailable === false ? 'border-red-500' : ''
                            }`}
                            disabled={isLoading}
                            required
                          />
                          {isCheckingEmail && (
                            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-500" />
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="pl-10 pr-10 h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all"
                            disabled={isLoading}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                          >
                            {showPassword ? (
                              <EyeOffIcon className="h-4 w-4" />
                            ) : (
                              <EyeIcon className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <PasswordStrengthMeter password={formData.password} />
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
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
                  </motion.div>
                </TabsContent>
              </AnimatePresence>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleSocialAuth('google')}
                  className="h-11 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all"
                >
                  <Globe className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSocialAuth('facebook')}
                  className="h-11 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all"
                >
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSocialAuth('apple')}
                  className="h-11 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all"
                >
                  <Apple className="h-5 w-5" />
                </Button>
              </div>

              <div className="mt-6 text-center text-sm text-gray-500">
                By continuing, you agree to our{' '}
                <a href="/terms" className="text-blue-600 hover:text-blue-500 transition-colors">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-500 transition-colors">
                  Privacy Policy
                </a>
              </div>
            </Tabs>
          </motion.div>
        </FrostedGlassCard>
      </div>
    </AnimatedGradientBackground>
  )
}

