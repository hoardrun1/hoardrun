"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { EyeIcon, EyeOffIcon, MailIcon, UserIcon, PhoneIcon, MapPinIcon, CalendarIcon, Loader2, ArrowRight } from "lucide-react"
import Image from "next/image"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { GoogleSignInButton } from "@/components/GoogleSignInButton"

// Validation schema
const signupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  country: z.string().optional(),
  bio: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password confirmation is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignupFormData = z.infer<typeof signupSchema>

export function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    country: "",
    bio: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  })
  const { signUp } = useAuth()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      setIsLoading(false)
      return
    }

    if (!formData.termsAccepted) {
      setError("You must accept the terms and conditions")
      setIsLoading(false)
      return
    }

    try {
      // Validate form data
      const validatedData = signupSchema.parse(formData)

      // Create account directly in database using Python backend
      await signUp(
        validatedData.email, 
        validatedData.password, 
        validatedData.firstName,
        validatedData.lastName,
        validatedData.phone,
        validatedData.dateOfBirth,
        validatedData.country,
        validatedData.bio
      )

      // Success - redirect to signin page
      toast({
        title: "Account Created!",
        description: "Your account has been created successfully. Please sign in.",
      })

      // Redirect to signin page
      router.push('/signin')

    } catch (err) {
      console.error('Signup error:', err)
      
      let errorMessage = "Signup failed"
      if (err instanceof z.ZodError) {
        errorMessage = err.errors[0].message
      } else if (err instanceof Error) {
        errorMessage = err.message
      }

      setError(errorMessage)
      toast({
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
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/60" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md lg:max-w-6xl 3xl:max-w-7xl"
      >
        {/* Large screen two-column layout */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 xl:gap-16 3xl:gap-20">
          {/* Left Column - Welcome Content (Hidden on mobile/tablet) */}
          <div className="hidden lg:flex lg:flex-col lg:justify-center lg:items-start lg:pr-8 xl:pr-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white"
            >
              <h1 className="text-3xl xl:text-4xl 3xl:text-5xl font-bold mb-6 xl:mb-8">
                Welcome to <span className="text-primary">HoardRun</span>
              </h1>
              <p className="text-lg xl:text-xl 3xl:text-2xl text-gray-200 mb-8 xl:mb-12 leading-relaxed">
                Your journey to financial freedom starts here
              </p>
              
              {/* Feature highlights */}
              <div className="space-y-6 xl:space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 xl:w-10 xl:h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 xl:w-5 xl:h-5 bg-primary rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-base xl:text-lg font-semibold mb-2">Smart Savings</h3>
                    <p className="text-gray-300 text-sm xl:text-base">Automated savings plans that grow with your goals</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 xl:w-10 xl:h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 xl:w-5 xl:h-5 bg-primary rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-base xl:text-lg font-semibold mb-2">Investment Opportunities</h3>
                    <p className="text-gray-300 text-sm xl:text-base">Access to diverse investment portfolios and market insights</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 xl:w-10 xl:h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 xl:w-5 xl:h-5 bg-primary rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-base xl:text-lg font-semibold mb-2">Secure Transactions</h3>
                    <p className="text-gray-300 text-sm xl:text-base">Bank-level security for all your financial activities</p>
                  </div>
                </div>
              </div>
              
              {/* Trust indicators */}
              <div className="mt-12 xl:mt-16 pt-8 xl:pt-12 border-t border-gray-600">
                <p className="text-xs xl:text-sm text-gray-400 mb-4">Trusted by thousands of users</p>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-xl xl:text-2xl font-bold text-primary">10K+</div>
                    <div className="text-xs text-gray-400">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl xl:text-2xl font-bold text-primary">$2M+</div>
                    <div className="text-xs text-gray-400">Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl xl:text-2xl font-bold text-primary">99.9%</div>
                    <div className="text-xs text-gray-400">Uptime</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Signup Form */}
          <div className="lg:flex lg:items-center lg:justify-center">
            <div className="bg-card/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 w-full lg:max-w-lg xl:max-w-xl">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-2">Create Account</h1>
                <p className="text-sm text-muted-foreground">Join HoardRun and start your journey</p>
              </div>

              {error && (
                <Alert className="mb-6" variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <GoogleSignInButton />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm text-foreground">First Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm text-foreground">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-foreground">Email</Label>
                  <div className="relative">
                    <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm text-foreground">Phone Number (Optional)</Label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="pl-10 h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-sm text-foreground">Date of Birth (Optional)</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="pl-10 h-12"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm text-foreground">Country (Optional)</Label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input
                        id="country"
                        name="country"
                        type="text"
                        placeholder="Your country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="pl-10 h-12"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm text-foreground">Bio (Optional)</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Tell us a bit about yourself"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm text-foreground">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pr-10 h-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm text-foreground">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pr-10 h-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <input
                    id="termsAccepted"
                    name="termsAccepted"
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 text-primary focus:ring-primary border-border rounded"
                    required
                  />
                  <label htmlFor="termsAccepted" className="text-sm text-muted-foreground">
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:text-primary/80 hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:text-primary/80 hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 btn-interactive"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/signin" className="text-primary hover:text-primary/80 hover:underline font-medium">
                  Sign in here
                </Link>
              </div>

              <div className="mt-4 text-center text-xs text-muted-foreground">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-primary hover:text-primary/80 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:text-primary/80 hover:underline">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Default export for easier importing
export default SignupPage
