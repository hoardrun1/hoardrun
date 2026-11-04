"use client"

import type React from "react"
import { useState } from "react"
import { Inter } from "next/font/google"
import { AnimatePresence, motion } from "framer-motion"
import { Check, Eye, EyeOff } from "lucide-react"
import { LiquidCanvas } from "@/components/landing/liquid-canvas"
import { Toaster } from "@/components/ui/toast"
import { AuthTopBar, AuthWelcome, useWelcome } from "./auth-mobile"
import "@/components/landing/landing.css"
import "./auth.css"

export const authFont = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "800"], display: "swap" })

type AuthShellProps = {
  visual: React.ReactNode
  footerLink: React.ReactNode
  children: React.ReactNode
  // Pages opened from an email link go straight to the form, without the phone welcome stories
  skipWelcome?: boolean
}

/** One-screen auth layout: a lit black stage beside the form. The page itself never scrolls. */
export function AuthShell({ visual, footerLink, children, skipWelcome = false }: AuthShellProps) {
  const [storyTime, setWelcome] = useWelcome()
  const welcome = storyTime && !skipWelcome

  return (
    <div className={`lp lp-auth fixed inset-0 grid overflow-hidden lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] ${authFont.className}`}>
      <aside className="relative m-3 hidden overflow-hidden rounded-[28px] border border-white/10 lg:block">
        <LiquidCanvas pool={[0.5, 0.05]} />
        <div aria-hidden="true" className="lp-eclipse lp-eclipse-auth" />
        <div className="absolute inset-0">{visual}</div>
      </aside>

      <main className="relative flex min-h-0 flex-col overflow-hidden">
        {/* Phones: Revolut's plain black form with a back arrow to the welcome stories; large screens keep the stage beside */}
        <AuthTopBar onBack={() => (skipWelcome ? window.location.assign("/signin") : setWelcome(true))} />
        <div className="lp-auth-body lp-auth-sheet relative z-10 flex min-h-0 flex-1 overflow-y-auto px-5 sm:px-8">
          <div className="m-auto w-full max-w-[420px] py-2">
            {children}
            <p className="mt-5 text-center text-sm text-[var(--lp-muted)]">{footerLink}</p>
          </div>
        </div>
      </main>
      <AnimatePresence>{welcome && <AuthWelcome onDone={() => setWelcome(false)} />}</AnimatePresence>
      {/* Auth pages sit outside the app layout, which is where toasts are otherwise shown */}
      <Toaster />
    </div>
  )
}

type StepCapsuleProps = {
  steps: { id: number; label: string }[]
  current: number
  onSelect: (id: number) => void
}

/** White step control, matching the landing page nav. Only finished steps can be revisited. */
export function StepCapsule({ steps, current, onSelect }: StepCapsuleProps) {
  return (
    <ol className="lp-glass grid grid-cols-3 gap-1 rounded-full p-1">
      {steps.map((step) => {
        const done = current > step.id
        const active = current === step.id
        return (
          <li key={step.id}>
            <button
              type="button"
              disabled={!done}
              onClick={() => onSelect(step.id)}
              aria-current={active ? "step" : undefined}
              className={`lp-link relative flex h-9 w-full items-center justify-center gap-1.5 rounded-full text-[13px] ${active ? "text-white" : done ? "text-[var(--material-text)]" : "text-[var(--lp-muted)]"}`}
            >
              {active && (
                <motion.span
                  layoutId="lp-step-lens"
                  className="lp-glass-lens absolute inset-0 rounded-full"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative flex items-center gap-1.5">
                {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                {step.label}
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

type AuthFieldProps = {
  id: string
  label: string
  children: React.ReactNode
}

export function AuthField({ id, label, children }: AuthFieldProps) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="lp-auth-label">
        {label}
      </label>
      {children}
    </div>
  )
}

export function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <input {...props} type={visible ? "text" : "password"} className="lp-input pr-11" />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="lp-link absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-xl text-[var(--lp-muted)] transition-colors hover:text-white"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

export function AuthError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="lp-auth-error">
      {children}
    </p>
  )
}
