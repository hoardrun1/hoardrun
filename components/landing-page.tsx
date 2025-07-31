"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  Mail,
  Phone,
  MapPin,
  User,
  BarChart,
  ChevronDown,
} from "lucide-react"

const FloatingCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <motion.div
    className={`bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl shadow-gray-900/50 p-4 border border-gray-700/50 ${className}`}
    initial={{ y: 30, opacity: 0, scale: 0.95 }}
    animate={{ y: 0, opacity: 1, scale: 1 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    whileHover={{ y: -10, scale: 1.03 }}
  >
    {children}
  </motion.div>
)

const AnimatedBackground = () => {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -300])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3])

  return (
    <motion.div className="absolute inset-0 overflow-hidden" style={{ y, opacity }}>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-900">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/30"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-40">
          <div className="absolute top-20 left-10 w-2.5 h-2.5 bg-gray-500 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-gray-600 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-60 left-1/3 w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-500"></div>
          <div className="absolute bottom-40 right-1/4 w-1.5 h-1.5 bg-gray-600 rounded-full animate-pulse delay-700"></div>
        </div>
      </div>
      <svg
        className="absolute bottom-0 left-0 w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(150, 150, 150, 0.4)" />
            <stop offset="100%" stopColor="rgba(150, 150, 150, 0.2)" />
          </linearGradient>
        </defs>
        <path
          fill="url(#waveGradient)"
          fillOpacity="1"
          d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        >
          <animate
            attributeName="d"
            dur="10s"
            repeatCount="indefinite"
            values="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
    M0,64L48,96C96,128,192,192,288,213.3C384,235,480,213,576,192C672,171,768,149,864,165.3C960,181,1056,235,1152,224C1248,213,1344,139,1392,101.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
    M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </path>
      </svg>
    </motion.div>
  )
}

const ParallaxText: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -150])

  return (
    <motion.div className={className} style={{ y }}>
      {children}
    </motion.div>
  )
}

