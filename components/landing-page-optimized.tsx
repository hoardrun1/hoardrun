"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Inter } from "next/font/google"
import { motion, MotionConfig } from "framer-motion"
import { ArrowRight, Brain, Briefcase, Building2, CreditCard, Info, LayoutGrid, LogIn, Menu, ShieldCheck, Users, X } from "lucide-react"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useTranslation } from "react-i18next"
import { LiquidCanvas } from "./landing/liquid-canvas"
import { ProductStage } from "./landing/product-stage"
import {
  DepositsGraphic,
  DottedGlobe,
  InvestingGraphic,
  LogoMark,
  PulseLine,
  SavingsGraphic,
  SecurityGraphic,
  SpeedGraphic,
  TransfersGraphic,
} from "./landing/graphics"
import "./landing/landing.css"

const sans = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"], display: "swap" })

const Reveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
  children,
  className = "",
  delay = 0,
}) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.8, delay, ease: [0.2, 0.7, 0.2, 1] }}
  >
    {children}
  </motion.div>
)

export function LandingPageOptimized() {
  const { t } = useTranslation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const aboutRef = useRef<HTMLElement>(null)
  const servicesRef = useRef<HTMLElement>(null)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [hoveredSection, setHoveredSection] = useState<string | null>(null)

  // Tracks the section in the middle of the screen, for the nav's glass lens.
  useEffect(() => {
    const sections = [
      { id: "about", element: aboutRef.current },
      { id: "services", element: servicesRef.current },
    ]
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = sections.find((section) => section.element === entry.target)?.id ?? null
          setActiveSection((current) => (entry.isIntersecting ? id : current === id ? null : current))
        })
      },
      { rootMargin: "-45% 0px -50% 0px" }
    )
    sections.forEach((section) => section.element && observer.observe(section.element))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    // Throttle scroll events for better performance
    let ticking = false
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", throttledScroll, { passive: true })
    return () => window.removeEventListener("scroll", throttledScroll)
  }, [])

  const scrollToSection = (elementRef: React.RefObject<HTMLElement>) => {
    if (elementRef.current) {
      setIsMobileMenuOpen(false)
      elementRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const stats = [
    // Facts about the product, never invented user or asset figures
    { number: "$1", label: t("landing.stats.activeUsers") },
    { number: "$0", label: t("landing.stats.assetsUnderManagement") },
    { number: "24/7", label: t("landing.stats.uptimeGuarantee") },
    { number: "2 min", label: t("landing.stats.countriesSupported") },
  ]

  const capabilities = [
    { icon: Building2, title: t("landing.about.corporateServices") },
    { icon: Users, title: t("landing.about.individualBanking") },
    { icon: Briefcase, title: t("landing.about.investmentOpportunities") },
    { icon: CreditCard, title: t("landing.about.smartDebitCards") },
    { icon: Brain, title: t("landing.about.aiPoweredInsights") },
    { icon: ShieldCheck, title: t("landing.about.advancedSecurity") },
  ]

  const navLinks = [
    { id: "about", label: t("landing.nav.about"), ref: aboutRef, icon: Info },
    { id: "services", label: t("landing.nav.services"), ref: servicesRef, icon: LayoutGrid },
  ]
  const lensSection = hoveredSection ?? activeSection

  const footerLinkClass =
    "lp-link rounded text-sm text-[var(--lp-muted)] transition-colors duration-200 hover:text-[var(--lp-mint)]"

  const footerColumns: { title: string; links: { label: string; onClick?: () => void }[] }[] = [
    {
      title: t("landing.footer.company"),
      links: [
        { label: t("landing.footer.aboutUs"), onClick: () => scrollToSection(aboutRef) },
        { label: t("landing.footer.careers") },
      ],
    },
    {
      title: t("landing.footer.product"),
      links: [
        { label: t("landing.footer.features"), onClick: () => scrollToSection(servicesRef) },
        { label: t("landing.footer.pricing") },
      ],
    },
    {
      title: t("landing.footer.resources"),
      links: [{ label: t("landing.footer.blog") }, { label: t("landing.footer.helpCenter") }],
    },
    {
      title: t("landing.footer.legal"),
      links: [{ label: t("landing.footer.privacyPolicy") }, { label: t("landing.footer.termsOfService") }],
    },
  ]

  return (
    <MotionConfig reducedMotion="user">
      <div className={`landing-page lp min-h-screen overflow-x-clip ${sans.className}`}>
        <header className="fixed inset-x-0 top-3 z-50 px-3 sm:top-5 sm:px-6">
          <nav
            className={`lp-nav mx-auto flex max-w-6xl items-center justify-between rounded-full py-2 pl-4 pr-2 text-white transition-shadow duration-300 md:grid md:grid-cols-[1fr_auto_1fr] ${isScrolled ? "shadow-[0_12px_40px_-8px_rgba(0,0,0,0.55)]" : ""}`}
          >
            <button
              onClick={scrollToTop}
              className="lp-link flex items-center gap-2.5 justify-self-start rounded transition-opacity hover:opacity-70"
              aria-label="Hoardrun"
            >
              <LogoMark className="h-8" />
              <span className="text-lg">Hoardrun</span>
            </button>

            <div className="lp-glass hidden items-center gap-1 rounded-full p-1 md:flex" onMouseLeave={() => setHoveredSection(null)}>
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.ref)}
                  onMouseEnter={() => setHoveredSection(link.id)}
                  onFocus={() => setHoveredSection(link.id)}
                  onBlur={() => setHoveredSection(null)}
                  aria-current={activeSection === link.id ? "true" : undefined}
                  className={`lp-link relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${lensSection === link.id ? "text-white" : "text-[var(--material-text)]"}`}
                >
                  {lensSection === link.id && (
                    <motion.span
                      layoutId="lp-nav-lens"
                      className="lp-glass-lens absolute inset-0 rounded-full"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <link.icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                    {link.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 justify-self-end sm:gap-2">
              <LanguageSwitcher variant="mobile" className="lp-lang" />
              <Link href="/signin" className="lp-link hidden rounded px-3 text-sm transition-opacity hover:opacity-60 sm:block">
                {t("landing.nav.logIn")}
              </Link>
              <Link href="/signup" className="lp-btn lp-btn-primary !px-5 !py-2.5 !text-sm">
                {t("landing.nav.signUp")}
              </Link>
              <button
                className="lp-link flex h-10 w-10 items-center justify-center rounded-full md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </nav>

          {isMobileMenuOpen && (
            <div className="lp-glass mx-auto mt-2 flex max-w-6xl flex-col gap-1 rounded-3xl p-3 md:hidden">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.ref)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-left font-medium hover:bg-black/5"
                >
                  <link.icon className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
                  {link.label}
                </button>
              ))}
              <Link href="/signin" className="flex items-center gap-3 rounded-xl px-3 py-3 font-medium hover:bg-black/5 sm:hidden">
                <LogIn className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
                {t("landing.nav.logIn")}
              </Link>
            </div>
          )}
        </header>

        <main>
          {/* Hero */}
          <section className="relative flex min-h-[100svh] items-center overflow-hidden pb-14 pt-28 lg:pb-10 lg:pt-24">
            <LiquidCanvas />
            <div aria-hidden="true" className="lp-eclipse lp-eclipse-hero" />
            <PulseLine className="pointer-events-none absolute inset-x-0 bottom-[3%] h-[46%] w-full" />

            <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-8 px-5 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-4">
              <div className="text-center lg:text-left">
                <h1 className={`lp-display lp-rise text-[clamp(3.25rem,6.8vw,6.25rem)] leading-[1.02]`}>
                  <span className="block">{t("landing.hero.title1")}</span>
                  <span className="block">{t("landing.hero.title2")}</span>
                </h1>
                <p
                  className="lp-rise mx-auto mt-7 max-w-xl text-lg font-light leading-relaxed text-[#dce9e5] sm:text-xl lg:mx-0"
                  style={{ animationDelay: "0.15s", textWrap: "pretty" }}
                >
                  {t("landing.hero.subtitle")}
                </p>
                <div
                  className="lp-rise mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
                  style={{ animationDelay: "0.3s" }}
                >
                  <Link href="/signup" className="lp-btn lp-btn-primary">
                    {t("landing.hero.getStarted")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button onClick={() => scrollToSection(aboutRef)} className="lp-btn lp-btn-ghost">
                    {t("landing.hero.learnMore")}
                  </button>
                </div>
              </div>

              <div className="lp-rise" style={{ animationDelay: "0.2s" }}>
                <ProductStage />
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="relative z-10 border-y border-[var(--lp-jade)] bg-[var(--lp-canvas)]">
            <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <Reveal
                  key={stat.label}
                  delay={index * 0.08}
                  className={`px-5 py-10 sm:px-8 lg:py-14 ${index % 2 === 1 ? "border-l border-[var(--lp-jade)]" : ""} ${index === 2 ? "lg:border-l" : ""} ${index > 1 ? "border-t border-[var(--lp-jade)] lg:border-t-0" : ""}`}
                >
                  <div className={"lp-display text-[clamp(2.5rem,4.6vw,4.25rem)] leading-none tabular-nums"}>{stat.number}</div>
                  <div className="mt-3 text-sm text-[var(--lp-muted)]">{stat.label}</div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* Features */}
          <section className="bg-[var(--lp-ivory)] py-20 text-[var(--lp-ink)] sm:py-28">
            <div className="mx-auto grid max-w-7xl gap-4 px-5 sm:px-8 lg:grid-cols-12 lg:gap-5">
              <Reveal className="lg:col-span-7 lg:row-span-2">
                <article className="relative flex h-full min-h-[560px] flex-col overflow-hidden rounded-[28px] lp-panel-lit text-white">
                  <div className="relative z-10 max-w-lg p-7 sm:p-10">
                    <h2 className={`lp-display text-[clamp(2.25rem,4vw,3.5rem)] leading-[1.05]`}>
                      {t("landing.features.globalAccess")}
                    </h2>
                    <p className="mt-4 font-light leading-relaxed text-[var(--lp-muted)]">{t("landing.features.globalAccessDesc")}</p>
                  </div>
                  <div className="relative mt-auto -mb-[22%] flex justify-center px-4">
                    <DottedGlobe className="max-w-[640px]" />
                  </div>
                </article>
              </Reveal>

              <Reveal className="lg:col-span-5" delay={0.1}>
                <article className="flex h-full flex-col rounded-[28px] bg-white p-7 sm:p-8">
                  <h2 className={`lp-display text-[clamp(1.6rem,2.5vw,2.2rem)] leading-[1.1]`}>
                    {t("landing.features.lightningFast")}
                  </h2>
                  <p className="mt-3 font-light leading-relaxed text-[var(--lp-ink-muted)]">{t("landing.features.lightningFastDesc")}</p>
                  <div className="mt-5 h-44">
                    <SpeedGraphic />
                  </div>
                </article>
              </Reveal>

              <Reveal className="lg:col-span-5" delay={0.2}>
                <article className="relative grid h-full overflow-hidden rounded-[28px] lp-panel-lit p-7 text-white sm:grid-cols-[1fr_190px] sm:items-center sm:gap-2 sm:p-8">
                  <div>
                    <h2 className={`lp-display text-[clamp(1.6rem,2.5vw,2.2rem)] leading-[1.1]`}>
                      {t("landing.features.bankLevelSecurity")}
                    </h2>
                    <p className="mt-3 font-light leading-relaxed text-[var(--lp-muted)]">{t("landing.features.bankLevelSecurityDesc")}</p>
                  </div>
                  <div className="mx-auto mt-4 h-48 w-48 sm:mt-0">
                    <SecurityGraphic />
                  </div>
                </article>
              </Reveal>
            </div>
          </section>

          {/* Services */}
          <section ref={servicesRef} className="scroll-mt-20 bg-[var(--lp-canvas)] py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
              <Reveal>
                <h2 className={`lp-display mb-12 text-[clamp(2.75rem,6vw,5.5rem)] leading-[1.02] sm:mb-16`}>
                  {t("landing.services.title")}
                </h2>
              </Reveal>

              <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
                {[
                  { span: "lg:col-span-7", graphic: <SavingsGraphic />, title: t("landing.services.smartSavings"), desc: t("landing.services.smartSavingsDesc") },
                  { span: "lg:col-span-5", graphic: <InvestingGraphic />, title: t("landing.services.intelligentInvesting"), desc: t("landing.services.intelligentInvestingDesc") },
                  { span: "lg:col-span-5", graphic: <DepositsGraphic />, title: t("landing.services.secureDeposits"), desc: t("landing.services.secureDepositsDesc") },
                  { span: "lg:col-span-7", graphic: <TransfersGraphic />, title: t("landing.services.instantTransfers"), desc: t("landing.services.instantTransfersDesc") },
                ].map((service, index) => (
                  <Reveal key={service.title} className={service.span} delay={index % 2 ? 0.1 : 0}>
                    <article className="flex h-full flex-col overflow-hidden rounded-[28px] lp-panel-lit transition-colors duration-300 hover:border-white/25">
                      <div className="h-60 px-7 pt-8 sm:h-72 sm:px-9">{service.graphic}</div>
                      <div className="p-7 sm:p-9">
                        <h3 className={`lp-display text-[clamp(1.6rem,2.5vw,2.2rem)] leading-[1.1]`}>{service.title}</h3>
                        <p className="mt-3 max-w-xl font-light leading-relaxed text-[var(--lp-muted)]">{service.desc}</p>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* About */}
          <section ref={aboutRef} className="scroll-mt-20 bg-[var(--lp-ivory)] py-20 text-[var(--lp-ink)] sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
              <Reveal>
                <p className="mb-8 flex items-center gap-3 text-sm text-[var(--lp-ink-muted)]">
                  <span className="flex h-9 items-center rounded-full bg-[var(--lp-emerald)] px-3">
                    <LogoMark className="h-6" />
                  </span>
                  {t("landing.about.title")}
                </p>
                <p className={"lp-display max-w-5xl text-[clamp(1.8rem,3.5vw,3.25rem)] leading-[1.14]"} style={{ textWrap: "pretty" }}>
                  {t("landing.about.description1")}
                </p>
              </Reveal>

              <div className="mt-14 grid gap-10 lg:grid-cols-12">
                <Reveal className="lg:col-span-4">
                  <p className="font-light leading-relaxed text-[var(--lp-ink-muted)]" style={{ textWrap: "pretty" }}>
                    {t("landing.about.description2")}
                  </p>
                </Reveal>
                <Reveal className="lg:col-span-7 lg:col-start-6" delay={0.1}>
                  <ul className="grid grid-cols-1 border-t border-[var(--lp-line)] sm:grid-cols-2">
                    {capabilities.map((item) => (
                      <li key={item.title} className="flex items-center gap-4 border-b border-[var(--lp-line)] py-5 sm:pr-6">
                        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[var(--lp-emerald)] text-[var(--lp-mint)]">
                          <item.icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
                        </span>
                        <span>{item.title}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>
            </div>
          </section>

          {/* Closing call to action */}
          <section className="relative flex min-h-[640px] items-center justify-center overflow-hidden px-5 py-24 text-center">
            <LiquidCanvas pool={[0.5, -0.12]} />
            <div aria-hidden="true" className="lp-eclipse lp-eclipse-cta" />
            <Reveal className="relative z-10">
              <h2 className={`lp-display mx-auto max-w-5xl text-[clamp(2.75rem,6.6vw,6rem)] leading-[1.04]`}>
                {t("landing.hero.experienceFuture")}
              </h2>
              <Link href="/signup" className="lp-btn lp-btn-primary mt-10">
                {t("landing.hero.getStarted")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </section>
        </main>

        <footer className="overflow-hidden bg-[var(--lp-canvas)] pt-16 sm:pt-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
              {footerColumns.map((column) => (
                <div key={column.title}>
                  <h3 className="mb-5 text-sm text-white">{column.title}</h3>
                  <ul className="space-y-3">
                    {column.links.map((link) => (
                      <li key={link.label}>
                        {link.onClick ? (
                          <button onClick={link.onClick} className={footerLinkClass}>
                            {link.label}
                          </button>
                        ) : (
                          <a href="#" className={footerLinkClass}>
                            {link.label}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-14 border-t border-[var(--lp-jade)] pt-6 text-xs text-[var(--lp-muted)]">{t("landing.footer.copyright")}</p>
            <p className="mt-2 text-xs text-[var(--lp-muted)]">{t("landing.footer.disclosure")}</p>
          </div>
          <button
            onClick={scrollToTop}
            aria-label="Hoardrun"
            className={"lp-display block w-full select-none text-center text-[19vw] leading-[0.9] text-[#161617] transition-colors duration-500 hover:text-[#2c2c2e]"}
          >
            Hoardrun
          </button>
        </footer>
      </div>
    </MotionConfig>
  )
}
