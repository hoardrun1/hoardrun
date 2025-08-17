"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Eye, EyeOff, QrCode, Smartphone, Mail, Lock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("email")
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const router = useRouter()
  const { addToast } = useToast()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if biometric authentication is available
    const checkBiometricAvailability = async () => {
      try {
        // This is a simplified check - in a real app, you'd use the Web Authentication API
        const available = "PublicKeyCredential" in window
        setBiometricAvailable(available)
      } catch (error) {
        console.error("Error checking biometric availability:", error)
        setBiometricAvailable(false)
      }
    }

    checkBiometricAvailability()

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

  const handleSocialLogin = async (provider: "google" | "apple") => {
    setIsLoading(true)
    setError(null)

    try {
      if (provider === "google") {
        await handleGoogleSignin()
      } else if (provider === "apple") {
        await handleAppleSignin()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to login with ${provider}`)
      addToast({
        title: "Login Failed",
        description: err instanceof Error ? err.message : `Failed to login with ${provider}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignin = async () => {
    // For development, we'll simulate Google OAuth
    // In production, you would use the Google Sign-In library
    try {
      // Simulate Google OAuth response
      const mockGoogleToken = "mock-google-id-token"

      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken: mockGoogleToken,
          action: "signin"
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Google signin failed")
      }

      addToast({
        title: "Success",
        description: data.message || "Signed in successfully with Google!",
      })

      router.push("/home")
    } catch (error) {
      throw error
    }
  }

  const handleAppleSignin = async () => {
    // For development, we'll simulate Apple Sign In
    // In production, you would use the Apple Sign In library
    try {
      // Simulate Apple Sign In response
      const mockAppleToken = "mock-apple-identity-token"

      const response = await fetch("/api/auth/apple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identityToken: mockAppleToken,
          action: "signin"
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Apple signin failed")
      }

      addToast({
        title: "Success",
        description: data.message || "Signed in successfully with Apple!",
      })

      router.push("/home")
    } catch (error) {
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
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

      // Generate device fingerprint
      const deviceInfo = generateDeviceFingerprint()

      console.log('Sending login request with:', {
        email: formData.email,
        password: '***hidden***',
        deviceInfo: {
          fingerprint: deviceInfo.fingerprint.substring(0, 20) + '...',
          userAgent: deviceInfo.userAgent.substring(0, 50) + '...',
          timestamp: deviceInfo.timestamp
        },
        rememberMe: formData.rememberMe
      })

      const response = await fetch("/api/custom-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          deviceInfo,
          rememberMe: formData.rememberMe
        }),
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      // Get response text for debugging
      const responseText = await response.text()
      console.log('Response text:', responseText)

      let data
      try {
        data = JSON.parse(responseText)
        console.log('Parsed response data:', data)
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError)
        throw new Error(`Server returned invalid JSON: ${responseText}`)
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}`)
      }

      // Store necessary data for verification
      if (data.requiresVerification) {
        sessionStorage.setItem("auth_email", formData.email)
        sessionStorage.setItem("temp_token", data.tempToken)
        router.push("/verify-signin")
      } else {
        // Show success message
        addToast({
          title: "Success",
          description: "Signed in successfully!",
        })
        router.push("/home")
      }
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
      setIsLoading(false)
    }
  }

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
        className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl relative z-10"
      >
        <div className="bg-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl border border-gray-100/50 w-full max-w-sm sm:max-w-md md:max-w-lg">
          <div className="text-center mb-4 sm:mb-6 md:mb-8 lg:mb-10">
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold text-white">Welcome Back</h1>
            <p className="mt-1 sm:mt-2 text-white text-xs sm:text-sm md:text-base">Sign in to access your account</p>
          </div>

          <div className="space-y-3 mb-8">
            <Button
              variant="outline"
              className="w-full bg-white hover:bg-gray-100 border-gray-300 text-black py-6 text-base"
              onClick={() => handleSocialLogin("google")}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Image src="/google-icon.svg" alt="Google" width={20} height={20} className="mr-2" />
              )}
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full bg-white hover:bg-gray-100 border-gray-300 text-black py-6 text-base"
              onClick={() => handleSocialLogin("apple")}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Image src="/apple-icon.svg" alt="Apple" width={20} height={20} className="mr-2" />
              )}
              Continue with Apple
            </Button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 -mt-4 bg-white/10 text-white">Or continue with</span>
            </div>
          </div>

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
                value="qr"
                className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
              >
                <QrCode className="w-4 h-4 mr-2" />
                QR Code
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
                      disabled={isLoading}
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
                      disabled={isLoading}
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
                      disabled={isLoading}
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
                  disabled={isLoading}
                >
                  {isLoading ? (
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

            <TabsContent value="qr">
              <div className="text-center py-8">
                <div className="bg-white p-4 rounded-lg inline-block mb-4">
                  <QrCode className="w-32 h-32 text-gray-800" />
                </div>
                <p className="text-white">Scan with mobile app to sign in</p>
              </div>
            </TabsContent>

            <TabsContent value="mobile">
              <div className="space-y-4">
                <Input
                  type="tel"
                  placeholder="Phone number"
                  className="pl-8 sm:pl-10 h-8 sm:h-9 md:h-10 bg-white border-gray-300 text-black focus:border-black text-xs sm:text-sm"
                  disabled={isLoading}
                />
                <Button
                  className="w-full h-8 sm:h-9 md:h-10 bg-black hover:bg-gray-800 text-white font-semibold text-xs sm:text-sm"
                  disabled={isLoading}
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