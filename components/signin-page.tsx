"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { Loader2, ArrowRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { GoogleSignInButton } from "@/components/GoogleSignInButton"
import { AppleSignInButton } from "@/components/AppleSignInButton"
import { AuthError, AuthField, AuthShell, PasswordInput } from "@/components/auth/auth-shell"
import { ProductStage } from "@/components/landing/product-stage"
import { useTranslation } from 'react-i18next'

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export function SignInPage() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { signIn } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for verification success in URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const verified = urlParams.get("verified")
    const email = urlParams.get("email")
    const errorParam = urlParams.get("error")
    const callbackUrl = urlParams.get("callbackUrl")

    if (verified === "true") {
      toast({
        title: "Email Verified!",
        description: email ? `Your email ${email} has been successfully verified. You can now sign in.` : "Your email is confirmed. You can now sign in.",
        variant: "default",
      })
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    if (urlParams.get("reset") === "true") {
      toast({ title: "Password changed", description: "Sign in with your new password." })
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    if (errorParam) {
      let errorMessage = 'Verification failed. The link may be invalid or expired.'

      if (errorParam === 'invalid_token') {
        errorMessage = 'Invalid verification link - the token may be expired or invalid.'
      } else if (errorParam === 'server_error') {
        errorMessage = 'A server error occurred during verification. Please try again.'
      } else if (errorParam === 'verification_failed') {
        errorMessage = 'Email verification failed. The link may be invalid or expired.'
      }

      setError(errorMessage)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    // Store callbackUrl for later use
    if (callbackUrl) {
      sessionStorage.setItem('callbackUrl', callbackUrl)
    }
  }, [toast])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validate form data
      const validatedData = loginSchema.parse(formData)

      // Sign in using Python backend
      await signIn(validatedData.email, validatedData.password)

      // Success - redirect to dashboard
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      })

      // Check for callbackUrl in sessionStorage
      const callbackUrl = sessionStorage.getItem('callbackUrl')
      if (callbackUrl) {
        sessionStorage.removeItem('callbackUrl')
        router.push(callbackUrl)
      } else {
        router.push('/home')
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
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
    <AuthShell
      visual={
        <div className="flex h-full items-center justify-center">
          <div className="lp-auth-art">
            <ProductStage showBrand={false} />
          </div>
        </div>
      }
      footerLink={
        <>
          <span>{t("signin.noAccount")} </span>
          <Link href="/signup" className="lp-auth-link">
            {t("signin.signUpHere")}
          </Link>
        </>
      }
    >
      <div className="lp-auth-stack">
        <div>
          <h1 className="lp-auth-title">{t("signin.welcomeBack")}</h1>
          <p className="lp-auth-sub">{t("signin.subtitle")}</p>
        </div>

        {error && <AuthError>{error}</AuthError>}

        <GoogleSignInButton className="!h-[var(--auth-field)] !rounded-full !border-0 !py-0" />
        <AppleSignInButton className="!h-[var(--auth-field)] !rounded-full !border-0 !py-0" />
        <div className="lp-auth-divider">Or</div>

        <form onSubmit={handleSignIn} className="lp-auth-stack" noValidate>
          <AuthField id="email" label={t("signin.emailPlaceholder")}>
            <input id="email" type="email" name="email" autoComplete="email" value={formData.email} onChange={handleInputChange} className="lp-input" required />
          </AuthField>
          <AuthField id="password" label={t("signin.passwordPlaceholder")}>
            <PasswordInput id="password" name="password" autoComplete="current-password" value={formData.password} onChange={handleInputChange} required />
          </AuthField>

          <div className="flex items-center justify-between gap-3 text-[13px] font-light text-[var(--lp-muted)]">
            <label htmlFor="rememberMe" className="flex cursor-pointer items-center gap-2">
              <input id="rememberMe" name="rememberMe" type="checkbox" checked={formData.rememberMe} onChange={handleInputChange} className="lp-auth-check" />
              {t("signin.rememberMe")}
            </label>
            <Link href="/forgot-password" className="lp-auth-link">
              {t("signin.forgotPassword")}
            </Link>
          </div>

          <button type="submit" disabled={isLoading} className="lp-btn lp-btn-primary lp-auth-btn font-medium">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("signin.signingIn")}
              </>
            ) : (
              <>
                {t("signin.signIn")}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </AuthShell>
  )
}
