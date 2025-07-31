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
  const { toast } = useToast()
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
      toast({
        title: "Email Verified",
        description: "Your email has been verified successfully. You can now sign in.",
        duration: 5000,
      })

      // Pre-fill the email field
      setFormData((prev) => ({ ...prev, email }))
    } else if (errorParam === "verification_failed") {
      toast({
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
  }, [toast])

  const handleSocialLogin = async (provider: "google" | "apple") => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/auth/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      if (data.requiresVerification) {
        router.push("/verify-signin")
      } else {
        router.push("/home")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login with social provider")
      toast({
        title: "Login Failed",
        description: err instanceof Error ? err.message : "Failed to login",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      loginSchema.parse(formData)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      // Store necessary data for verification
      if (data.requiresVerification) {
        sessionStorage.setItem("auth_email", formData.email)
        sessionStorage.setItem("temp_token", data.tempToken)
        router.push("/verify-signin")
      } else {
        router.push("/home")
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message)
      } else {
        setError(err instanceof Error ? err.message : "Invalid credentials")
      }
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Invalid credentials",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 md:p-8">
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
        className="w-full max-w-md md:max-w-xl lg:max-w-2xl relative z-10"
      >
        <div className="bg-white/10 rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100/50">
          <div className="text-center mb-8 md:mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">Welcome Back</h1>
            <p className="mt-2 text-white text-base md:text-lg">Sign in to access your account</p>
          </div>

          <div className="space-y-3 mb-8">
            <Button
              variant="outline"
              className="w-full bg-white hover:bg-gray-100 border-gray-300 text-black py-6 text-base"
              onClick={() => handleSocialLogin("google")}
              disabled={isLoading}
            >
              <Image src="/google-icon.svg" alt="Google" width={20} height={20} className="mr-2" />
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full bg-white hover:bg-gray-100 border-gray-300 text-black py-6 text-base"
              onClick={() => handleSocialLogin("apple")}
              disabled={isLoading}
            >
              <Image src="/apple-icon.svg" alt="Apple" width={20} height={20} className="mr-2" />
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
                      className="pl-10 h-12 bg-white border-gray-300 text-black focus:border-black"
                      disabled={isLoading}
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
                      className="pl-10 h-12 bg-white border-gray-300 text-black focus:border-black"
                      disabled={isLoading}
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
                  className="w-full h-12 bg-black hover:bg-gray-800 text-white font-semibold text-base"
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
                  className="pl-10 h-12 bg-white border-gray-300 text-black focus:border-black"
                  disabled={isLoading}
                />
                <Button
                  className="w-full h-12 bg-black hover:bg-gray-800 text-white font-semibold text-base"
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
