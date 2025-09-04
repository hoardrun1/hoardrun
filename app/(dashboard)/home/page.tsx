'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { SidebarProvider, ResponsiveSidebarLayout } from '@/components/ui/sidebar-layout'
import { SidebarContent } from '@/components/ui/sidebar-content'
import { SidebarToggle } from '@/components/ui/sidebar-toggle'
import { RightSidebar } from '@/components/ui/right-sidebar'
import { RightSidebarToggle } from '@/components/ui/right-sidebar-toggle'
import { DepositModal } from '@/components/deposit-modal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/contexts/NotificationContext'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  Target,
  Calendar,
  Bell
} from 'lucide-react'
import { SectionFooter } from '@/components/ui/section-footer'

export default function HomePage() {
  const router = useRouter()
  const { addNotification } = useNotifications()
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(true)
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false)

  // Check if user has already seen the welcome animation (persists across refreshes)
  useEffect(() => {
    const hasSeenWelcomePermanently = localStorage.getItem('hasSeenWelcome')
    if (hasSeenWelcomePermanently) {
      setShowWelcomeAnimation(false)
      setHasSeenWelcome(true)
    } else {
      // Show welcome animation for 3 seconds, then show main content
      const timer = setTimeout(() => {
        setShowWelcomeAnimation(false)
        setHasSeenWelcome(true)
        localStorage.setItem('hasSeenWelcome', 'true')
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [])

  // Mock data for the dashboard
  const stats = {
    totalBalance: 12450.75,
    monthlyIncome: 5200.00,
    monthlyExpenses: 3150.25,
    savings: 8750.50,
    investments: 15200.30,
    creditScore: 742
  }

  const recentTransactions = [
    { id: 1, type: 'income', description: 'Salary Deposit', amount: 5200.00, date: '2024-01-15' },
    { id: 2, type: 'expense', description: 'Grocery Shopping', amount: -120.50, date: '2024-01-14' },
    { id: 3, type: 'expense', description: 'Gas Station', amount: -45.00, date: '2024-01-13' },
    { id: 4, type: 'income', description: 'Freelance Payment', amount: 800.00, date: '2024-01-12' }
  ]

  const handleQuickAction = (action: { href?: string; action?: () => void }) => {
    if (action.href) {
      router.push(action.href)
    } else if (action.action) {
      action.action()
    }
  }

  // Demo function to test notifications
  const testNotifications = () => {
    const notifications = [
      {
        type: 'transaction' as const,
        title: 'Payment Received',
        message: 'You received $500.00 from Sarah Johnson'
      },
      {
        type: 'warning' as const,
        title: 'Budget Alert',
        message: 'You\'ve exceeded your monthly dining budget by $50'
      },
      {
        type: 'success' as const,
        title: 'Goal Achieved',
        message: 'Congratulations! You\'ve reached your vacation savings goal'
      },
      {
        type: 'security' as const,
        title: 'Security Alert',
        message: 'New login detected from iPhone in New York'
      },
      {
        type: 'info' as const,
        title: 'Investment Update',
        message: 'Your portfolio gained 3.2% this week'
      }
    ]

    // Pick a random notification
    const randomNotification = notifications[Math.floor(Math.random() * notifications.length)]
    addNotification(randomNotification)
  }

  const quickActions = [
    { label: 'Send Money', href: '/send', icon: ArrowUpRight, color: 'bg-black' },
    { label: 'Add Money', action: () => setIsDepositModalOpen(true), icon: ArrowDownLeft, color: 'bg-black' },
    { label: 'View Cards', href: '/cards', icon: CreditCard, color: 'bg-black' },
    { label: 'Savings Goals', href: '/savings', icon: Target, color: 'bg-black' },
    { label: 'Investments', href: '/investment', icon: TrendingUp, color: 'bg-black' },
    { label: 'Analytics', href: '/analytics', icon: DollarSign, color: 'bg-black' },
    { label: 'Test Notifications', action: testNotifications, icon: Bell, color: 'bg-black' },
    { label: 'Help & Support', href: '/help', icon: Calendar, color: 'bg-black' }
  ]

  return (
    <SidebarProvider>
      <ResponsiveSidebarLayout
        sidebar={<SidebarContent onAddMoney={() => setIsDepositModalOpen(true)} />}
      >
        <SidebarToggle />
        <RightSidebarToggle
          isOpen={isRightSidebarOpen}
          onToggle={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
          notificationCount={2}
        />

        {/* Welcome Animation Overlay */}
        <AnimatePresence>
          {showWelcomeAnimation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="fixed inset-0 bg-gradient-to-br from-background via-secondary to-muted z-[100] flex items-center justify-center overflow-hidden"
            >
              {/* Animated Background Particles */}
              <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-foreground/10 rounded-full"
                    initial={{ 
                      x: Math.random() * window.innerWidth,
                      y: Math.random() * window.innerHeight,
                      scale: 0
                    }}
                    animate={{ 
                      x: Math.random() * window.innerWidth,
                      y: Math.random() * window.innerHeight,
                      scale: [0, 1, 0],
                      opacity: [0, 0.6, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>

              {/* Main Content Container */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0 }}
                transition={{ 
                  duration: 0.8,
                  ease: [0.23, 1, 0.320, 1]
                }}
                className="relative text-center space-y-8 z-10"
              >
                {/* Glowing Ring Effect */}
                <motion.div
                  className="absolute -inset-20 rounded-full"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [0, 1.2, 1],
                    opacity: [0, 0.3, 0.1]
                  }}
                  transition={{
                    duration: 2,
                    ease: "easeOut"
                  }}
                  style={{
                    background: 'radial-gradient(circle, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 50%, transparent 70%)',
                    filter: 'blur(20px)'
                  }}
                />

                {/* Text Content */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="space-y-6"
                >
                  {/* Main Title with LED-like effect */}
                  <motion.div className="relative">
                    <motion.h1 
                      className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-foreground via-muted-foreground to-foreground"
                      initial={{ letterSpacing: "0.1em" }}
                      animate={{ 
                        letterSpacing: ["0.1em", "0.05em", "0.02em"],
                      }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    >
                      Welcome
                    </motion.h1>
                    
                    {/* Glowing underline effect */}
                    <motion.div
                      className="absolute -bottom-2 left-1/2 h-1 bg-gradient-to-r from-transparent via-foreground to-transparent"
                      initial={{ width: 0, x: "-50%" }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                    />
                  </motion.div>

                  <motion.h2 
                    className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.6 }}
                  >
                    back!
                  </motion.h2>

                  {/* Subtitle with typewriter effect */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                    className="relative space-y-4"
                  >
                    <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                      Here's what's happening with your money today
                    </p>
                    
                    {/* Date display with elegant styling */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2, duration: 0.6 }}
                      className="flex items-center justify-center space-x-3 text-muted-foreground"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 2.2, duration: 0.4, type: "spring" }}
                      >
                        <Calendar className="h-5 w-5" />
                      </motion.div>
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 2.3, duration: 0.5 }}
                        className="text-base sm:text-lg font-medium"
                      >
                        {new Date().toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </motion.span>
                    </motion.div>
                    
                    {/* Blinking cursor effect */}
                    <motion.span
                      className="inline-block w-0.5 h-6 bg-foreground ml-1"
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                  </motion.div>
                </motion.div>
                
                {/* Enhanced Icon with LED-like glow */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ 
                    scale: 1, 
                    rotate: 0,
                  }}
                  transition={{ 
                    delay: 2,
                    duration: 0.8,
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }}
                  className="relative mx-auto w-20 h-20"
                >
                  {/* Outer glow rings */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-foreground/20"
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0.1, 0.3]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-2 rounded-full border border-foreground/30"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.2, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  />
                  
                  {/* Main icon container */}
                  <motion.div
                    className="relative w-full h-full bg-gradient-to-br from-primary via-primary to-primary rounded-full flex items-center justify-center shadow-2xl"
                    animate={{ 
                      boxShadow: [
                        "0 0 20px rgba(0,0,0,0.3)",
                        "0 0 40px rgba(0,0,0,0.5)",
                        "0 0 20px rgba(0,0,0,0.3)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <DollarSign className="h-10 w-10 text-primary-foreground" />
                    </motion.div>
                    
                    {/* Inner highlight */}
                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary-foreground/20 to-transparent" />
                  </motion.div>
                </motion.div>

                {/* Loading dots */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.5, duration: 0.5 }}
                  className="flex justify-center space-x-2 mt-8"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-foreground rounded-full"
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 1, 0.3]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content - Only show after welcome animation */}
        <AnimatePresence>
          {!showWelcomeAnimation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.320, 1] }}
              className={`relative min-h-screen bg-background pt-12 sm:pt-16 md:pt-20 lg:pt-0 pb-2 sm:pb-4 md:pb-6 lg:pb-0 px-2 sm:px-4 md:px-6 lg:px-0 transition-all duration-300 ${
                isRightSidebarOpen ? 'lg:mr-80' : ''
              }`}
            >
              
              {/* Content container with relative positioning */}
              <div className="relative z-10 max-w-full sm:max-w-5xl md:max-w-6xl lg:max-w-none mx-auto lg:mx-0 space-y-8 sm:space-y-10 md:space-y-12 lg:space-y-10 lg:p-2 mb-20">

            {/* Balance Card - Prominent like Cash App */}
            <Card className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-xl">
              <CardContent className="p-4 sm:p-6">
                <div className="text-center space-y-2">
                  <p className="text-sm text-primary-foreground/70">Total Balance</p>
                  <h1 className="text-3xl sm:text-4xl font-bold">${stats.totalBalance.toLocaleString()}</h1>
                  <p className="text-sm text-primary-foreground/60">+2.5% from last month</p>
                </div>
              </CardContent>
            </Card>

            {/* Primary Actions - Theme-aware Design */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground px-1 text-center lg:text-center">Quick Actions</h2>
              <div className="flex overflow-x-auto lg:justify-center gap-3 pb-2 px-1">
                {[
                  { label: 'Send', href: '/send', icon: ArrowUpRight, color: 'bg-primary' },
                  { label: 'Add Money', action: () => setIsDepositModalOpen(true), icon: ArrowDownLeft, color: 'bg-secondary' },
                  { label: 'Cards', href: '/cards', icon: CreditCard, color: 'bg-muted' },
                  { label: 'Invest', href: '/investment', icon: TrendingUp, color: 'bg-accent' },
                  { label: 'Save', href: '/savings', icon: Target, color: 'bg-muted-foreground' }
                ].map((action, index) => (
                  <Button
                    key={index}
                    className={`${action.color} hover:bg-primary hover:opacity-90 text-primary-foreground border-0 min-w-[80px] h-16 flex flex-col items-center justify-center space-y-1 rounded-xl shadow-lg transition-all duration-200`}
                    onClick={() => handleQuickAction(action)}
                  >
                    <action.icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Secondary Actions - More compact */}
            <Card className="bg-card border-border">
              <CardContent className="p-3">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Analytics', href: '/analytics', icon: DollarSign },
                    { label: 'Notifications', action: testNotifications, icon: Bell },
                    { label: 'Help', href: '/help', icon: Calendar }
                  ].map((action, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="h-14 flex flex-col items-center justify-center space-y-1 text-muted-foreground hover:text-foreground hover:bg-secondary"
                      onClick={() => handleQuickAction(action)}
                    >
                      <action.icon className="h-4 w-4" />
                      <span className="text-xs">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Financial Overview and Recent Transactions - Side by side grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
              {/* Financial Overview */}
              <div className="space-y-2 sm:space-y-3">
                <h2 className="text-lg sm:text-xl font-bold text-foreground text-center md:text-left">Financial Overview</h2>
                <div className="grid grid-cols-2 gap-1 sm:gap-2">
                  <Card className="bg-gradient-to-br from-secondary to-secondary/80 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-2 sm:p-4">
                      <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
                      <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-2 sm:p-4 pt-0">
                      <div className="text-sm sm:text-base md:text-lg font-bold text-foreground">
                        ${stats.totalBalance.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        +2.5% from last month
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-secondary to-secondary/80 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-2 sm:p-4">
                      <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Savings</CardTitle>
                      <PiggyBank className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-2 sm:p-4 pt-0">
                      <div className="text-sm sm:text-base md:text-lg font-bold text-foreground">
                        ${stats.savings.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        +8% from last month
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-secondary to-secondary/80 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-2 sm:p-4">
                      <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Net Worth</CardTitle>
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-2 sm:p-4 pt-0">
                      <div className="text-sm sm:text-base md:text-lg font-bold text-foreground">
                        ${(stats.totalBalance + stats.investments).toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        +15% from last month
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-secondary to-secondary/80 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-2 sm:p-4">
                      <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Portfolio Value</CardTitle>
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-2 sm:p-4 pt-0">
                      <div className="text-sm sm:text-base md:text-lg font-bold text-foreground">
                        ${stats.investments.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        +12.5% from last month
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Recent Transactions */}
              <Card className="bg-gradient-to-br from-secondary to-secondary/80 border-border shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-t-lg">
                  <CardTitle className="text-base sm:text-lg font-bold text-center md:text-left">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-3">
                  <div className="space-y-2 sm:space-y-3">
                    {recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-2 sm:p-3 border border-border rounded-lg bg-card shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                          <div className={`p-2 sm:p-3 rounded-full ${
                            transaction.type === 'income'
                              ? 'bg-secondary border border-border'
                              : 'bg-secondary border border-border'
                          }`}>
                            {transaction.type === 'income' ? (
                              <ArrowDownLeft className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground text-sm sm:text-base truncate">{transaction.description}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">{transaction.date}</p>
                          </div>
                        </div>
                        <div className={`font-bold text-sm sm:text-base ${
                          transaction.type === 'income' ? 'text-foreground' : 'text-foreground'
                        } ml-2`}>
                          {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Financial Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
              <Card className="bg-gradient-to-br from-secondary to-secondary/80 border-border shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-t-lg">
                  <CardTitle className="text-base sm:text-lg font-bold text-center md:text-left">Financial Health</CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-3">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Credit Score</span>
                      <span className="font-bold text-foreground">{stats.creditScore}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Debt-to-Income</span>
                      <span className="font-bold text-foreground">15%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Savings Rate</span>
                      <span className="font-bold text-foreground">25%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-secondary to-secondary/80 border-border shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-t-lg">
                  <CardTitle className="text-base sm:text-lg font-bold text-center md:text-left">Investment Performance</CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-3">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Invested</span>
                      <span className="font-bold text-foreground">${stats.investments.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Return</span>
                      <span className="font-bold text-foreground">+12.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">This Month</span>
                      <span className="font-bold text-foreground">+2.1%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
            </motion.div>
          )}
        </AnimatePresence>

        <DepositModal
          open={isDepositModalOpen}
          onOpenChange={setIsDepositModalOpen}
        />

        {/* Right Sidebar */}
        <RightSidebar
          isOpen={isRightSidebarOpen}
          onClose={() => setIsRightSidebarOpen(false)}
        />

        {/* Right Sidebar Overlay for Mobile */}
        {isRightSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsRightSidebarOpen(false)}
          />
        )}

        <SectionFooter section="main" activePage="/home" />
      </ResponsiveSidebarLayout>
    </SidebarProvider>
  )
}
