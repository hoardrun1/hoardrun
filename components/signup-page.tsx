"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { motion } from "framer-motion"
import Link from "next/link"
import { EyeIcon, EyeOffIcon, MailIcon, UserIcon, Loader2, ArrowRight } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"

export function SignupPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      console.log("Submitting signup form:", {
        name: formData.name,
        email: formData.email,
        password: "********", // Don't log actual password
      })

      // Now try the actual POST request
      console.log("Sending POST request...")
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))

      // Get the response as text first for debugging
      const responseText = await response.text()
      console.log("Response text:", responseText)

      // Try to parse the response as JSON
      let data
      try {
        data = JSON.parse(responseText)
        console.log("Parsed JSON data:", data)
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError)
        throw new Error("Server returned invalid JSON")
      }

      if (!response.ok) {
        throw new Error(data.error || "Signup failed")
      }

      // Log the user in with the returned token and user data
      login(data.token, data.user)

      // Show success message
      addToast({
        title: "Success",
        description: "Account created successfully! Welcome to Hoardrun.",
      })

      // Redirect to home page
      router.push("/home")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Signup failed")
      addToast({
        title: "Error",
        description: error instanceof Error ? error.message : "Signup failed",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    // Implement social login logic
    console.log(`Logging in with ${provider}`)
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

          {/* Social Login Buttons */}
          <div className="space-y-2 sm:space-y-3 md:space-y-4 mb-4 sm:mb-6 md:mb-8">
            <Button
              variant="outline"
              className="w-full bg-white hover:bg-gray-100 border-gray-300 text-black py-2 sm:py-3 md:py-4 text-xs sm:text-sm"
              onClick={() => handleSocialLogin("google")}
            >
              <Image src="/google-icon.svg" alt="Google" width={20} height={20} className="mr-2" />
              Continue with Google
            </Button>
            <Button
              variant="outline"
              className="w-full bg-white hover:bg-gray-100 border-gray-300 text-black py-2 sm:py-3 md:py-4 text-xs sm:text-sm"
              onClick={() => handleSocialLogin("apple")}
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
              <span className="px-2 -mt-4 bg-white/10 text-white">Or continue with email</span>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-8 sm:h-9 md:h-10 bg-black hover:bg-gray-800 text-white font-semibold text-xs sm:text-sm"
              disabled={isLoading}
            >
              {isLoading ? (
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