export function LandingPageComponent() {
  const [isScrolled, setIsScrolled] = useState(false)
  const aboutRef = useRef(null)
  const contactRef = useRef(null)
  const servicesRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (elementRef: React.RefObject<HTMLElement>) => {
    if (elementRef.current) {
      window.scrollTo({
        top: elementRef.current.offsetTop - 100,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? "bg-black/80 backdrop-blur-lg shadow-2xl shadow-gray-900/50 py-1 border-b border-gray-800/50" : "bg-transparent py-3"}`}
      >
        <div className="container mx-auto px-4">
          <nav className="flex justify-between items-center">
            <motion.a
              href="#"
              className="text-2xl font-bold"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400">
                Hoard
              </span>
              <span className="text-white">run</span>
            </motion.a>
            <div className="hidden md:flex space-x-8">
              <motion.button
                onClick={() => scrollToSection(aboutRef)}
                className="text-gray-300 hover:text-gray-100 transition-all duration-300 relative group"
                whileHover={{ y: -3 }}
              >
                About
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-gray-300 to-gray-500 group-hover:w-full transition-all duration-300"></span>
              </motion.button>
              <motion.button
                onClick={() => scrollToSection(contactRef)}
                className="text-gray-300 hover:text-gray-100 transition-all duration-300 relative group"
                whileHover={{ y: -3 }}
              >
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-gray-300 to-gray-500 group-hover:w-full transition-all duration-300"></span>
              </motion.button>
              <motion.button
                onClick={() => scrollToSection(servicesRef)}
                className="text-gray-300 hover:text-gray-100 transition-all duration-300 relative group"
                whileHover={{ y: -3 }}
              >
                Services
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-gray-300 to-gray-500 group-hover:w-full transition-all duration-300"></span>
              </motion.button>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/signin" className="text-gray-300 hover:text-white transition-colors">
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-gray-100 hover:bg-gray-800/50 transition-all duration-300"
                >
                  Log In
                </Button>
              </a>
              <a href="/signup">
                <Button className="bg-gradient-to-r from-gray-100 to-white text-black hover:from-gray-200 hover:to-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-gray-700/30">
                  Sign up
                </Button>
              </a>
              <Button className="md:hidden" variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative mt-10 pt-48 pb-32 overflow-hidden min-h-screen flex items-center">
          <AnimatedBackground />
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center">
              <div className="w-full md:w-1/2 mb-8 md:mb-2">
                <ParallaxText>
                  <motion.h1
                    className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-50 to-gray-200">
                      Banking Reimagined
                    </span>
                    <br />
                    <span className="text-gray-400 text-3xl sm:text-4xl md:text-6xl">for the Digital Age</span>
                  </motion.h1>
                </ParallaxText>
                <motion.p
                  className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-10 -mt-16 leading-relaxed"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                >
                  Experience seamless financial management with cutting-edge security and user-centric design.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                >
                  <a href="/signup">
                    <Button className="bg-gradient-to-r from-gray-100 to-white text-black hover:from-gray-200 hover:to-gray-100 text-base px-6 py-3 rounded-full transition-all duration-500 transform hover:scale-110 shadow-2xl hover:shadow-white/30">
                      Get Started
                      <motion.div
                        className="ml-2"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                      >
                        →
                      </motion.div>
                    </Button>
                  </a>
                </motion.div>
              </div>
              <div className="w-full md:w-1/2 relative flex flex-col sm:flex-row items-center justify-center sm:justify-around gap-4 md:block">
                <FloatingCard className="w-full max-w-sm sm:w-1/2 md:absolute md:top-0 md:right-0 md:w-96 mb-4 md:mb-0">
                  <div className="flex flex-col items-center space-y-6">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    >
                      <BarChart className="w-12 h-12 text-gray-400" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-gray-100 sm:text-xl">Smart Analytics</h3>
                    <p className="text-xs text-gray-300 text-center leading-relaxed sm:text-sm">
                      Gain insights into your financial health with our advanced analytics tools.
                    </p>
                  </div>
                </FloatingCard>
                <FloatingCard className="w-full max-w-sm sm:w-1/2 md:mt-6 md:absolute md:bottom-0 md:left-0 md:w-80">
                  <div className="flex items-center space-x-4 mb-6">
                    <motion.div
                      className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center shadow-inner shadow-black/30"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <TrendingUp className="w-6 h-6 text-gray-200" />
                    </motion.div>
                    <div>
                      <h3 className="text-base font-bold text-gray-100 sm:text-lg">Smart Investing</h3>
                      <p className="text-xs text-gray-300 sm:text-sm">AI-powered portfolio management</p>
                    </div>
                  </div>
                  <div className="h-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full overflow-hidden shadow-inner shadow-black/30">
                    <motion.div
                      className="h-full bg-gradient-to-r from-gray-400 to-gray-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "75%" }}
                      transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                    ></motion.div>
                  </div>
                </FloatingCard>
              </div>
            </div>
          </div>
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            initial={{ y: 0, opacity: 0.5 }}
            animate={{ y: [0, -15, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <ChevronDown className="w-10 h-10 text-gray-400" />
          </motion.div>
        </section>

        <section
          ref={servicesRef}
          className="relative py-16 bg-gradient-to-br from-gray-950 via-black to-gray-950 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/40 to-black/60 z-0"></div>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.h2
              className="text-3xl md:text-5xl lg:text-6xl font-bold text-center text-white mb-10 relative z-10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-100 via-white to-gray-200">
                Our Services
              </span>
            </motion.h2>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Smart Savings",
                  icon: PiggyBank,
                  description:
                    "Hoardrun offers flexible long-term and short-term savings options, helping users securely grow their funds.",
                },
                {
                  title: "Intelligent Investing",
                  icon: TrendingUp,
                  description:
                    "Hoardrun offers both long-term and short-term investment options, enabling users to grow their wealth securely.",
                },
                {
                  title: "Secure Deposits",
                  icon: Wallet,
                  description:
                    "Securely transfer funds from bank accounts, credit cards, or other payment methods for savings, investments. Deposit everywhere in the world.",
                },
                {
                  title: "Instant Transfers",
                  icon: ArrowRightLeft,
                  description:
                    "Securely send money between accounts, both within the platform and to external bank accounts. You can transfer worldwide.",
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
                  <Card className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 border border-gray-700/60 shadow-xl hover:shadow-gray-600/30 transition-all duration-500 overflow-hidden group backdrop-blur-sm h-full">
                    <CardContent className="p-6 relative h-full flex flex-col">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 transform -translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-800/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <feature.icon className="w-10 h-10 text-gray-300 mb-4 transform group-hover:text-gray-100 transition-all duration-500" />
                      </motion.div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-4 group-hover:text-gray-50 transition-colors duration-500">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors duration-500 leading-normal flex-grow">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-br from-black via-gray-950 to-black relative overflow-hidden">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gray-800/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-700/20 rounded-full blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-12 md:mb-0">
                <motion.h2
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  Experience the Future of Banking
                </motion.h2>
                <motion.p
                  className="text-base md:text-xl lg:text-2xl text-gray-200 mb-6 leading-relaxed"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Join thousands of satisfied users who have revolutionized their financial management with Hoardrun.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <a href="/signup">
                    <Button className="bg-gradient-to-r from-gray-100 to-white text-black hover:from-gray-200 hover:to-gray-100 text-base px-6 py-3 rounded-full transition-all duration-500 transform hover:scale-110 shadow-2xl hover:shadow-white/30">
                      Start Your Journey
                      <motion.div
                        className="ml-2"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                      >
                        →
                      </motion.div>
                    </Button>
                  </a>
                </motion.div>
              </div>
              <div className="md:w-1/2">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <FloatingCard>
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-4">
                        <motion.div
                          className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center shadow-lg shadow-black/30"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <User className="w-6 h-6 text-gray-200" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-100">Sarah Johnson</h3>
                          <p className="text-sm text-gray-300">Hoardrun User</p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.svg
                            key={star}
                            className="w-4 h-4 text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: star * 0.1, type: "spring", stiffness: 300 }}
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </motion.svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-200 italic text-base leading-relaxed">
                      &quot;Hoardrun has completely transformed how I manage my finances. The smart savings feature has
                      helped me save more than ever before!&quot;
                    </p>
                  </FloatingCard>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <section
          ref={aboutRef}
          className="relative py-16 bg-gradient-to-br from-gray-950 via-black to-gray-950 overflow-hidden"
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.h2
              className="text-3xl md:text-5xl lg:text-6xl font-bold text-center text-white mb-10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-100 via-white to-gray-200">
                About Us
              </span>
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <p className="text-base md:lg lg:text-xl text-gray-300 mb-4 leading-relaxed">
                  At Hoardrun, we offer comprehensive universal banking services tailored for corporations, investors,
                  and individuals. Our mission is to empower you with low-cost investment opportunities and expert
                  guidance.
                </p>
                <p className="text-base md:lg lg:text-xl text-gray-300 mb-4 leading-relaxed">
                  We specialize in identifying promising startups, taking only a 1% equity stake, and ensuring they
                  thrive in the market. Our innovative debit card system allows seamless transactions with minimal fees,
                  while our AI-powered insights help you make informed decisions and avoid fraud.
                </p>
              </motion.div>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: Building2, title: "Corporate Services" },
                  { icon: Users, title: "Individual Banking" },
                  { icon: Briefcase, title: "Investment Opportunities" },
                  { icon: CreditCard, title: "Innovative Debit Cards" },
                  { icon: Brain, title: "AI-Powered Insights" },
                  { icon: ShieldCheck, title: "High Security" },
                  { icon: PiggyBank, title: "Diverse Savings Options" },
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
                    <Card className="bg-gray-800/70 border border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
                      <CardContent className="p-3 flex flex-col items-center text-center">
                        <item.icon className="w-6 h-6 text-gray-300 mb-1 group-hover:text-gray-100 transition-colors duration-300" />
                        <h3 className="font-medium text-white group-hover:text-gray-50 transition-colors duration-300">
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

        <section ref={contactRef} className="py-12 bg-black">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white mb-8">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-300 to-gray-500">
                Contact Us
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">Get in Touch</h3>
                <p className="text-gray-400 mb-4">
                  We&apos;d love to hear from you. Please fill out this form and we will get in touch with you shortly.
                </p>
                <form className="space-y-3">
                  <Input
                    placeholder="Your Name"
                    className="bg-gray-800/70 border-gray-700/80 text-gray-200 placeholder-gray-500 focus:border-gray-500 focus:ring-gray-500"
                  />
                  <Input
                    type="email"
                    placeholder="Your Email"
                    className="bg-gray-800/70 border-gray-700/80 text-gray-200 placeholder-gray-500 focus:border-gray-500 focus:ring-gray-500"
                  />
                  <Textarea
                    placeholder="Your Message"
                    className="h-32 bg-gray-800/70 border-gray-700/80 text-gray-200 placeholder-gray-500 focus:border-gray-500 focus:ring-gray-500"
                  />
                  <Button className="bg-gradient-to-r from-gray-100 to-white text-black hover:from-gray-200 hover:to-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-gray-700/30">
                    Send Message
                  </Button>
                </form>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-200">info@hoardrun.com</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-200">+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-200">123 Finance Street, New York, NY 10001</span>
                  </div>
                </div>
                <div className="mt-8">
                  <h4 className="text-lg font-semibold mb-3 text-white">Follow Us</h4>
                  <div className="flex space-x-4">{/* Add social media icons here */}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-950 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-base font-semibold mb-3">Company</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => scrollToSection(aboutRef)}
                    className="text-gray-300 hover:text-gray-100 transition-colors duration-300"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-gray-100 transition-colors duration-300">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-gray-100 transition-colors duration-300">
                    Press
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-base font-semibold mb-3">Product</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => scrollToSection(servicesRef)}
                    className="text-gray-300 hover:text-gray-100 transition-colors duration-300"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-gray-100 transition-colors duration-300">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-gray-100 transition-colors duration-300">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-base font-semibold mb-3">Resources</h3>
              <ul className="space-y-1">
                <li>
                  <a href="#" className="text-gray-300 hover:text-gray-100 transition-colors duration-300">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-gray-100 transition-colors duration-300">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-gray-100 transition-colors duration-300">
                    API Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-base font-semibold mb-3">Legal</h3>
              <ul className="space-y-1">
                <li>
                  <a href="#" className="text-gray-300 hover:text-gray-100 transition-colors duration-300">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-gray-100 transition-colors duration-300">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-gray-100 transition-colors duration-300">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-800 text-center">
            <p className="text-gray-400">&copy; 2024 Hoardrun. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
