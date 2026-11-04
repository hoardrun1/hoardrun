"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/contexts/AuthContext"
import { authFont } from "@/components/auth/auth-shell"
import { LiquidCanvas } from "@/components/landing/liquid-canvas"

export default function SignOutPage() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()

  // Opening this page always ends the session, so what it says is always true.
  useEffect(() => {
    if (user) {
      logout()
    }
  }, [user, logout])

  return (
    <div className={`lp lp-auth fixed inset-0 flex items-center justify-center overflow-hidden px-6 pb-[12vh] text-center ${authFont.className}`}>
      <LiquidCanvas pool={[0.5, -0.1]} />
      <div aria-hidden="true" className="lp-eclipse lp-eclipse-signout" />

      <div className="relative z-10 flex flex-col items-center">
        <h1 className="lp-display lp-rise text-[clamp(2.25rem,6.5vh,4rem)] leading-[1.05]" style={{ animationDelay: "0.1s" }}>
          {t("signout.title", "You're signed out")}
        </h1>
        <p className="lp-rise mt-3 max-w-md text-[17px] font-light text-[#d1d1d6]" style={{ animationDelay: "0.2s" }}>
          {t("signout.subtitle", "Your session has ended on this device.")}
        </p>
        <div className="lp-rise mt-7 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "0.3s" }}>
          <Link href="/signin" className="lp-btn lp-btn-primary font-medium">
            {t("signout.signInAgain", "Sign in again")}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/" className="lp-btn lp-btn-ghost">
            {t("signout.backHome", "Back to home")}
          </Link>
        </div>
      </div>
    </div>
  )
}
