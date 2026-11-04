"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Loader2, ArrowRight, ArrowLeft, Check } from "lucide-react"
import { z } from "zod"

import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { GoogleSignInButton } from "@/components/GoogleSignInButton"
import { AppleSignInButton } from "@/components/AppleSignInButton"
import { AuthError, AuthField, AuthShell, PasswordInput, StepCapsule } from "@/components/auth/auth-shell"
import { passwordChecks, SignupVisual } from "@/components/auth/signup-visuals"
import { useTranslation } from 'react-i18next'
import { countries } from "@/lib/countries"

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
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    // Pressing Enter on an earlier step moves forward instead of submitting
    if (currentStep < STEPS.length) {
      handleNext()
      return
    }

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

      // Success - redirect to check email page
      toast({
        title: "Account Created!",
        description: "Please check your email and enter the verification code to activate your account.",
      })

      router.push(`/check-email?email=${encodeURIComponent(validatedData.email)}`)

    } catch (err: any) {
      console.error('Signup error:', err)

      // Check if this is a redirect error (user exists but not verified)
      if (err.shouldRedirectToCheckEmail) {
        toast({
          title: "Email Already Registered",
          description: "This email is already registered but not verified. We've resent the verification code to your email.",
        })
        router.push(`/check-email?email=${encodeURIComponent(err.email || formData.email)}`)
        return
      }

      let errorMessage = "Signup failed"

      if (err instanceof z.ZodError) {
        errorMessage = err.errors[0].message
      } else if (err instanceof Error) {
        errorMessage = err.message

        // Additional check for error message patterns
        const lowerMessage = errorMessage.toLowerCase()
        if (
          lowerMessage.includes("already exists") ||
          lowerMessage.includes("already registered") ||
          lowerMessage.includes("not verified") ||
          lowerMessage.includes("verification")
        ) {
          toast({
            title: "Email Already Registered",
            description: "This email is already registered but not verified. We've resent the verification code to your email.",
          })
          router.push(`/check-email?email=${encodeURIComponent(formData.email)}`)
          return
        }
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

  const step = STEPS[currentStep - 1]
  const checks = passwordChecks(formData.password, formData.confirmPassword)
  const strength = checks.filter((check) => check.key !== "match" && check.met).length

  return (
    <AuthShell
      visual={<SignupVisual step={currentStep} form={formData} />}
      footerLink={
        <>
          <span>{t("signup.haveAccount")} </span>
          <Link href="/signin" className="lp-auth-link">
            {t("signup.signInHere")}
          </Link>
        </>
      }
    >
      <div className="lp-auth-stack">
        <div>
          <h1 className="lp-auth-title">{currentStep === 1 ? t("signup.createAccount") : t(step.nameKey)}</h1>
          <p className="lp-auth-sub">{currentStep === 1 ? t("signup.subtitle") : t(step.descKey)}</p>
        </div>

        <StepCapsule
          steps={STEPS.map((item) => ({ id: item.id, label: t(item.nameKey) }))}
          current={currentStep}
          onSelect={(id) => {
            setError(null)
            setCurrentStep(id)
          }}
        />

        {error && <AuthError>{error}</AuthError>}

        {currentStep === 1 && (
          <>
            <GoogleSignInButton mode="signup" className="!h-[var(--auth-field)] !rounded-full !border-0 !py-0" />
            <AppleSignInButton mode="signup" className="!h-[var(--auth-field)] !rounded-full !border-0 !py-0" />
            <p className="-mt-1 text-center text-xs font-light text-[var(--lp-muted)]">
              Signing up this way means you agree to the <Link href="/terms" className="lp-auth-link">Terms</Link> and{' '}
              <Link href="/privacy" className="lp-auth-link">Privacy Policy</Link>.
            </p>
            <div className="lp-auth-divider">Or continue with email</div>
          </>
        )}

        <form onSubmit={handleSignup} className="lp-auth-stack" noValidate>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentStep}
              className="lp-auth-stack"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <AuthField id="firstName" label={t("signup.fields.firstName")}>
                      <input id="firstName" name="firstName" type="text" autoComplete="given-name" value={formData.firstName} onChange={handleInputChange} className="lp-input" autoFocus />
                    </AuthField>
                    <AuthField id="lastName" label={t("signup.fields.lastName")}>
                      <input id="lastName" name="lastName" type="text" autoComplete="family-name" value={formData.lastName} onChange={handleInputChange} className="lp-input" />
                    </AuthField>
                  </div>
                  <AuthField id="email" label={t("signup.fields.email")}>
                    <input id="email" name="email" type="email" autoComplete="email" placeholder={t("signup.fields.emailPlaceholder")} value={formData.email} onChange={handleInputChange} className="lp-input" />
                  </AuthField>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <AuthField id="phone" label={t("signup.fields.phone")}>
                      <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder={t("signup.fields.phonePlaceholder")} value={formData.phone} onChange={handleInputChange} className="lp-input" />
                    </AuthField>
                    <AuthField id="dateOfBirth" label={t("signup.fields.dateOfBirth")}>
                      <input id="dateOfBirth" name="dateOfBirth" type="date" autoComplete="bday" value={formData.dateOfBirth} onChange={handleInputChange} className="lp-input" />
                    </AuthField>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <AuthField id="country" label={t("signup.fields.country")}>
                      <select id="country" name="country" autoComplete="country" value={formData.country} onChange={handleInputChange} className="lp-input">
                        <option value="">{t("signup.fields.country")}</option>
                        {countries.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </AuthField>
                    <AuthField id="idNumber" label={t("signup.fields.idNumber")}>
                      <input id="idNumber" name="idNumber" type="text" autoComplete="off" placeholder={t("signup.fields.idPlaceholder")} value={formData.idNumber} onChange={handleInputChange} className="lp-input" />
                    </AuthField>
                  </div>
                  <AuthField id="bio" label={t("signup.fields.bio")}>
                    <textarea id="bio" name="bio" placeholder={t("signup.fields.bioPlaceholder")} value={formData.bio} onChange={handleInputChange} className="lp-input" rows={2} />
                  </AuthField>
                  <p className="text-xs font-light text-[var(--lp-muted)]">{t("signup.optionalNote")}</p>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <AuthField id="password" label={t("signup.fields.password")}>
                    <PasswordInput id="password" name="password" autoComplete="new-password" placeholder={t("signup.fields.passwordPlaceholder")} value={formData.password} onChange={handleInputChange} />
                    <div className="lp-auth-meter mt-2" role="img" aria-label={`Password strength ${strength} of 3`}>
                      {[1, 2, 3, 4].map((level) => (
                        <span key={level} data-on={Math.ceil((strength / 3) * 4) >= level && strength > 0} />
                      ))}
                    </div>
                  </AuthField>
                  <AuthField id="confirmPassword" label={t("signup.fields.confirmPassword")}>
                    <PasswordInput id="confirmPassword" name="confirmPassword" autoComplete="new-password" placeholder={t("signup.fields.confirmPasswordPlaceholder")} value={formData.confirmPassword} onChange={handleInputChange} />
                  </AuthField>
                  <label htmlFor="termsAccepted" className="flex cursor-pointer items-start gap-2.5 text-[13px] font-light leading-snug text-[var(--lp-muted)]">
                    <input id="termsAccepted" name="termsAccepted" type="checkbox" checked={formData.termsAccepted} onChange={handleInputChange} className="lp-auth-check mt-0.5" />
                    <span>
                      {t("signup.terms")}{" "}
                      <Link href="/terms" className="lp-auth-link">
                        {t("signup.termsOfService")}
                      </Link>{" "}
                      {t("signup.and")}{" "}
                      <Link href="/privacy" className="lp-auth-link">
                        {t("signup.privacyPolicy")}
                      </Link>
                    </span>
                  </label>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-3">
            {currentStep > 1 && (
              <button type="button" onClick={handleBack} disabled={isLoading} aria-label={t("signup.back")} className="lp-btn lp-btn-ghost lp-auth-btn !w-auto flex-none">
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <button type="submit" disabled={isLoading} className="lp-btn lp-btn-primary lp-auth-btn font-medium">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("signup.creatingAccount")}
                </>
              ) : currentStep < STEPS.length ? (
                <>
                  {t("signup.next")}
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  {t("signup.createAccount")}
                  <Check className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AuthShell>
  )
}

export default SignupPage
