"use client"

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, Sparkles } from "lucide-react"
import { LogoMark } from "@/components/landing/graphics"
import { BarsGraphic, GemGraphic, TargetGraphic, VaultGraphic } from "@/components/app/home-graphics"

const WELCOME_KEY = "hr-auth-welcome"
// Runs before paint in the browser, so a returning visitor never sees a flash of the welcome
const useBeforePaint = typeof window === "undefined" ? useEffect : useLayoutEffect
const STORY_MS = 5200

/** Whether phones open on the welcome stories: once per visit, never on large screens or with reduced motion. */
export function useWelcome() {
  const [show, setShow] = useState(true)
  // Decided once per mount: in development React runs effects twice, and the second run must not count as a repeat visit
  const decided = useRef<boolean | null>(null)

  useBeforePaint(() => {
    if (decided.current === null) {
      let seen = false
      try {
        seen = sessionStorage.getItem(WELCOME_KEY) === "1"
        sessionStorage.setItem(WELCOME_KEY, "1")
      } catch {
        seen = true
      }
      decided.current = !(seen || window.innerWidth >= 1024)
    }
    if (!decided.current) setShow(false)
  }, [])

  return [show, setShow] as const
}

/* Story art: code-drawn, one per slide */

function CoinArt() {
  return (
    <div className="lp-story-coin-stage">
      <div className="lp-story-warp" aria-hidden="true" />
      <div className="lp-story-coin">
        <div className="lp-story-coin-face">
          <LogoMark className="h-12" />
        </div>
      </div>
    </div>
  )
}

function CardsArt() {
  return (
    <div className="lp-story-cards">
      <div className="lp-story-card" data-tone="blue">
        <span className="lp-story-card-brand">Hoardrun</span>
        <span className="lp-story-card-tag">VIRTUAL</span>
        <span className="lp-story-card-chip" />
      </div>
      <div className="lp-story-card" data-tone="coral">
        <span className="lp-story-card-brand">Hoardrun</span>
        <span className="lp-story-card-tag">INSTANT SEND</span>
        <span className="lp-story-card-number">•••• 2048</span>
      </div>
    </div>
  )
}

function SaveArt() {
  return (
    <div className="lp-story-save">
      <svg viewBox="0 0 200 200" className="lp-story-ring" aria-hidden="true">
        <circle cx="100" cy="100" r="84" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="16" />
        <circle cx="100" cy="100" r="84" fill="none" stroke="url(#lp-save-grad)" strokeWidth="16" strokeLinecap="round" strokeDasharray="380 528" transform="rotate(-90 100 100)" className="lp-story-ring-arc" />
        <defs>
          <linearGradient id="lp-save-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6ee7b7" />
            <stop offset="1" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      <VaultGraphic tone="mint" className="lp-story-save-vault" />
      <TargetGraphic tone="amber" className="lp-story-save-target" />
    </div>
  )
}

function InvestArt() {
  return (
    <div className="lp-story-invest">
      <BarsGraphic tone="sky" className="lp-story-invest-bars" />
      <GemGraphic tone="violet" className="lp-story-invest-gem" />
      <span className="lp-story-pill" style={{ top: "14%", left: "6%" }}>Crypto</span>
      <span className="lp-story-pill" style={{ top: "6%", right: "8%" }}>ETFs</span>
      <span className="lp-story-pill" style={{ bottom: "12%", left: "10%" }}>Circles</span>
      <span className="lp-story-pill" style={{ bottom: "20%", right: "4%" }}>Venture funds</span>
    </div>
  )
}

function AiArt() {
  return (
    <div className="lp-story-ai">
      <div className="lp-story-ai-orb"><Sparkles className="h-10 w-10" strokeWidth={1.8} /></div>
      <p className="lp-story-bubble" data-side="user">How long until my laptop fund is full?</p>
      <p className="lp-story-bubble" data-side="ai">At $150 a month, about four months. Want me to show you auto-save?</p>
    </div>
  )
}

