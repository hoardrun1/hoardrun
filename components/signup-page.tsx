"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { EyeIcon, EyeOffIcon, MailIcon, UserIcon, PhoneIcon, MapPinIcon, CalendarIcon, Loader2, ArrowRight, ArrowLeft, Check } from "lucide-react"
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
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useTranslation } from 'react-i18next'

// Validation schema
const signupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  country: z.string().optional(),
  idNumber: z.string().optional(),
  bio: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password confirmation is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignupFormData = z.infer<typeof signupSchema>

const STEPS = [
  { id: 1, nameKey: "signup.steps.account", descKey: "signup.steps.accountDesc" },
  { id: 2, nameKey: "signup.steps.profile", descKey: "signup.steps.profileDesc" },
  { id: 3, nameKey: "signup.steps.security", descKey: "signup.steps.securityDesc" },
]

export function SignupPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
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
    idNumber: "",
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
    setError(null)
  }

  const validateStep = (step: number): boolean => {
    setError(null)
    
    switch (step) {
      case 1:
        if (!formData.firstName.trim() || formData.firstName.length < 2) {
          setError("First name must be at least 2 characters")
          return false
        }
        if (!formData.lastName.trim() || formData.lastName.length < 2) {
          setError("Last name must be at least 2 characters")
          return false
        }
        if (!formData.email.trim()) {
          setError("Email is required")
          return false
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
          setError("Invalid email address")
          return false
        }
        return true
      
      case 2:
        // Optional step, always valid
        return true
      
      case 3:
        if (!formData.password || formData.password.length < 8) {
          setError("Password must be at least 8 characters")
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match")
          return false
        }
        if (!formData.termsAccepted) {
          setError("You must accept the terms and conditions")
          return false
        }
        return true
      
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
    }
  }

  const handleBack = () => {
    setError(null)
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(currentStep)) {
      return
    }

    setIsLoading(true)
    setError(null)

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
        validatedData.idNumber,
        validatedData.bio
      )

      // Success - redirect to signin page
      toast({
        title: "Account Created!",
        description: "Your account has been created successfully. Please sign in.",
      })

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

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8">
      <Image
        alt="Dark crumpled paper background"
        src="https://images.unsplash.com/photo-1618123069754-cd64c230a169?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/60" />

      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher variant="mobile" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }} 
        className="relative z-10 w-full max-w-[95%] sm:max-w-md md:max-w-lg lg:max-w-2xl"
      >
        <div className="bg-card/95 backdrop-blur-md rounded-2xl shadow-2xl border border-border/50 p-4 sm:p-6 md:p-8 lg:p-10">
          
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">{t("signup.createAccount")}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">{t("signup.subtitle")}</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      currentStep > step.id 
                        ? 'bg-primary border-primary text-primary-foreground' 
                        : currentStep === step.id 
                        ? 'border-primary text-primary bg-primary/10' 
                        : 'border-border text-muted-foreground bg-card'
                    }`}>
                      {currentStep > step.id ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span className="font-semibold">{step.id}</span>
                      )}
                    </div>
                    <div className="mt-2 text-center hidden sm:block">
                      <p className={`text-xs font-medium ${currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {t(step.nameKey)}
                      </p>
                      <p className="text-xs text-muted-foreground">{t(step.descKey)}</p>
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`h-[2px] flex-1 mx-2 transition-all ${
                      currentStep > step.id ? 'bg-primary' : 'bg-border'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="mb-4 sm:mb-6" variant="destructive">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* Google Sign In - Only on Step 1 */}
          {currentStep === 1 && (
            <div className="space-y-4 mb-6">
              <GoogleSignInButton />
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground font-medium">Or continue with email</span>
                </div>
              </div>
            </div>
          )}

          {/* Form Steps */}
          <form onSubmit={handleSignup}>
            <AnimatePresence mode="wait" custom={currentStep}>
              <motion.div
                key={currentStep}
                custom={currentStep}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="space-y-4 sm:space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
                          {t("signup.fields.firstName")} <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
                          <Input
                            id="firstName"
                            name="firstName"
                            type="text"
                            placeholder={t("signup.fields.firstName")}
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="pl-9 sm:pl-10 h-11 sm:h-12 transition-all focus:ring-2 focus:ring-primary/20"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
                          {t("signup.fields.lastName")} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          placeholder={t("signup.fields.lastName")}
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="h-11 sm:h-12 transition-all focus:ring-2 focus:ring-primary/20"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-foreground">
                        {t("signup.fields.email")} <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder={t("signup.fields.emailPlaceholder")}
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-9 sm:pl-10 h-11 sm:h-12 transition-all focus:ring-2 focus:ring-primary/20"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Profile Information */}
                {currentStep === 2 && (
                  <div className="space-y-4 sm:space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-foreground">{t("signup.fields.phone")}</Label>
                      <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder={t("signup.fields.phonePlaceholder")}
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="pl-9 sm:pl-10 h-11 sm:h-12 transition-all focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth" className="text-sm font-medium text-foreground">{t("signup.fields.dateOfBirth")}</Label>
                        <div className="relative">
                          <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
                          <Input
                            id="dateOfBirth"
                            name="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            className="pl-9 sm:pl-10 h-11 sm:h-12 transition-all focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country" className="text-sm font-medium text-foreground">{t("signup.fields.country")}</Label>
                        <div className="relative">
                          <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
                          <Input
                            id="country"
                            name="country"
                            type="text"
                            placeholder={t("signup.fields.countryPlaceholder")}
                            value={formData.country}
                            onChange={handleInputChange}
                            className="pl-9 sm:pl-10 h-11 sm:h-12 transition-all focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="idNumber" className="text-sm font-medium text-foreground">{t("signup.fields.idNumber")}</Label>
                      <Input
                        id="idNumber"
                        name="idNumber"
                        type="text"
                        placeholder={t("signup.fields.idPlaceholder")}
                        value={formData.idNumber}
                        onChange={handleInputChange}
                        className="h-11 sm:h-12 transition-all focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-sm font-medium text-foreground">{t("signup.fields.bio")}</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        placeholder={t("signup.fields.bioPlaceholder")}
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="resize-none min-h-[100px] transition-all focus:ring-2 focus:ring-primary/20"
                        rows={4}
                      />
                    </div>

                    <p className="text-xs text-muted-foreground italic">
                      {t("signup.optionalNote")}
                    </p>
                  </div>
                )}

                {/* Step 3: Security */}
                {currentStep === 3 && (
                  <div className="space-y-4 sm:space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-foreground">
                        {t("signup.fields.password")} <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder={t("signup.fields.passwordPlaceholder")}
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pr-10 h-11 sm:h-12 transition-all focus:ring-2 focus:ring-primary/20"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-11 sm:h-12 px-3 hover:bg-transparent"
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
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                        {t("signup.fields.confirmPassword")} <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder={t("signup.fields.confirmPasswordPlaceholder")}
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="pr-10 h-11 sm:h-12 transition-all focus:ring-2 focus:ring-primary/20"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-11 sm:h-12 px-3 hover:bg-transparent"
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

                    <div className="flex items-start space-x-3 pt-2">
                      <input
                        id="termsAccepted"
                        name="termsAccepted"
                        type="checkbox"
                        checked={formData.termsAccepted}
                        onChange={handleInputChange}
                        className="mt-1 h-4 w-4 text-primary focus:ring-primary border-border rounded cursor-pointer"
                        required
                      />
                      <label htmlFor="termsAccepted" className="text-xs sm:text-sm text-muted-foreground leading-relaxed cursor-pointer">
                        {t("signup.terms")}{" "}
                        <Link href="/terms" className="text-primary hover:text-primary/80 hover:underline font-medium">
                          {t("signup.termsOfService")}
                        </Link>{" "}
                        {t("signup.and")}{" "}
                        <Link href="/privacy" className="text-primary hover:text-primary/80 hover:underline font-medium">
                          {t("signup.privacyPolicy")}
                        </Link>
                      </label>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-6 sm:mt-8">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 h-11 sm:h-12 text-base font-semibold transition-all"
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("signup.back")}
                </Button>
              )}

              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 h-11 sm:h-12 btn-interactive text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t("signup.next")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="flex-1 h-11 sm:h-12 btn-interactive text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("signup.creatingAccount")}
                    </>
                  ) : (
                    <>
                      {t("signup.createAccount")}
                      <Check className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>

          {/* Footer Links */}
          <div className="mt-6 sm:mt-8 space-y-3">
            <div className="text-center text-sm text-muted-foreground">
              {t("signup.haveAccount")}{" "}
              <Link href="/signin" className="text-primary hover:text-primary/80 hover:underline font-semibold transition-colors">
                {t("signup.signInHere")}
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SignupPage