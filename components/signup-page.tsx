"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { EyeIcon, EyeOffIcon, MailIcon, UserIcon, Loader2, ArrowRight, Smartphone } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useFirebaseAuth } from "@/hooks/useFirebaseAuth"
import { signInWithCustomToken } from 'firebase/auth'
import { auth } from '@/lib/firebase-config'
import { sendVerificationEmail, generateVerificationToken, generateVerificationLink } from '@/lib/web3forms-email'

// Google Identity Services types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: () => void
        }
      }
    }
  }
}

export function SignupPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const { signUpWithFirebase, loading: firebaseLoading } = useFirebaseAuth()
  const [error, setError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("social")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true)
    setError(null)

    try {
      // Use your deployed Render backend for Google OAuth
      const backendUrl = process.env.NEXT_PUBLIC_AUTH_BACKEND_URL || 'https://auth-backend-yqik.onrender.com'

      // Get Google OAuth configuration from your backend
      const configResponse = await fetch(`${backendUrl}/api/v1/auth/config`)
      const config = await configResponse.json()

      if (!config.success) {
        throw new Error('Failed to get OAuth configuration')
      }

      const clientId = config.data.clientId || config.data.googleClientId
      const redirectUri = config.data.redirectUri || `${window.location.origin}/auth/google/callback`
      const scope = 'email profile openid'

      const authUrl = `https://accounts.google.com/oauth/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${encodeURIComponent(JSON.stringify({ action: 'signup', origin: window.location.origin }))}`

      // Open popup window for OAuth
      const popup = window.open(
        authUrl,
        'google-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      )

      if (!popup) {
        throw new Error('Popup blocked by browser. Please allow popups for this site.')
      }

      // Listen for popup messages and completion
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return

        if (event.data.type === 'GOOGLE_AUTH_SUCCESS' && event.data.data) {
          try {
            const { user, accessToken, refreshToken, firebaseCustomToken } = event.data.data

            // Store tokens
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', refreshToken)

            // Sign in with Firebase using custom token if available
            if (firebaseCustomToken && auth) {
              await signInWithCustomToken(auth, firebaseCustomToken)
            }

            // Success - show message and redirect
            addToast({
              title: "Success",
              description: "Account created successfully with Google!",
            })
            router.push('/dashboard')
          } catch (error) {
            console.error('Error processing Google auth success:', error)
            setError('Authentication successful but failed to complete sign-up')
          }
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          setError(event.data.error || 'Google authentication failed')
        }

        setGoogleLoading(false)
        window.removeEventListener('message', handleMessage)
      }

      window.addEventListener('message', handleMessage)

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          setGoogleLoading(false)
          window.removeEventListener('message', handleMessage)
        }
      }, 1000)

    } catch (error) {
      console.error('Failed to initiate Google OAuth:', error)
      setError(error instanceof Error ? error.message : 'Failed to start Google sign-up. Please try again.')
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    try {
      console.log("Submitting Firebase signup form:", {
        name: formData.name,
        email: formData.email,
        password: "********", // Don't log actual password
      })

      // Use Firebase authentication
      await signUpWithFirebase(formData.email, formData.password, formData.name)

      // Generate verification token and link
      const verificationToken = generateVerificationToken(formData.email)
      const verificationLink = generateVerificationLink(formData.email, verificationToken)

      // Send verification email using Web3Forms
      console.log('Sending verification email via Web3Forms...')
      const emailResult = await sendVerificationEmail(formData.email, formData.name, verificationLink)

      if (emailResult.success) {
        // Show success message
        addToast({
          title: "Success",
          description: "Account created successfully! Please check your email for verification.",
        })

        // Redirect to a page telling user to check their email
        router.push(`/check-email?email=${encodeURIComponent(formData.email)}`)
      } else {
        // Account created but email failed
        addToast({
          title: "Account Created",
          description: "Account created but verification email failed to send. You can still sign in.",
        })
        router.push('/signin')
      }
    } catch (error) {
      let errorMessage = "Signup failed"

      if (error instanceof Error) {
        errorMessage = error.message

        // Handle specific error cases
        if (error.message.includes("User already exists") || error.message.includes("already exists")) {
          errorMessage = "An account with this email already exists. Please sign in instead."
          setError(errorMessage)

          // Show a toast with helpful message
          addToast({
            title: "Account Already Exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          })
          return // Exit early to avoid showing the generic error
        }
      }

      setError(errorMessage)
      addToast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  // Social login will be implemented later with Firebase OAuth providers

  return (
    <div className="min-h-screen relative flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8">
      <Image
        alt="Dark crumpled paper background"
        src="https://images.unsplash.com/photo-1618123069754-cd64c230a169?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        fill
        sizes="100vw"
        style={{
          objectFit: "cover",
        }}
        quality={100}
        priority // Load the background image with high priority
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl relative z-10" // Added relative z-10 to bring content to front
      >
        <div className="bg-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl border border-gray-100/50 w-full max-w-sm sm:max-w-md md:max-w-lg">
          {/* Updated Logo and Title */}
          <div className="text-center mb-4 sm:mb-6 md:mb-8 lg:mb-10">
            <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-extrabold text-white">Begin Your Financial Journey</h1>
            <p className="mt-2 text-white text-xs sm:text-sm md:text-base">
              Experience next-generation mobile banking with AI-powered security
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>
                {error}
                {error.includes("already exists") && (
                  <div className="mt-2">
                    <Link
                      href="/signin"
                      className="text-white underline hover:text-gray-200 font-medium"
                    >
                      Go to Sign In →
                    </Link>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-3 gap-4 bg-white/10 p-1 rounded-xl">
              <TabsTrigger
                value="social"
                className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Social
              </TabsTrigger>
              <TabsTrigger
                value="email"
                className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
              >
                <MailIcon className="w-4 h-4 mr-2" />
                Email
              </TabsTrigger>
              <TabsTrigger
                value="mobile"
                className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Mobile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="social">
              <div className="space-y-4">
                {/* Google Sign Up */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border-gray-300 flex items-center justify-center gap-3 transition-all duration-200"
                  onClick={handleGoogleSignUp}
                  disabled={googleLoading || firebaseLoading}
                >
                  {googleLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating account with Google...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </>
                  )}
                </Button>

                {/* Apple Sign Up */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 bg-black hover:bg-gray-900 text-white border-gray-600 flex items-center justify-center gap-3 transition-all duration-200"
                  onClick={() => {
                    // TODO: Implement Apple sign-up
                    console.log('Apple sign-up clicked');
                  }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Continue with Apple
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-800 text-gray-400">Or sign up with email</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-white hover:bg-white/10"
                  onClick={() => setActiveTab('email')}
                >
                  <MailIcon className="w-4 h-4 mr-2" />
                  Use Email Instead
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="email">
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-white">
                Full Name
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-8 sm:pl-10 h-8 sm:h-9 md:h-10 bg-white border-gray-300 text-black focus:border-black text-xs sm:text-sm"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={firebaseLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-white">
                Email Address
              </Label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-8 sm:pl-10 h-8 sm:h-9 md:h-10 bg-white border-gray-300 text-black focus:border-black text-xs sm:text-sm"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={firebaseLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-white">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pr-8 sm:pr-10 h-8 sm:h-9 md:h-10 bg-white border-gray-300 text-black focus:border-black text-xs sm:text-sm"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={firebaseLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-white">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pr-8 sm:pr-10 h-8 sm:h-9 md:h-10 bg-white border-gray-300 text-black focus:border-black text-xs sm:text-sm"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={firebaseLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-8 sm:h-9 md:h-10 bg-black hover:bg-gray-800 text-white font-semibold text-xs sm:text-sm"
              disabled={firebaseLoading}
            >
              {firebaseLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>

            <p className="text-xs text-white text-center mt-4">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="text-white hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-white hover:underline">
                Privacy Policy
              </Link>
            </p>
          </form>
        </TabsContent>

        <TabsContent value="mobile">
          <div className="space-y-4">
            <Input
              type="tel"
              placeholder="Phone number"
              className="pl-8 sm:pl-10 h-8 sm:h-9 md:h-10 bg-white border-gray-300 text-black focus:border-black text-xs sm:text-sm"
            />
            <Button
              type="button"
              className="w-full h-8 sm:h-9 md:h-10 bg-black hover:bg-gray-800 text-white font-semibold text-xs sm:text-sm"
              disabled={firebaseLoading}
            >
              Send Code
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8 text-center">
        <p className="text-white">
          Already have an account?{" "}
          <Link href="/signin" className="text-white hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SignupPage
