"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Eye, EyeOff, Smartphone, Mail, Lock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAwsCognitoAuth } from "@/hooks/useAwsCognitoAuth"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

// Function to generate device fingerprint
const generateDeviceFingerprint = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
  }
  
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvas: canvas.toDataURL(),
    timestamp: new Date().toISOString()
  };
  
  return {
    fingerprint: btoa(JSON.stringify(fingerprint)),
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    components: fingerprint
  };
};

export function SignInPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("social")
  const router = useRouter()
  const { addToast } = useToast()
  const [error, setError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { signIn } = useAwsCognitoAuth()

  useEffect(() => {
    // Check for verification success in URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const verified = urlParams.get("verified")
    const email = urlParams.get("email")
    const errorParam = urlParams.get("error")

    if (verified === "true" && email) {
      addToast({
        title: "Email Verified",
        description: "Your email has been verified successfully. You can now sign in.",
        duration: 5000,
      })

      // Pre-fill the email field
      setFormData((prev) => ({ ...prev, email }))
    } else if (errorParam === "verification_failed") {
      addToast({
        title: "Verification Failed",
        description: "There was a problem verifying your email. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    }

    // Clean up URL parameters
    if (verified || errorParam) {
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
    }
  }, [addToast])

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError(null)

    try {
      // Use AWS Cognito Hosted UI for Google OAuth
      await signIn('', '') // This will redirect to Cognito Hosted UI
    } catch (error) {
      console.error('Failed to initiate Cognito sign-in:', error)
      setError(error instanceof Error ? error.message : 'Failed to start sign-in. Please try again.')
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      // Basic validation first
      if (!formData.email || !formData.password) {
        throw new Error("Email and password are required")
      }

      if (formData.password.length < 8) {
        throw new Error("Password must be at least 8 characters")
      }

      // Validate with Zod
      loginSchema.parse(formData)

      setLoading(true)
      
      // Simple authentication (Firebase removed)
      const response = await fetch('/api/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      })
      
      if (!response.ok) {
        let errorMessage = 'Login failed'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (parseError) {
          // If we can't parse the error response, use a generic message
          console.error('Failed to parse error response:', parseError)
          errorMessage = `Login failed (${response.status})`
        }
        throw new Error(errorMessage)
      }
      
      const data = await response.json()
      
      // Validate response data
      if (!data.user || !data.token) {
        throw new Error('Invalid response from server')
      }
      
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('token', data.token)

      // Show success message
      addToast({
        title: "Success",
        description: "Signed in successfully!",
      })

      router.push("/home")
    } catch (err) {
      console.error('Login error:', err)

      let errorMessage = "Login failed"
      if (err instanceof z.ZodError) {
        errorMessage = err.errors[0].message
      } else if (err instanceof Error) {
        errorMessage = err.message
      }

      setError(errorMessage)
      addToast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl relative z-10"
      >
        <div className="bg-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl border border-gray-100/50 w-full max-w-sm sm:max-w-md md:max-w-lg">
          <div className="text-center mb-4 sm:mb-6 md:mb-8 lg:mb-10">
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold text-white">Welcome Back</h1>
            <p className="mt-1 sm:mt-2 text-white text-xs sm:text-sm md:text-base">Sign in to access your account</p>
          </div>

          {/* Email Sign In Form */}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-3 gap-4 bg-white/10 p-1 rounded-xl">
              <TabsTrigger
                value="email"
                className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </TabsTrigger>
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
                value="mobile"
                className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Mobile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-8 sm:pl-10 h-8 sm:h-9 md:h-10 bg-white border-gray-300 text-black focus:border-black text-xs sm:text-sm"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-8 sm:pl-10 h-8 sm:h-9 md:h-10 bg-white border-gray-300 text-black focus:border-black text-xs sm:text-sm"
                      disabled={loading}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Checkbox
                      id="remember"
                      className="border-gray-300 data-[state=checked]:bg-black data-[state=checked]:text-white"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, rememberMe: Boolean(checked) }))}
                      disabled={loading}
                    />
                    <label htmlFor="remember" className="ml-2 text-sm text-white">
                      Remember me
                    </label>
                  </div>
                  <Link href="/forgot-password" className="text-white hover:underline text-sm">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full h-8 sm:h-9 md:h-10 bg-black hover:bg-gray-800 text-white font-semibold text-xs sm:text-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="social">
              <div className="space-y-4">
                {/* Google Sign In */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border-gray-300 flex items-center justify-center gap-3 transition-all duration-200"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading || loading}
                >
                  {googleLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing in with Google...
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

                {/* Apple Sign In */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 bg-black hover:bg-gray-900 text-white border-gray-600 flex items-center justify-center gap-3 transition-all duration-200"
                  onClick={() => {
                    // TODO: Implement Apple sign-in
                    console.log('Apple sign-in clicked');
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
                    <span className="px-2 bg-gray-800 text-gray-400">Or continue with email</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-white hover:bg-white/10"
                  onClick={() => setActiveTab('email')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Use Email Instead
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="mobile">
              <div className="space-y-4">
                <Input
                  type="tel"
                  placeholder="Phone number"
                  className="pl-8 sm:pl-10 h-8 sm:h-9 md:h-10 bg-white border-gray-300 text-black focus:border-black text-xs sm:text-sm"
                  disabled={loading}
                />
                <Button
                  className="w-full h-8 sm:h-9 md:h-10 bg-black hover:bg-gray-800 text-white font-semibold text-xs sm:text-sm"
                  disabled={loading}
                >
                  Send Code
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8 text-center">
            <p className="text-white">
              New to Hoardrun?{" "}
              <Link href="/signup" className="text-white hover:underline font-semibold">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SignInPage
