'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PiggyBank, TrendingUp, Wallet, ArrowRightLeft, Menu, Building2, Users, Briefcase, CreditCard, Brain, ShieldCheck, HeadphonesIcon, Mail, Phone, MapPin, User, BarChart, ChevronDown } from 'lucide-react'

const FloatingCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <motion.div
    className={`bg-white rounded-lg shadow-lg p-6 ${className}`}
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    {children}
  </motion.div>
)

const AnimatedBackground = () => {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -200])

  return (
    <motion.div className="absolute inset-0 overflow-hidden" style={{ y }}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-black"></div>
      <svg className="absolute bottom-0 left-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
        <path fill="rgba(59, 130, 246, 0.1)" fillOpacity="1" d="M0,32L48,80C96,128,192,224,288,224C384,224,480,128,576,90.7C672,53,768,75,864,96C960,117,1056,139,1152,149.3C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </svg>
    </motion.div>
  )
}

const ParallaxText: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -100])

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
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (elementRef: React.RefObject<HTMLElement>) => {
    if (elementRef.current) {
      window.scrollTo({
        top: elementRef.current.offsetTop - 100,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-4'}`}>
        <div className="container mx-auto px-4">
          <nav className="flex justify-between items-center">
            <a href="#" className="text-2xl font-bold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">Hoard</span>
              <span className="text-white">run</span>
            </a>
            <div className="hidden md:flex space-x-6">
              <button onClick={() => scrollToSection(aboutRef)} className="text-gray-300 hover:text-blue-400 transition-colors">About</button>
              <button onClick={() => scrollToSection(contactRef)} className="text-gray-300 hover:text-blue-400 transition-colors">Contact</button>
              <button onClick={() => scrollToSection(servicesRef)} className="text-gray-300 hover:text-blue-400 transition-colors">Services</button>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/signin" className="text-gray-300 hover:text-blue-400 transition-colors">
                <Button variant="ghost" className="text-gray-300 hover:text-blue-400 hover:bg-blue-900/20">
                  Log In
                </Button>
              </a>
              <a href="/signup">
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
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
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          <AnimatedBackground />
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-12 md:mb-0">
                <ParallaxText>
                  <motion.h1 
                    className="text-4xl md:text-6xl font-bold text-white mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    Banking Reimagined for the Digital Age
                  </motion.h1>
                </ParallaxText>
                <motion.p 
                  className="text-xl text-blue-200 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Experience seamless financial management with cutting-edge security and user-centric design.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <a href="/signup">
                    <Button className="bg-blue-600 text-white hover:bg-blue-700 text-lg px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105">
                      Get Started
                    </Button>
                  </a>
                </motion.div>
              </div>
              <div className="md:w-1/2 relative">
                <FloatingCard className="md:absolute md:top-0 md:right-0 md:w-96">
                  <div className="flex flex-col items-center space-y-4">
                    <BarChart className="w-16 h-16 text-blue-600" />
                    <h3 className="text-xl font-semibold text-gray-800">Smart Analytics</h3>
                    <p className="text-gray-600 text-center">Gain insights into your financial health with our advanced analytics tools.</p>
                  </div>
                </FloatingCard>
                <FloatingCard className="mt-6 md:mt-0 md:absolute md:bottom-0 md:left-0 md:w-80">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Smart Investing</h3>
                      <p className="text-sm text-gray-600">AI-powered portfolio management</p>
                    </div>
                  </div>
                  <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-blue-600"
                      initial={{ width: 0 }}
                      animate={{ width: '75%' }}
                      transition={{ duration: 1, delay: 0.5 }}
                    ></motion.div>
                  </div>
                </FloatingCard>
              </div>
            </div>
          </div>
          <motion.div 
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
            initial={{ y: 0 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-8 h-8 text-blue-400" />
          </motion.div>
        </section>

        <section ref={servicesRef} className="relative py-20 bg-gray-900 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-black opacity-50 z-0"></div>
          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12 relative z-10">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">Our Services</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { 
                  title: 'Smart Savings', 
                  icon: PiggyBank, 
                  description: 'Hoardrun offers flexible long-term and short-term savings options, helping users securely grow their funds.' 
                },
                { 
                  title: 'Intelligent Investing', 
                  icon: TrendingUp, 
                  description: 'Hoardrun offers both long-term and short-term investment options, enabling users to grow their wealth securely.' 
                },
                { 
                  title: 'Secure Deposits', 
                  icon: Wallet, 
                  description: 'Securely transfer funds from bank accounts, credit cards, or other payment methods for savings, investments. Deposit everywhere in the world.' 
                },
                { 
                  title: 'Instant Transfers', 
                  icon: ArrowRightLeft, 
                  description: 'Securely send money between accounts, both within the platform and to external bank accounts. You can transfer worldwide.' 
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                    <CardContent className="p-6 relative">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600 transform -translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                      <feature.icon className="w-12 h-12 text-blue-400 mb-4 transform group-hover:scale-110 transition-transform duration-300" />
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">{feature.title}</h3>
                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-black">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-12 md:mb-0">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Experience the Future of Banking
                </h2>
                <p className="text-xl text-gray-400 mb-8">
                  Join thousands of satisfied users who have revolutionized their financial management with Hoardrun.
                </p>
                <a href="/signup">
                  <Button className="bg-blue-600 text-white hover:bg-blue-700 text-lg px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105">
                    Start Your Journey
                  </Button>
                </a>
              </div>
              <div className="md:w-1/2">
                <FloatingCard>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Sarah Johnson</h3>
                        <p className="text-sm text-gray-600">Hoardrun User</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 italic">
                    &quot;Hoardrun has completely transformed how I manage my finances. The smart savings feature has helped me save more than ever before!&quot;
                  </p>
                </FloatingCard>
              </div>
            </div>
          </div>
        </section>

        <section ref={aboutRef} className="py-20 bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">About Us</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-lg text-gray-300 mb-6">
                  At Hoardrun, we offer comprehensive universal banking services tailored for corporations, investors, and individuals. Our mission is to empower you with low-cost investment opportunities and expert guidance.
                </p>
                <p className="text-lg text-gray-300 mb-6">
                  We specialize in identifying promising startups, taking only a 1% equity stake, and ensuring they thrive in the market. Our innovative debit card system allows seamless transactions with minimal fees, while our AI-powered insights help you make informed decisions and avoid fraud.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: Building2, title: "Corporate Services" },
                  { icon: Users, title: "Individual Banking" },
                  { icon: Briefcase, title: "Investment Opportunities" },
                  { icon: CreditCard, title: "Innovative Debit Cards" },
                  { icon: Brain, title: "AI-Powered Insights" },
                  { icon: ShieldCheck, title: "High Security" },
                  { icon: PiggyBank, title: "Diverse Savings Options" },
                  { icon: HeadphonesIcon, title: "24/7 Support" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="bg-gray-800 border-0 shadow-sm hover:shadow-md transition-all duration-300 group">
                      <CardContent className="p-4 flex flex-col items-center text-center">
                        <item.icon className="w-8 h-8 text-blue-400 mb-2 group-hover:text-blue-300 transition-colors duration-300" />
                        <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors duration-300">{item.title}</h3>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section ref={contactRef} className="py-20 bg-black">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">Contact Us</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-white">Get in Touch</h3>
                <p className="text-gray-400 mb-6">We&apos;d love to hear from you. Please fill out this form and we will get in touch with you shortly.</p>
                <form className="space-y-4">
                  <Input placeholder="Your Name" className="bg-gray-800 border-gray-700 text-white" />
                  <Input type="email" placeholder="Your Email" className="bg-gray-800 border-gray-700 text-white" />
                  <Textarea placeholder="Your Message" className="h-32 bg-gray-800 border-gray-700 text-white" />
                  <Button className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 transform hover:scale-105">Send Message</Button>
                </form>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-white">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Mail className="w-6 h-6 text-blue-400" />
                    <span className="text-gray-300">info@hoardrun.com</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Phone className="w-6 h-6 text-blue-400" />
                    <span className="text-gray-300">+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <MapPin className="w-6 h-6 text-blue-400" />
                    <span className="text-gray-300">123 Finance Street, New York, NY 10001</span>
                  </div>
                </div>
                <div className="mt-8">
                  <h4 className="text-xl font-semibold mb-4 text-white">Follow Us</h4>
                  <div className="flex space-x-4">
                    {/* Add social media icons here */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection(aboutRef)} className="hover:text-blue-400 transition-colors duration-300">About Us</button></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors duration-300">Careers</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors duration-300">Press</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection(servicesRef)} className="hover:text-blue-400 transition-colors duration-300">Features</button></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors duration-300">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors duration-300">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-blue-400 transition-colors duration-300">Blog</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors duration-300">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors duration-300">API Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-blue-400 transition-colors duration-300">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors duration-300">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors duration-300">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center">
            <p>&copy; 2024 Hoardrun. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}