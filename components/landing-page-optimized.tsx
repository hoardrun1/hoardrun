"use client"

import type React from "react"
import { useState, useEffect, useRef, lazy, Suspense } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  PiggyBank,
  TrendingUp,
  Wallet,
  ArrowRightLeft,
  Menu,
  Building2,
  Users,
  Briefcase,
  CreditCard,
  Brain,
  ShieldCheck,
  HeadphonesIcon,
  User,
  ChevronDown,
  Zap,
  Shield,
  Globe,
} from "lucide-react"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useTranslation } from 'react-i18next'

// Lazy load heavy animation components (removed unused LazyMotionDiv)

// Lightweight animation alternative for critical elements
const SimpleCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl shadow-black/50 p-4 sm:p-6 border border-white/10 transition-transform duration-300 hover:scale-105 ${className}`}>
    {children}
  </div>
)

// Optimized background with reduced complexity
const OptimizedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-black">
        {/* Simplified gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      {/* Static grid pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px'
        }}
      />
    </div>
  )
}

// Loading skeleton for images
const ImageSkeleton = () => (
  <div className="w-full h-full bg-gray-800 animate-pulse rounded-xl" />
)

export function LandingPageOptimized() {
  const router = useRouter()
  const { t } = useTranslation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const aboutRef = useRef<HTMLElement>(null)
  const servicesRef = useRef<HTMLElement>(null)

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
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <div className="landing-page min-h-screen bg-black !text-white overflow-x-hidden" style={{ color: 'white' }}>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-black/90 backdrop-blur-lg shadow-2xl shadow-black/50 py-2 border-b border-white/10" : "bg-transparent py-3"}`}
      >
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <nav className="flex justify-between items-center">
            <button
              onClick={scrollToTop}
              className="text-base sm:text-lg md:text-xl font-bold cursor-pointer hover:opacity-80 transition-opacity"
            >
              <span className="text-white">Hoard</span>
              <span className="text-gray-400">run</span>
            </button>
            
            <div className="hidden md:flex space-x-6">
              <button
                onClick={() => scrollToSection(aboutRef)}
                className="text-white hover:text-white transition-colors duration-300 relative group text-sm"
              >
                {t("landing.nav.about")}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
              </button>
              <button
                onClick={() => scrollToSection(servicesRef)}
                className="text-white hover:text-white transition-colors duration-300 relative group text-sm"
              >
                {t("landing.nav.services")}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <LanguageSwitcher variant="mobile" className="mr-2" />
              <span className="text-white text-xs hidden sm:block">{t('settings.language')}</span>
              <Button
                variant="ghost"
                onClick={() => router.push('/signin')}
                className="text-white hover:text-white hover:bg-white/10 transition-all duration-300 text-sm px-3 py-1.5"
              >
                {t("landing.nav.logIn")}
              </Button>
              <Button
                onClick={() => router.push('/signup')}
                className="bg-black text-white hover:bg-gray-800 border border-white/20 transition-all duration-300 transform hover:scale-105 text-sm px-4 py-1.5"
              >
                {t("landing.nav.signUp")}
              </Button>
              <Button
                className="md:hidden"
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </nav>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-black/95 backdrop-blur-sm border-t border-white/10 py-4 animate-in slide-in-from-top duration-200">
              <div className="flex flex-col space-y-4 px-4">
                <button
                  onClick={() => scrollToSection(aboutRef)}
                  className="text-white hover:text-white transition-colors duration-300 text-left py-2"
                >
                  {t("landing.nav.about")}
                </button>
                <button
                  onClick={() => scrollToSection(servicesRef)}
                  className="text-white hover:text-white transition-colors duration-300 text-left py-2"
                >
                  {t("landing.nav.services")}
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main>
        <section className="relative pt-24 sm:pt-28 md:pt-32 lg:pt-24 pb-16 sm:pb-20 md:pb-24 overflow-hidden min-h-screen flex items-center">
          <OptimizedBackground />

          {/* Hero Background Image with Next.js Image optimization */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2132&q=80"
              alt="Abstract financial background"
              fill
              className="object-cover opacity-5"
              priority
              sizes="100vw"
              onLoad={() => setImagesLoaded(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80"></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
            <div className="max-w-7xl mx-auto">
              
              {/* Main Content */}
              <div className="text-center mb-16">
                <div className="mb-8 animate-in fade-in slide-in-from-bottom duration-1000">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <span className="block text-white mb-2 sm:mb-3">
                      {t("landing.hero.title1")}
                    </span>
                    <span className="block text-white">
                      {t("landing.hero.title2")}
                    </span>
                  </h1>

                  <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white max-w-2xl mx-auto leading-relaxed mb-4 sm:mb-6 md:mb-8 px-2 sm:px-4">
                    {t("landing.hero.subtitle")}
                  </p>

                  <div className="flex flex-row gap-2 sm:gap-3 md:gap-4 justify-center items-center relative z-20">
                    <Button
                      onClick={() => router.push('/signup')}
                      className="bg-black text-white hover:bg-gray-800 border border-white/20 text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-xl cursor-pointer relative z-10"
                    >
                      {t("landing.hero.getStarted")} →
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => scrollToSection(aboutRef)}
                      className="border-white/50 text-white hover:bg-white hover:text-black text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full transition-all duration-300 bg-black/20 cursor-pointer relative z-10"
                    >
                      {t("landing.hero.learnMore")}
                    </Button>
                  </div>
                </div>

                {/* Hero Image with lazy loading */}
                <div className="mb-12 sm:mb-16">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl max-w-4xl mx-auto">
                    {!imagesLoaded && <ImageSkeleton />}
                    <Image
                      src="https://images.unsplash.com/photo-1579621970795-87facc2f976d?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      alt="Modern banking dashboard interface"
                      width={1470}
                      height={400}
                      className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
                      <p className="text-white text-sm sm:text-base font-medium">{t("landing.hero.experienceFuture")}</p>
                    </div>
                  </div>
                </div>

                {/* Feature Cards - Simplified animations */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 mt-8 sm:mt-12 md:mt-16">
                  <SimpleCard className="text-center h-full">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
                    </div>
                    <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white mb-1 sm:mb-2 md:mb-3">{t("landing.features.lightningFast")}</h3>
                    <p className="text-white leading-tight sm:leading-relaxed text-xs sm:text-sm">
                      {t("landing.features.lightningFastDesc")}
                    </p>
                  </SimpleCard>

                  <SimpleCard className="text-center h-full">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
                    </div>
                    <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white mb-1 sm:mb-2 md:mb-3">{t("landing.features.bankLevelSecurity")}</h3>
                    <p className="text-white leading-tight sm:leading-relaxed text-xs sm:text-sm">
                      {t("landing.features.bankLevelSecurityDesc")}
                    </p>
                  </SimpleCard>

                  <SimpleCard className="text-center h-full">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                      <Globe className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
                    </div>
                    <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white mb-1 sm:mb-2 md:mb-3">{t("landing.features.globalAccess")}</h3>
                    <p className="text-white leading-tight sm:leading-relaxed text-xs sm:text-sm">
                      {t("landing.features.globalAccessDesc")}
                    </p>
                  </SimpleCard>
                </div>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-12 sm:mt-16">
                {[
                  { number: "1M+", label: t("landing.stats.activeUsers") },
                  { number: "$50B+", label: t("landing.stats.assetsUnderManagement") },
                  { number: "99.9%", label: t("landing.stats.uptimeGuarantee") },
                  { number: "150+", label: t("landing.stats.countriesSupported") },
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2">
                      {stat.number}
                    </div>
                    <div className="text-white text-xs sm:text-sm uppercase tracking-wide">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-6 h-6 text-white" />
          </div>
        </section>

        {/* {t("landing.nav.services")} Section */}
        <section
          ref={servicesRef}
          className="relative py-16 sm:py-20 bg-gradient-to-br from-gray-950 via-black to-gray-950 overflow-hidden"
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
          </div>
          <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-center text-white mb-8 sm:mb-10 md:mb-12">
              {t("landing.services.title")}
            </h2>

            {/* {t("landing.nav.services")} Hero Image */}
            <div className="mb-12 sm:mb-16">
              <div className="relative rounded-xl overflow-hidden shadow-xl max-w-3xl mx-auto">
                <Image
                  src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Professional banking services"
                  width={2070}
                  height={300}
                  className="w-full h-40 sm:h-48 md:h-56 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                {
                  title: t("landing.services.smartSavings"),
                  icon: PiggyBank,
                  description: t("landing.services.smartSavingsDesc"),
                },
                {
                  title: t("landing.services.intelligentInvesting"),
                  icon: TrendingUp,
                  description: t("landing.services.intelligentInvestingDesc"),
                },
                {
                  title: t("landing.services.secureDeposits"),
                  icon: Wallet,
                  description: t("landing.services.secureDepositsDesc"),
                },
                {
                  title: t("landing.services.instantTransfers"),
                  icon: ArrowRightLeft,
                  description: t("landing.services.instantTransfersDesc"),
                },
              ].map((feature, index) => (
                <Card key={index} className="bg-white/5 border border-white/10 shadow-xl hover:shadow-white/10 transition-all duration-300 overflow-hidden group backdrop-blur-sm h-full">
                  <CardContent className="p-4 sm:p-6 relative h-full flex flex-col">
                    <div className="absolute top-0 left-0 w-full h-1 bg-white transform -translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white mb-4" />
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-2 sm:mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-white leading-relaxed flex-grow text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* {t("landing.nav.about")} Section */}
        <section
          ref={aboutRef}
          className="relative py-16 sm:py-20 bg-gradient-to-br from-gray-950 via-black to-gray-950 overflow-hidden"
        >
          <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-center text-white mb-8 sm:mb-10 md:mb-12">
              {t("landing.about.title")}
            </h2>

            <div className="mb-12 sm:mb-16">
              <div className="relative rounded-xl overflow-hidden shadow-xl max-w-2xl mx-auto">
                <Image
                  src="https://images.unsplash.com/photo-1494888427482-242d32babc0b?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Modern office team collaboration"
                  width={1470}
                  height={300}
                  className="w-full h-40 sm:h-48 md:h-56 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div>
                <p className="text-sm sm:text-base text-white mb-4 sm:mb-6 leading-relaxed">
                  {t("landing.about.description1")}
                </p>
                <p className="text-sm sm:text-base text-white leading-relaxed">
                  {t("landing.about.description2")}
                </p>
              </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { icon: Building2, title: t("landing.about.corporateServices") },
                  { icon: Users, title: t("landing.about.individualBanking") },
                  { icon: Briefcase, title: t("landing.about.investmentOpportunities") },
                  { icon: CreditCard, title: t("landing.about.smartDebitCards") },
                  { icon: Brain, title: t("landing.about.aiPoweredInsights") },
                  { icon: ShieldCheck, title: t("landing.about.advancedSecurity") },
                ].map((item, index) => (
                  <Card key={index} className="bg-white/5 border border-white/10 shadow-lg hover:shadow-white/10 transition-all duration-300 group">
                    <CardContent className="p-3 sm:p-4 flex flex-col items-center text-center">
                      <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white mb-2 sm:mb-3" />
                      <h3 className="font-semibold text-white text-xs sm:text-sm">
                        {item.title}
                      </h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-950 text-white py-12 sm:py-16 border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <h3 className="text-sm sm:text-base font-semibold mb-4 sm:mb-6">{t("landing.footer.company")}</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <button
                    onClick={() => scrollToSection(aboutRef)}
                    className="text-white hover:text-white transition-colors duration-300 text-xs sm:text-sm"
                  >
                    {t("landing.footer.aboutUs")}
                  </button>
                </li>
                <li>
                  <a href="#" className="text-white hover:text-white transition-colors duration-300 text-xs sm:text-sm">
                    {t("landing.footer.careers")}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold mb-4 sm:mb-6">{t("landing.footer.product")}</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <button
                    onClick={() => scrollToSection(servicesRef)}
                    className="text-white hover:text-white transition-colors duration-300 text-xs sm:text-sm"
                  >
                    {t("landing.footer.features")}
                  </button>
                </li>
                <li>
                  <a href="#" className="text-white hover:text-white transition-colors duration-300 text-xs sm:text-sm">
                    {t("landing.footer.pricing")}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold mb-4 sm:mb-6">{t("landing.footer.resources")}</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <a href="#" className="text-white hover:text-white transition-colors duration-300 text-xs sm:text-sm">
                    {t("landing.footer.blog")}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white hover:text-white transition-colors duration-300 text-xs sm:text-sm">
                    {t("landing.footer.helpCenter")}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold mb-4 sm:mb-6">{t("landing.footer.legal")}</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <a href="#" className="text-white hover:text-white transition-colors duration-300 text-xs sm:text-sm">
                    {t("landing.footer.privacyPolicy")}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white hover:text-white transition-colors duration-300 text-xs sm:text-sm">
                    {t("landing.footer.termsOfService")}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center">
            <button
              onClick={scrollToTop}
              className="text-base sm:text-lg md:text-xl font-bold cursor-pointer hover:opacity-80 transition-opacity duration-300 mb-4 sm:mb-0"
            >
              <span className="text-white">Hoard</span>
              <span className="text-gray-400">run</span>
            </button>
            <p className="text-white text-center sm:text-right text-xs sm:text-sm">
              {t("landing.footer.copyright")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
