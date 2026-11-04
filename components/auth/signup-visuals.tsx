"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Check } from "lucide-react"
import { useTranslation } from "react-i18next"
import { SecurityGraphic } from "@/components/landing/graphics"
import { DebitCard } from "@/components/landing/product-stage"
import { countries } from "@/lib/countries"

export type SignupFormValues = {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  country: string
  idNumber: string
  bio: string
  password: string
  confirmPassword: string
  termsAccepted: boolean
}

export const passwordChecks = (password: string, confirm: string) => [
  { key: "length", label: "At least 8 characters", met: password.length >= 8 },
  { key: "case", label: "Upper and lowercase letters", met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
  { key: "number", label: "A number or symbol", met: /[\d\W_]/.test(password) },
  { key: "match", label: "Passwords match", met: password.length > 0 && password === confirm },
]

const fullName = (form: SignupFormValues) => `${form.firstName} ${form.lastName}`.trim()

function AccountScene({ form }: { form: SignupFormValues }) {
  return (
    <div style={{ perspective: 1400 }}>
      <div className="lp-float-a" style={{ transform: "rotateX(10deg) rotateY(-14deg) rotateZ(-5deg) scale(1.22)" }}>
        <DebitCard name={fullName(form)} showBrand={false} />
      </div>
    </div>
  )
}

function ProfileScene({ form }: { form: SignupFormValues }) {
  const { t } = useTranslation()
  const country = countries.find((item) => item.code === form.country)?.name
  const rows = [
    { label: t("signup.fields.phone"), value: form.phone },
    { label: t("signup.fields.dateOfBirth"), value: form.dateOfBirth },
    { label: t("signup.fields.country"), value: country },
    // The ID number is never shown here, only whether it has been added.
    { label: t("signup.fields.idNumber"), value: form.idNumber ? "••••••" : "" },
  ]
  const completed = rows.filter((row) => row.value).length + (form.bio ? 1 : 0)
  const progress = completed / 5
  const circumference = 2 * Math.PI * 26
  const initials = `${form.firstName[0] ?? ""}${form.lastName[0] ?? ""}`.toUpperCase()

  return (
    <div className="lp-glass w-[400px] max-w-[85%] rounded-[28px] p-7">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 flex-none">
          <svg viewBox="0 0 60 60" className="h-full w-full -rotate-90" aria-hidden="true">
            <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="3" />
            <circle
              cx="30"
              cy="30"
              r="26"
              fill="none"
              stroke="#111113"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              style={{ transition: "stroke-dashoffset 0.4s ease" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold">{initials}</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-xl font-semibold tracking-tight">{fullName(form)}</p>
          <p className="truncate text-sm font-light text-[var(--lp-muted)]">{form.email}</p>
        </div>
      </div>
      <dl className="mt-6">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 border-t border-black/10 py-3 text-sm">
            <dt className="truncate text-[var(--lp-muted)]">{row.label}</dt>
            <dd className="truncate font-medium">{row.value || "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function SecurityScene({ form }: { form: SignupFormValues }) {
  const checks = passwordChecks(form.password, form.confirmPassword)
  return (
    <div className="flex w-[400px] max-w-[85%] flex-col items-center">
      <div className="h-[300px] w-[300px]">
        <SecurityGraphic />
      </div>
      <ul className="lp-glass mt-5 w-full rounded-[28px] px-6 py-3">
        {checks.map((check) => (
          <li key={check.key} className={`flex items-center gap-3 py-1.5 text-sm transition-colors ${check.met ? "text-[var(--material-text)]" : "text-[var(--lp-muted)]"}`}>
            <span className={`flex h-5 w-5 flex-none items-center justify-center rounded-full border transition-colors ${check.met ? "border-black bg-black text-white" : "border-black/20"}`}>
              {check.met && <Check className="h-3 w-3" strokeWidth={3} />}
            </span>
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** The stage beside the form, which reflects what the user has entered so far. */
export function SignupVisual({ step, form }: { step: number; form: SignupFormValues }) {
  return (
    <div className="flex h-full items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="lp-auth-art flex w-full justify-center"
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -14, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
        >
          {step === 1 && <AccountScene form={form} />}
          {step === 2 && <ProfileScene form={form} />}
          {step === 3 && <SecurityScene form={form} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