type Story = { headline: string; sub?: string; theme: "dark" | "light"; art: ReactNode; glow: string }

const STORIES: Story[] = [
  { headline: "Ready to grow what you hoard?", theme: "dark", art: <CoinArt />, glow: "47 107 255" },
  { headline: "Spend and send in seconds", sub: "Virtual cards and instant sends to anyone on Hoardrun.", theme: "light", art: <CardsArt />, glow: "47 107 255" },
  { headline: "Save for what matters", sub: "Goals, fixed deposits and auto-save that runs itself.", theme: "dark", art: <SaveArt />, glow: "16 185 129" },
  { headline: "Invest your way", sub: "Crypto, ETFs, venture funds, or a Circle with friends.", theme: "dark", art: <InvestArt />, glow: "56 189 248" },
  { headline: "Money help, any time", sub: "Hoardrun AI knows the app and your own numbers.", theme: "dark", art: <AiArt />, glow: "90 169 255" },
]

/** Revolut-style welcome for phones: full-screen stories with progress bars, then Log in or Sign up. */
export function AuthWelcome({ onDone }: { onDone: () => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const [index, setIndex] = useState(0)
  const story = STORIES[index]

  const next = () => setIndex((i) => (i + 1) % STORIES.length)
  const prev = () => setIndex((i) => Math.max(0, i - 1))
  const go = (path: string) => {
    onDone()
    if (pathname !== path) router.push(path)
  }

  return (
    <motion.div
      className="lp-welcome lg:hidden"
      data-theme={story.theme}
      style={{ ["--glow" as string]: story.glow }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.35 }}
      role="dialog"
      aria-label="Welcome to Hoardrun"
    >
      <div className="lp-welcome-bg" aria-hidden="true" />

      {/* Story progress: done bars full, the current one fills, then the next story starts */}
      <div className="lp-welcome-bars">
        {STORIES.map((s, i) => (
          <span key={s.headline} className="lp-welcome-bar">
            <span
              key={i === index ? `run-${index}` : `idle-${i}`}
              className="lp-welcome-bar-fill"
              data-state={i < index ? "done" : i === index ? "run" : "todo"}
              style={{ animationDuration: `${STORY_MS}ms` }}
              onAnimationEnd={i === index ? next : undefined}
            />
          </span>
        ))}
      </div>

      <div className="lp-welcome-brand">
        <LogoMark className="lp-welcome-logo h-5" />
        <span>Welcome to Hoardrun</span>
      </div>

      {/* Tap the left third to go back, anywhere else to go forward */}
      <button type="button" className="lp-welcome-tap" style={{ left: 0, width: "33%" }} onClick={prev} aria-label="Previous story" />
      <button type="button" className="lp-welcome-tap" style={{ right: 0, width: "67%" }} onClick={next} aria-label="Next story" />

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="lp-welcome-story"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
        >
          <h1 className="lp-welcome-headline">{story.headline}</h1>
          {story.sub && <p className="lp-welcome-sub">{story.sub}</p>}
          <div className="lp-welcome-art">{story.art}</div>
        </motion.div>
      </AnimatePresence>

      <div className="lp-welcome-actions">
        <button type="button" onClick={() => go("/signin")} className="lp-welcome-btn" data-kind="login">Log in</button>
        <button type="button" onClick={() => go("/signup")} className="lp-welcome-btn" data-kind="signup">Sign up</button>
      </div>
    </motion.div>
  )
}

/** Phone top row over the form: back to the welcome stories, and the logo. */
export function AuthTopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="lp-auth-topbar lg:hidden">
      <button type="button" onClick={onBack} aria-label="Back" className="lp-auth-back">
        <ArrowLeft className="h-5 w-5" strokeWidth={2.2} />
      </button>
      <LogoMark className="h-5 w-auto opacity-90" />
    </div>
  )
}
