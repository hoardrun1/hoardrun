"use client"

import React, { useState, useEffect } from "react"
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

type LoginFormData = z.infer<typeof loginSchema>

export function SignInPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("cognito")
  const router = useRouter()
  const { toast } = useToast()
  const { signIn: cognitoSignIn, error: cognitoError, loading: cognitoLoading } = useAwsCognitoAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for verification success in URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const verified = urlParams.get("verified")
    const email = urlParams.get("email")
    const errorParam = urlParams.get("error")

    if (verified === "true" && email) {
      toast({
        title: "Email Verified!",
        description: `Your email ${email} has been successfully verified. You can now sign in.`,
        variant: "default",
      })
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    if (errorParam) {
      setError(decodeURIComponent(errorParam))
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    // Set error from Cognito hook
    if (cognitoError) {
      setError(cognitoError)
    }
  }, [toast, cognitoError])

  const handleCognitoSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // AWS Cognito will handle the authentication via Hosted UI
      // The email and password fields are not used directly, but we validate them for UX
      if (!formData.email || !formData.password) {
        throw new Error("Email and password are required")
      }

      if (formData.password.length < 8) {
        throw new Error("Password must be at least 8 characters")
      }

      // Validate with Zod
      loginSchema.parse(formData)

      toast({
        title: "Redirecting...",
        description: "Redirecting to AWS Cognito for authentication",
      })

      // This will redirect to AWS Cognito Hosted UI
      await cognitoSignIn(formData.email, formData.password)
      
    } catch (err) {
      console.error('Login error:', err)
      
      let errorMessage = "Login failed"
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

  const handleDirectCognitoSignIn = async () => {
    setError(null)
    
    try {
      toast({
        title: "Redirecting...",
        description: "Redirecting to AWS Cognito for authentication",
      })

      // Direct sign in without form validation
      await cognitoSignIn("", "")
      
    } catch (err) {
      console.error('Direct Cognito login error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
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
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-card/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your HoardRun account</p>
          </div>

          {error && (
            <Alert className="mb-6" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="cognito" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                AWS Cognito
              </TabsTrigger>
              <TabsTrigger value="form" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Form Login
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cognito" className="space-y-4">
              <Button
                onClick={handleDirectCognitoSignIn}
                className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                disabled={cognitoLoading}
              >
                {cognitoLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Sign In with AWS Cognito
                  </>
                )}
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                Secure authentication powered by AWS Cognito
              </div>
            </TabsContent>

            <TabsContent value="form" className="space-y-4">
              <form onSubmit={handleCognitoSignIn} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 h-12"
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
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))
                      }
                    />
                    <label htmlFor="rememberMe" className="text-sm text-muted-foreground">
                      Remember me
                    </label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isLoading || cognitoLoading}
                >
                  {isLoading || cognitoLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redirecting to Cognito...
                    </>
                  ) : (
                    "Sign In with Cognito"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-600 hover:underline font-medium">
              Sign up here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
