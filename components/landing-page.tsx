"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, useScroll, useTransform } from "framer-motion"
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

const FloatingCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <motion.div
    className={`bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl shadow-black/50 p-4 sm:p-6 border border-white/10 ${className}`}
    initial={{ y: 30, opacity: 0, scale: 0.95 }}
    animate={{ y: 0, opacity: 1, scale: 1 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    whileHover={{ y: -10, scale: 1.03 }}
  >
    {children}
  </motion.div>
)

const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Main background */}
      <div className="absolute inset-0 bg-black">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/3 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        {/* Floating particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
      
      {/* Grid pattern overlay */}
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

export function LandingPageComponent() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const aboutRef = useRef(null)
  const servicesRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (elementRef: React.RefObject<HTMLElement>) => {
    console.log('scrollToSection called', elementRef);

    if (elementRef.current) {
      console.log('Element found, scrolling...');

      // Close mobile menu if open
      setIsMobileMenuOpen(false);

      // Use scrollIntoView for better compatibility
      elementRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    } else {
      console.warn('Element ref is null, cannot scroll to section');
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? "bg-black/90 backdrop-blur-lg shadow-2xl shadow-black/50 py-2 border-b border-white/10" : "bg-transparent py-3"}`}
      >
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <nav className="flex justify-between items-center">
            <motion.button
              onClick={scrollToTop}
              className="text-base sm:text-lg md:text-xl font-bold cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-white">Hoard</span>
              <span className="text-gray-400">run</span>
            </motion.button>
            <div className="hidden md:flex space-x-6">
              <motion.button
                onClick={() => scrollToSection(aboutRef)}
                className="text-gray-300 hover:text-white transition-all duration-300 relative group text-sm"
                whileHover={{ y: -2 }}
              >
                About
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
              </motion.button>
              <motion.button
                onClick={() => scrollToSection(servicesRef)}
                className="text-gray-300 hover:text-white transition-all duration-300 relative group text-sm"
                whileHover={{ y: -2 }}
              >
                Services
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
              </motion.button>

            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={() => router.push('/signin')}
                className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 text-sm px-3 py-1.5"
              >
                Log In
              </Button>
              <Button
                onClick={() => router.push('/signup')}
                className="bg-white text-black hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 text-sm px-4 py-1.5"
              >
                Sign up
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
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden bg-black/95 backdrop-blur-sm border-t border-white/10 py-4"
            >
              <div className="flex flex-col space-y-4 px-4">
                <button
                  onClick={() => {
                    scrollToSection(aboutRef)
                    setIsMobileMenuOpen(false)
                  }}
                  className="text-gray-300 hover:text-white transition-all duration-300 text-left py-2"
                >
                  About
                </button>
                <button
                  onClick={() => {
                    scrollToSection(servicesRef)
                    setIsMobileMenuOpen(false)
                  }}
                  className="text-gray-300 hover:text-white transition-all duration-300 text-left py-2"
                >
                  Services
                </button>
                <div className="flex space-x-3 pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      router.push('/signin')
                      setIsMobileMenuOpen(false)
                    }}
                    className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 text-sm px-3 py-1.5"
                  >
                    Log In
                  </Button>
                  <Button
                    onClick={() => {
                      router.push('/signup')
                      setIsMobileMenuOpen(false)
                    }}
                    className="bg-white text-black hover:bg-gray-200 transition-all duration-300 text-sm px-4 py-1.5"
                  >
                    Sign up
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      <main>
        <section className="relative pt-24 sm:pt-28 md:pt-32 lg:pt-24 pb-16 sm:pb-20 md:pb-24 overflow-hidden min-h-screen flex items-center">
          <AnimatedBackground />

          {/* Hero Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2132&q=80"
              alt="Abstract financial background"
              className="w-full h-full object-cover opacity-5"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80"></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
            <div className="max-w-7xl mx-auto">
              
              {/* Main Content */}
              <div className="text-center mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="mb-8"
                >
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    <span className="block text-white mb-2 sm:mb-3">
                      Banking
                    </span>
                    <span className="block bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-300 to-white">
                      Reimagined
                    </span>
                  </h1>
                  
                  <motion.p
                    className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed mb-4 sm:mb-6 md:mb-8 px-2 sm:px-4"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    Experience seamless financial management with cutting-edge security and user-centric design for the digital age.
                  </motion.p>
                  
                  <motion.div
                    className="flex flex-row gap-2 sm:gap-3 md:gap-4 justify-center items-center relative z-20"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  >
                    <Button
                      onClick={() => {
                        console.log('Get Started clicked, scrolling to services');
                        scrollToSection(servicesRef);
                      }}
                      className="bg-white text-black hover:bg-gray-200 text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full transition-all duration-500 transform hover:scale-110 shadow-xl cursor-pointer relative z-10"
                    >
                      Get Started
                      <motion.div
                        className="ml-2"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                      >
                        →
                      </motion.div>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        console.log('Learn More clicked, scrolling to about');
                        scrollToSection(aboutRef);
                      }}
                      className="border-white/50 text-white hover:bg-white hover:text-black text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full transition-all duration-300 bg-black/20 cursor-pointer relative z-10"
                    >
                      Learn More
                    </Button>
                  </motion.div>
                </motion.div>

                {/* Hero Image */}
                <motion.div
                  className="mb-12 sm:mb-16"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 0.8 }}
                >
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl max-w-4xl mx-auto">
                    <img
                      src="https://images.unsplash.com/photo-1655813710718-00043b177128?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      alt="Modern banking dashboard interface"
                      className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
                      <p className="text-white text-sm sm:text-base font-medium">Experience the future of banking</p>
                    </div>
                  </div>
                </motion.div>

                {/* Feature Cards */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 mt-8 sm:mt-12 md:mt-16">
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                  >
                    <FloatingCard className="text-center h-full">
                      <motion.div
                        className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
                      </motion.div>
                      <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white mb-1 sm:mb-2 md:mb-3">Lightning Fast</h3>
                      <p className="text-gray-300 leading-tight sm:leading-relaxed text-xs sm:text-sm">
                        Process transactions in milliseconds with our advanced infrastructure built for speed and efficiency.
                      </p>
                    </FloatingCard>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.9 }}
                  >
                    <FloatingCard className="text-center h-full">
                      <motion.div
                        className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
                      </motion.div>
                      <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white mb-1 sm:mb-2 md:mb-3">Bank-Level Security</h3>
                      <p className="text-gray-300 leading-tight sm:leading-relaxed text-xs sm:text-sm">
                        Military-grade encryption and multi-layered security protocols protect your financial data 24/7.
                      </p>
                    </FloatingCard>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.1 }}

                  >
                    <FloatingCard className="text-center h-full">
                      <motion.div
                        className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <Globe className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
                      </motion.div>
                      <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white mb-1 sm:mb-2 md:mb-3">Global Access</h3>
                      <p className="text-gray-300 leading-tight sm:leading-relaxed text-xs sm:text-sm">
                        Access your accounts and make transactions from anywhere in the world with full regulatory compliance.
                      </p>
                    </FloatingCard>
                  </motion.div>
                </div>
              </div>

              {/* Stats Section */}
              <motion.div
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-12 sm:mt-16"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.3 }}
              >
                {[
                  { number: "1M+", label: "Active Users" },
                  { number: "$50B+", label: "Assets Under Management" },
                  { number: "99.9%", label: "Uptime Guarantee" },
                  { number: "150+", label: "Countries Supported" },
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <motion.div
                      className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 1.5 + index * 0.1 }}
                    >
                      {stat.number}
                    </motion.div>
                    <div className="text-gray-400 text-xs sm:text-sm uppercase tracking-wide">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
            initial={{ y: 0, opacity: 0.5 }}
            animate={{ y: [0, -15, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <ChevronDown className="w-6 h-6 text-gray-400" />
          </motion.div>
        </section>

        <section
          ref={servicesRef}
          className="relative py-16 sm:py-20 bg-gradient-to-br from-gray-950 via-black to-gray-950 overflow-hidden"
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
          </div>
          <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
            <motion.h2
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-center text-white mb-8 sm:mb-10 md:mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              Our Services
            </motion.h2>

            {/* Services Hero Image */}
            <motion.div
              className="mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="relative rounded-xl overflow-hidden shadow-xl max-w-3xl mx-auto">
                <img
                  src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Professional banking services"
                  className="w-full h-40 sm:h-48 md:h-56 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
              </div>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                {
                  title: "Smart Savings",
                  icon: PiggyBank,
                  description:
                    "Flexible long-term and short-term savings options, helping users securely grow their funds with competitive interest rates.",
                },
                {
                  title: "Intelligent Investing",
                  icon: TrendingUp,
                  description:
                    "AI-powered investment strategies offering both long-term and short-term options to grow your wealth securely.",
                },
                {
                  title: "Secure Deposits",
                  icon: Wallet,
                  description:
                    "Safely transfer funds from bank accounts, credit cards, or other payment methods for savings and investments worldwide.",
                },
                {
                  title: "Instant Transfers",
                  icon: ArrowRightLeft,
                  description:
                    "Lightning-fast money transfers between accounts, both within the platform and to external bank accounts globally.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                >
                  <Card className="bg-white/5 border border-white/10 shadow-xl hover:shadow-white/10 transition-all duration-500 overflow-hidden group backdrop-blur-sm h-full">
                    <CardContent className="p-4 sm:p-6 relative h-full flex flex-col">
                      <div className="absolute top-0 left-0 w-full h-1 bg-white transform -translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white mb-4" />
                      </motion.div>
                      <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-2 sm:mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-300 leading-relaxed flex-grow text-sm">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 bg-black relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12">
              <div className="lg:w-1/2">
                <motion.h2
                  className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4 md:mb-6 leading-tight"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  Experience the Future of Banking
                </motion.h2>
                <motion.p
                  className="text-sm sm:text-base text-gray-300 mb-6 leading-relaxed"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Join millions of satisfied users who have revolutionized their financial management with Hoardrun's cutting-edge platform.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <Button
                    onClick={() => router.push('/signup')}
                    className="bg-white text-black hover:bg-gray-200 text-sm sm:text-base px-6 py-2.5 sm:px-8 sm:py-3 rounded-full transition-all duration-500 transform hover:scale-110 shadow-xl"
                  >
                    Start Your Journey
                    <motion.div
                      className="ml-2"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                    >
                      →
                    </motion.div>
                  </Button>
                </motion.div>
              </div>
              <div className="lg:w-1/2 w-full">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                    <img
                      src="https://images.unsplash.com/photo-1556155092-490a1ba16284?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      alt="Happy customer using mobile banking"
                      className="w-full h-64 sm:h-72 md:h-80 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-sm sm:text-base">Sarah Johnson</h3>
                          <p className="text-gray-200 text-xs sm:text-sm">Verified User</p>
                        </div>
                      </div>
                      <p className="text-white text-xs sm:text-sm leading-relaxed italic">
                        "Hoardrun has completely transformed how I manage my finances."
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <section
          ref={aboutRef}
          className="relative py-16 sm:py-20 bg-gradient-to-br from-gray-950 via-black to-gray-950 overflow-hidden"
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
          </div>
          <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
            <motion.h2
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-center text-white mb-8 sm:mb-10 md:mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              About Us
            </motion.h2>

            {/* About Us Image */}
            <motion.div
              className="mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="relative rounded-xl overflow-hidden shadow-xl max-w-2xl mx-auto">
                <img
                  src="https://images.unsplash.com/photo-1494888427482-242d32babc0b?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Modern office team collaboration"
                  className="w-full h-40 sm:h-48 md:h-56 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                  At Hoardrun, we offer comprehensive universal banking services tailored for corporations, investors,
                  and individuals. Our mission is to empower you with low-cost investment opportunities and expert
                  guidance in the digital age.
                </p>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                  We specialize in identifying promising startups, taking minimal equity stakes, and ensuring they
                  thrive in the market. Our innovative debit card system allows seamless transactions with minimal fees,
                  while our AI-powered insights help you make informed decisions and avoid fraud.
                </p>
              </motion.div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { icon: Building2, title: "Corporate Services" },
                  { icon: Users, title: "Individual Banking" },
                  { icon: Briefcase, title: "Investment Opportunities" },
                  { icon: CreditCard, title: "Smart Debit Cards" },
                  { icon: Brain, title: "AI-Powered Insights" },
                  { icon: ShieldCheck, title: "Advanced Security" },
                  { icon: PiggyBank, title: "Flexible Savings" },
                  { icon: HeadphonesIcon, title: "24/7 Support" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <Card className="bg-white/5 border border-white/10 shadow-lg hover:shadow-white/10 transition-all duration-300 group">
                      <CardContent className="p-3 sm:p-4 flex flex-col items-center text-center">
                        <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white mb-2 sm:mb-3" />
                        <h3 className="font-semibold text-white text-xs sm:text-sm">
                          {item.title}
                        </h3>
                      </CardContent>
                    </Card>
                  </motion.div>
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
              <h3 className="text-sm sm:text-base font-semibold mb-4 sm:mb-6">Company</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <button
                    onClick={() => scrollToSection(aboutRef)}
                    className="text-gray-300 hover:text-white transition-colors duration-300 text-xs sm:text-sm"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 text-xs sm:text-sm">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 text-xs sm:text-sm">
                    Press
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold mb-4 sm:mb-6">Product</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <button
                    onClick={() => scrollToSection(servicesRef)}
                    className="text-gray-300 hover:text-white transition-colors duration-300 text-xs sm:text-sm"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 text-xs sm:text-sm">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 text-xs sm:text-sm">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold mb-4 sm:mb-6">Resources</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 text-xs sm:text-sm">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 text-xs sm:text-sm">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 text-xs sm:text-sm">
                    API Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold mb-4 sm:mb-6">Legal</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 text-xs sm:text-sm">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 text-xs sm:text-sm">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 text-xs sm:text-sm">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <button
                onClick={scrollToTop}
                className="text-base sm:text-lg md:text-xl font-bold cursor-pointer hover:opacity-80 transition-opacity duration-300"
              >
                <span className="text-white">Hoard</span>
                <span className="text-gray-400">run</span>
              </button>
            </div>
            <p className="text-gray-400 text-center sm:text-right text-xs sm:text-sm">
              &copy; 2024 Hoardrun. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}