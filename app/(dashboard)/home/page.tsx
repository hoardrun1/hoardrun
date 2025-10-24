"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import { motion } from "framer-motion"

import { DepositModal } from "@/components/deposit-modal"
import { Button } from "@/components/ui/button"
import { useNotifications } from "@/contexts/NotificationContext"
import { apiClient, type DashboardData, type Transaction } from "@/lib/api-client"
import { useApiCache } from "@/lib/api-cache"
import {
  TrendingUp,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  Target,
  Calendar,
  Bell,
  Activity,
  Wallet,
} from "lucide-react"

export default function HomePage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { addNotification } = useNotifications()
  const apiCache = useApiCache()
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch dashboard data from API with caching
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const cacheKey = "dashboard-data"
        const cachedData = apiCache.get<DashboardData>(cacheKey)

        if (cachedData) {
          setDashboardData(cachedData)
          setIsLoading(false)
          return
        }

        const response = await apiClient.getDashboard()

        if (response.error) {
          throw new Error(response.error)
        }

        if (response.data) {
          setDashboardData(response.data)
          apiCache.set(cacheKey, response.data, 2 * 60 * 1000)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch dashboard data")
        console.error("Dashboard fetch error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [apiCache])

  const stats = {
    totalBalance: dashboardData?.balance || 0,
    monthlyIncome: dashboardData?.total_income || 0,
    monthlyExpenses: dashboardData?.total_expenses || 0,
    savings: dashboardData?.savings_goals?.reduce((total, goal) => total + (goal.current_amount || 0), 0) || 0,
    investments: dashboardData?.investments?.reduce((total, inv) => total + inv.amount, 0) || 0,
    creditScore: 750,
  }

  const recentTransactions: Transaction[] = dashboardData?.recent_transactions || []

  const handleQuickAction = (action: { href?: string; action?: () => void }) => {
    if (action.href) {
      router.push(action.href)
    } else if (action.action) {
      action.action()
    }
  }

  const testNotifications = () => {
    // No demo notifications
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  return (
    <motion.div
      className="min-h-screen w-full pb-6 sm:pb-8 lg:pb-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-full mx-auto px-3 sm:px-6 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Hero Balance Card - Mobile Optimized */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-lg sm:rounded-2xl lg:rounded-3xl bg-gradient-to-br from-black to-gray-900 dark:from-white dark:to-gray-100 p-5 sm:p-8 lg:p-12 text-center shadow-lg sm:shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent dark:via-black/5"></div>
          <div className="relative z-10 space-y-2 sm:space-y-4 lg:space-y-6">
            <motion.p
              className="text-white/70 dark:text-black/70 text-xs sm:text-sm lg:text-base font-medium tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {t("dashboard.home.totalBalance")}
            </motion.p>
            <motion.h1
              className="text-3xl sm:text-5xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-white dark:text-black"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              ${stats.totalBalance.toLocaleString()}
            </motion.h1>
            <motion.div
              className="flex items-center justify-center space-x-1 sm:space-x-2 text-white/80 dark:text-black/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              <p className="text-xs sm:text-sm lg:text-base font-medium">
                {t("dashboard.home.fromLastMonth", { percent: "+2.5%" })}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Quick Actions - Mobile Optimized */}
        <motion.div variants={itemVariants} className="space-y-2 sm:space-y-4">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black dark:text-white text-center lg:text-left px-1">
            {t("dashboard.home.quickActions")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
            {[
              { label: t("dashboard.home.send"), href: "/send", icon: ArrowUpRight, gradient: true },
              { label: t("dashboard.home.addMoney"), action: () => setIsDepositModalOpen(true), icon: ArrowDownLeft },
              { label: t("dashboard.home.cards"), href: "/cards", icon: CreditCard },
              { label: t("dashboard.home.invest"), href: "/investment", icon: TrendingUp },
              { label: t("dashboard.home.save"), href: "/savings", icon: Target },
            ].map((action, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  className={`w-full h-20 sm:h-28 lg:h-36 flex flex-col items-center justify-center space-y-1.5 sm:space-y-2 lg:space-y-3 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md sm:shadow-lg transition-all duration-300 ${
                    action.gradient
                      ? "bg-black dark:bg-white text-white dark:text-black hover:shadow-lg sm:hover:shadow-2xl"
                      : "bg-gray-100 dark:bg-gray-900 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 hover:shadow-md sm:hover:shadow-xl"
                  }`}
                  onClick={() => handleQuickAction(action)}
                >
                  <action.icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                  <span className="text-xs sm:text-sm lg:text-base font-semibold text-center leading-tight">
                    {action.label}
                  </span>
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Secondary Actions - Mobile Optimized */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
          {[
            { label: t("dashboard.home.analytics"), href: "/analytics", icon: Activity },
            { label: t("dashboard.home.notifications"), action: testNotifications, icon: Bell },
            { label: t("dashboard.home.help"), href: "/help", icon: Calendar },
          ].map((action, index) => (
            <motion.div key={index} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="ghost"
                className="w-full h-16 sm:h-20 lg:h-24 flex flex-col items-center justify-center space-y-1 sm:space-y-2 rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-300"
                onClick={() => handleQuickAction(action)}
              >
                <action.icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                <span className="text-xs sm:text-sm font-medium text-center leading-tight">{action.label}</span>
              </Button>
            </motion.div>
          ))}
        </motion.div>

        {/* Financial Overview Grid - Mobile Optimized */}
        <motion.div variants={itemVariants} className="space-y-2 sm:space-y-4">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black dark:text-white px-1">
            {t("dashboard.home.financialOverview")}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-5">
            {[
              { label: t("dashboard.home.balance"), value: stats.totalBalance, icon: Wallet, change: "+2.5%" },
              { label: t("dashboard.home.savings"), value: stats.savings, icon: PiggyBank, change: "+8%" },
              {
                label: t("dashboard.home.netWorth"),
                value: stats.totalBalance + stats.investments,
                icon: TrendingUp,
                change: "+15%",
              },
              { label: t("dashboard.home.portfolio"), value: stats.investments, icon: Activity, change: "+12.5%" },
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.03, y: -3 }}
                className="relative overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-3 sm:p-4 lg:p-6 shadow-md sm:shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-black/5 dark:bg-white/5 rounded-full -mr-8 sm:-mr-12 -mt-8 sm:-mt-12"></div>
                <div className="relative z-10 space-y-2 sm:space-y-3 lg:space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                      {item.label}
                    </span>
                    <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-gray-400 dark:text-gray-600" />
                  </div>
                  <div className="text-lg sm:text-xl lg:text-3xl font-bold text-black dark:text-white">
                    ${item.value.toLocaleString()}
                  </div>
                  <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">
                    {t("dashboard.home.fromLastMonth", { percent: item.change })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Transactions & Financial Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Recent Transactions */}
          <motion.div variants={itemVariants} className="space-y-2 sm:space-y-4">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black dark:text-white px-1">
              {t("dashboard.home.recentTransactions")}
            </h2>
            <div className="rounded-lg sm:rounded-xl lg:rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 overflow-hidden shadow-md sm:shadow-lg">
              <div className="bg-black dark:bg-white p-3 sm:p-4 lg:p-5">
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-white dark:text-black">
                  {t("dashboard.home.latestActivity")}
                </h3>
              </div>
              <div className="p-3 sm:p-4 lg:p-5 space-y-2 sm:space-y-3">
                {recentTransactions.length > 0 ? (
                  recentTransactions.slice(0, 5).map((transaction) => (
                    <motion.div
                      key={transaction.id}
                      whileHover={{ x: 5 }}
                      className="flex items-center justify-between p-2 sm:p-3 lg:p-4 bg-white dark:bg-gray-800 rounded-lg sm:rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-1 min-w-0">
                        <div
                          className={`p-1.5 sm:p-2 lg:p-3 rounded-full ${transaction.type === "DEPOSIT" ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"}`}
                        >
                          {transaction.type === "DEPOSIT" ? (
                            <ArrowDownLeft className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs sm:text-sm lg:text-base text-black dark:text-white truncate">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`font-bold text-xs sm:text-sm lg:text-base ml-2 whitespace-nowrap ${transaction.type === "DEPOSIT" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                      >
                        {transaction.type === "DEPOSIT" ? "+" : "-"}${Math.abs(transaction.amount).toLocaleString()}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 sm:py-12 lg:py-16">
                    <Wallet className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16 mx-auto text-gray-300 dark:text-gray-700 mb-2 sm:mb-4" />
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium">
                      {t("dashboard.home.noRecentTransactions")}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                      {t("dashboard.home.transactionsWillAppear")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Financial Health & Investment Performance */}
          <motion.div variants={itemVariants} className="space-y-4 sm:space-y-6">
            {/* Financial Health */}
            <div className="space-y-2 sm:space-y-4">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black dark:text-white px-1">
                {t("dashboard.home.financialHealth")}
              </h2>
              <div className="rounded-lg sm:rounded-xl lg:rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 overflow-hidden shadow-md sm:shadow-lg">
                <div className="bg-black dark:bg-white p-3 sm:p-4 lg:p-5">
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-white dark:text-black">
                    {t("dashboard.home.healthMetrics")}
                  </h3>
                </div>
                <div className="p-3 sm:p-4 lg:p-5 space-y-2 sm:space-y-3">
                  {[
                    { label: t("dashboard.home.creditScore"), value: stats.creditScore },
                    { label: t("dashboard.home.debtToIncome"), value: "15%" },
                    { label: t("dashboard.home.savingsRate"), value: "25%" },
                  ].map((metric, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 sm:p-3 lg:p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <span className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400">
                        {metric.label}
                      </span>
                      <span className="font-bold text-sm sm:text-base lg:text-lg text-black dark:text-white">
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Investment Performance */}
            <div className="space-y-2 sm:space-y-4">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black dark:text-white px-1">
                {t("dashboard.home.investmentPerformance")}
              </h2>
              <div className="rounded-lg sm:rounded-xl lg:rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 overflow-hidden shadow-md sm:shadow-lg">
                <div className="bg-black dark:bg-white p-3 sm:p-4 lg:p-5">
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-white dark:text-black">
                    {t("dashboard.home.portfolioStats")}
                  </h3>
                </div>
                <div className="p-3 sm:p-4 lg:p-5 space-y-2 sm:space-y-3">
                  {[
                    { label: t("dashboard.home.totalInvested"), value: `$${stats.investments.toLocaleString()}` },
                    { label: t("dashboard.home.totalReturn"), value: "+12.5%" },
                    { label: t("dashboard.home.thisMonth"), value: "+2.1%" },
                  ].map((metric, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 sm:p-3 lg:p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <span className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400">
                        {metric.label}
                      </span>
                      <span className="font-bold text-sm sm:text-base lg:text-lg text-black dark:text-white">
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <DepositModal open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen} />
    </motion.div>
  )
}
