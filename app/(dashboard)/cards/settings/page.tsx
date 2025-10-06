'use client'

import { useState } from 'react'
import { Settings, Bell, Shield, DollarSign, CreditCard, Lock, Wifi, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function CardsSettingsPage() {
  const [activeTab, setActiveTab] = useState('defaults')
  const [settings, setSettings] = useState({
    defaults: {
      autoLock: true,
      contactlessEnabled: true,
      defaultNetwork: 'visa'
    },
    security: {
      requirePin: true,
      biometricAuth: false,
      transactionAlerts: true
    },
    limits: {
      dailyLimit: 1000,
      monthlyLimit: 5000,
      singleTransactionLimit: 500
    },
    notifications: {
      cardLocked: true,
      lowBalance: true,
      largeTransaction: true,
      newCard: true
    }
  })

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }))
  }

  const tabs = [
    { id: 'defaults', label: 'Defaults', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'limits', label: 'Limits', icon: DollarSign },
    { id: 'notifications', label: 'Alerts', icon: Bell }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="py-4 sm:py-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-muted/50 border border-border">
                <Settings className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Card Settings</h1>
              </div>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground ml-14">
              Manage your card preferences and security settings
            </p>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="sticky top-16 sm:top-20 z-20 bg-background border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap text-sm sm:text-base ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-10">
        {/* Defaults Tab */}
        {activeTab === 'defaults' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="bg-card rounded-xl sm:rounded-2xl border-2 border-border shadow-md overflow-hidden">
              <div className="bg-primary text-primary-foreground p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold">Default Card Settings</h3>
                <p className="text-sm sm:text-base text-primary-foreground/80 mt-1">
                  Set default preferences for new cards
                </p>
              </div>

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Auto-lock Cards */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 rounded-xl bg-muted/50 border border-border hover:border-border/80 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-card border border-border flex-shrink-0">
                      <Lock className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-foreground">Auto-lock Cards</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">Automatically lock cards after inactivity</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSettingChange('defaults', 'autoLock', !settings.defaults.autoLock)}
                    className={`relative inline-flex h-7 w-12 sm:w-14 items-center rounded-full transition-colors flex-shrink-0 ${
                      settings.defaults.autoLock ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-background transition-transform shadow-md ${
                        settings.defaults.autoLock ? 'translate-x-7 sm:translate-x-8' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Contactless Enabled */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 rounded-xl bg-muted/50 border border-border hover:border-border/80 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-card border border-border flex-shrink-0">
                      <Wifi className="h-5 w-5 text-foreground rotate-90" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-foreground">Contactless Enabled</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">Enable contactless payments by default</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSettingChange('defaults', 'contactlessEnabled', !settings.defaults.contactlessEnabled)}
                    className={`relative inline-flex h-7 w-12 sm:w-14 items-center rounded-full transition-colors flex-shrink-0 ${
                      settings.defaults.contactlessEnabled ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-background transition-transform shadow-md ${
                        settings.defaults.contactlessEnabled ? 'translate-x-7 sm:translate-x-8' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Default Network */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 rounded-xl bg-muted/50 border border-border hover:border-border/80 transition-all">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-card border border-border flex-shrink-0">
                      <CreditCard className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-foreground">Default Network</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">Preferred card network for new cards</p>
                    </div>
                  </div>
                  <select
                    value={settings.defaults.defaultNetwork}
                    onChange={(e) => handleSettingChange('defaults', 'defaultNetwork', e.target.value)}
                    className="w-full sm:w-48 px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground font-medium focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                  >
                    <option value="visa">Visa</option>
                    <option value="mastercard">Mastercard</option>
                    <option value="american_express">American Express</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="bg-card rounded-xl sm:rounded-2xl border-2 border-border shadow-md overflow-hidden">
              <div className="bg-primary text-primary-foreground p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold">Security Settings</h3>
                <p className="text-sm sm:text-base text-primary-foreground/80 mt-1">
                  Protect your cards with additional security measures
                </p>
              </div>

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Require PIN */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 rounded-xl bg-muted/50 border border-border hover:border-border/80 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-card border border-border flex-shrink-0">
                      <Shield className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-foreground">Require PIN</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">Require PIN for all transactions</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSettingChange('security', 'requirePin', !settings.security.requirePin)}
                    className={`relative inline-flex h-7 w-12 sm:w-14 items-center rounded-full transition-colors flex-shrink-0 ${
                      settings.security.requirePin ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-background transition-transform shadow-md ${
                        settings.security.requirePin ? 'translate-x-7 sm:translate-x-8' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Biometric Auth */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 rounded-xl bg-muted/50 border border-border hover:border-border/80 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-card border border-border flex-shrink-0">
                      <CreditCard className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-foreground">Biometric Authentication</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">Use fingerprint or face ID for card access</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSettingChange('security', 'biometricAuth', !settings.security.biometricAuth)}
                    className={`relative inline-flex h-7 w-12 sm:w-14 items-center rounded-full transition-colors flex-shrink-0 ${
                      settings.security.biometricAuth ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-background transition-transform shadow-md ${
                        settings.security.biometricAuth ? 'translate-x-7 sm:translate-x-8' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Transaction Alerts */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 rounded-xl bg-muted/50 border border-border hover:border-border/80 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-card border border-border flex-shrink-0">
                      <Bell className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-foreground">Transaction Alerts</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">Get notified of all card transactions</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSettingChange('security', 'transactionAlerts', !settings.security.transactionAlerts)}
                    className={`relative inline-flex h-7 w-12 sm:w-14 items-center rounded-full transition-colors flex-shrink-0 ${
                      settings.security.transactionAlerts ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-background transition-transform shadow-md ${
                        settings.security.transactionAlerts ? 'translate-x-7 sm:translate-x-8' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Limits Tab */}
        {activeTab === 'limits' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="bg-card rounded-xl sm:rounded-2xl border-2 border-border shadow-md overflow-hidden">
              <div className="bg-primary text-primary-foreground p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold">Spending Limits</h3>
                <p className="text-sm sm:text-base text-primary-foreground/80 mt-1">
                  Set limits to control your spending
                </p>
              </div>

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Daily Limit */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 rounded-xl bg-muted/50 border border-border hover:border-border/80 transition-all">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-card border border-border flex-shrink-0">
                      <DollarSign className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-foreground">Daily Limit</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">Maximum spending per day</p>
                    </div>
                  </div>
                  <select
                    value={settings.limits.dailyLimit}
                    onChange={(e) => handleSettingChange('limits', 'dailyLimit', parseInt(e.target.value))}
                    className="w-full sm:w-48 px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground font-medium focus:outline-none focus:border-primary transition-all"
                  >
                    <option value="500">$500</option>
                    <option value="1000">$1,000</option>
                    <option value="2000">$2,000</option>
                    <option value="5000">$5,000</option>
                  </select>
                </div>

                {/* Monthly Limit */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 rounded-xl bg-muted/50 border border-border hover:border-border/80 transition-all">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-card border border-border flex-shrink-0">
                      <DollarSign className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-foreground">Monthly Limit</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">Maximum spending per month</p>
                    </div>
                  </div>
                  <select
                    value={settings.limits.monthlyLimit}
                    onChange={(e) => handleSettingChange('limits', 'monthlyLimit', parseInt(e.target.value))}
                    className="w-full sm:w-48 px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground font-medium focus:outline-none focus:border-primary transition-all"
                  >
                    <option value="2000">$2,000</option>
                    <option value="5000">$5,000</option>
                    <option value="10000">$10,000</option>
                    <option value="20000">$20,000</option>
                  </select>
                </div>

                {/* Single Transaction Limit */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 rounded-xl bg-muted/50 border border-border hover:border-border/80 transition-all">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-card border border-border flex-shrink-0">
                      <DollarSign className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-foreground">Single Transaction Limit</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">Maximum per transaction</p>
                    </div>
                  </div>
                  <select
                    value={settings.limits.singleTransactionLimit}
                    onChange={(e) => handleSettingChange('limits', 'singleTransactionLimit', parseInt(e.target.value))}
                    className="w-full sm:w-48 px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground font-medium focus:outline-none focus:border-primary transition-all"
                  >
                    <option value="100">$100</option>
                    <option value="250">$250</option>
                    <option value="500">$500</option>
                    <option value="1000">$1,000</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="bg-card rounded-xl sm:rounded-2xl border-2 border-border shadow-md overflow-hidden">
              <div className="bg-primary text-primary-foreground p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold">Notification Preferences</h3>
                <p className="text-sm sm:text-base text-primary-foreground/80 mt-1">
                  Choose when to receive card-related notifications
                </p>
              </div>

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Card Locked */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 rounded-xl bg-muted/50 border border-border hover:border-border/80 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-card border border-border flex-shrink-0">
                      <Lock className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-foreground">Card Locked/Unlocked</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">Notify when card status changes</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSettingChange('notifications', 'cardLocked', !settings.notifications.cardLocked)}
                    className={`relative inline-flex h-7 w-12 sm:w-14 items-center rounded-full transition-colors flex-shrink-0 ${
                      settings.notifications.cardLocked ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-background transition-transform shadow-md ${
                        settings.notifications.cardLocked ? 'translate-x-7 sm:translate-x-8' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Low Balance */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 rounded-xl bg-muted/50 border border-border hover:border-border/80 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-card border border-border flex-shrink-0">
                      <DollarSign className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-foreground">Low Balance Alerts</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">Alert when balance is low</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSettingChange('notifications', 'lowBalance', !settings.notifications.lowBalance)}
                    className={`relative inline-flex h-7 w-12 sm:w-14 items-center rounded-full transition-colors flex-shrink-0 ${
                      settings.notifications.lowBalance ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-background transition-transform shadow-md ${
                        settings.notifications.lowBalance ? 'translate-x-7 sm:translate-x-8' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Large Transaction */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 rounded-xl bg-muted/50 border border-border hover:border-border/80 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-card border border-border flex-shrink-0">
                      <CreditCard className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-foreground">Large Transactions</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">Notify for transactions over $100</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSettingChange('notifications', 'largeTransaction', !settings.notifications.largeTransaction)}
                    className={`relative inline-flex h-7 w-12 sm:w-14 items-center rounded-full transition-colors flex-shrink-0 ${
                      settings.notifications.largeTransaction ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-background transition-transform shadow-md ${
                        settings.notifications.largeTransaction ? 'translate-x-7 sm:translate-x-8' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* New Card */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 rounded-xl bg-muted/50 border border-border hover:border-border/80 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-card border border-border flex-shrink-0">
                      <Settings className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-foreground">New Card Issued</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">Notify when a new card is issued</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSettingChange('notifications', 'newCard', !settings.notifications.newCard)}
                    className={`relative inline-flex h-7 w-12 sm:w-14 items-center rounded-full transition-colors flex-shrink-0 ${
                      settings.notifications.newCard ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-background transition-transform shadow-md ${
                        settings.notifications.newCard ? 'translate-x-7 sm:translate-x-8' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}