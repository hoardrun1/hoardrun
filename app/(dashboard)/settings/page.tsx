'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTheme } from '@/contexts/ThemeContext'
import { useTranslation } from 'react-i18next'
import { PageHero } from '@/components/app/page-hero'
import { OrbsGraphic } from '@/components/app/home-graphics'
import { CloseAccountDialog } from '@/components/settings/close-account-dialog'
import { AppLockSetting } from '@/components/native/native-shell'
import { apiClient } from '@/lib/api-client'
import { useToast } from '@/components/ui/use-toast'
import {
  Bell,
  Moon,
  Sun,
  Smartphone,
  Mail,
  DollarSign,
  Shield,
  Database,
  Download,
  Trash2,
  IdCard
} from 'lucide-react'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { t, i18n } = useTranslation()
  const { toast } = useToast()
  const [closeOpen, setCloseOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Saves everything Hoardrun holds about you as a JSON file
  const exportData = async () => {
    setExporting(true)
    const response = await apiClient.exportAccountData()
    setExporting(false)
    if (response.error || !response.data) {
      toast({ title: "Couldn't export your data", description: response.error || 'Try again in a moment.', variant: 'destructive' })
      return
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `hoardrun-my-data-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    toast({ title: 'Your data is downloading', description: `${response.data.transactions?.length ?? 0} transactions and everything else on your account.` })
  }
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false
    },
    privacy: {
      profileVisibility: 'private',
      dataSharing: false,
      analytics: true
    },
    preferences: {
      language: i18n.language || 'en',
      currency: 'USD',
      timezone: 'UTC-5'
    }
  })

  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        language: i18n.language
      }
    }))
  }, [i18n.language])

  const [identity, setIdentity] = useState<string | null>(null)
  useEffect(() => {
    apiClient.getIdentityStatus().then((response) => setIdentity(response.data?.state ?? null))
  }, [])

  // Email choices are saved on the server; the other toggles stay on this device for now
  useEffect(() => {
    apiClient.getNotificationPrefs().then((response) => {
      if (!response.data) return
      const { email, marketing } = response.data
      setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, email, marketing } }))
    })
  }, [])

  const handleSettingChange = (category: string, setting: string, value: any) => {
    const previous = (settings as any)[category]?.[setting]
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }))

    if (category === 'notifications' && (setting === 'email' || setting === 'marketing')) {
      apiClient.updateNotificationPrefs({ [setting]: value }).then((response) => {
        if (response.error) {
          setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, [setting]: previous } }))
          toast({ title: "Couldn't save that", description: response.error, variant: 'destructive' })
          return
        }
        toast({
          title: setting === 'email' ? (value ? 'Email updates on' : 'Email updates off') : (value ? 'Product news on' : 'Product news off'),
          description: setting === 'email' && !value ? "Security emails, like a password change, still come through." : "Saved.",
        })
      })
    }

    // Handle language change
    if (category === 'preferences' && setting === 'language') {
      i18n.changeLanguage(value)
    }
  }



  return (
    <div className="space-y-4 pb-28 text-foreground sm:space-y-5 lg:pb-8">
      <PageHero
        title={t('settings.title')}
        subtitle={t('settings.description')}
        tone="sky"
        graphic={OrbsGraphic}
      />

      {/* Main Content */}
      <div>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4 w-full">
            <TabsTrigger
              value="general"
              className="text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
            >
              {t('settings.general')}
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
            >
              {t('settings.notifications')}
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
            >
              {t('settings.privacy')}
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
            >
              {t('settings.account')}
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="mt-0">
            <div className="hr-settings-card hr-rise">
              <div className="hr-settings-head p-4 sm:p-5">
                <h3 className="hr-card-title text-[20px]">{t('settings.appearance')}</h3>
                <p className="text-sm text-[#a1a1a6] mt-1">
                  {t('settings.description')}
                </p>
              </div>
              <div className="p-4 sm:p-6 space-y-5">
                {/* Theme Setting */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-white/[0.07]">
                  <div className="space-y-1 flex-1">
                    <Label className="text-base sm:text-lg font-semibold">{t('settings.theme')}</Label>
                    <p className="text-sm text-muted-foreground">{t('settings.themeDescription')}</p>
                  </div>
                  <Select
                    value={theme}
                    onValueChange={(value: 'light' | 'dark') => setTheme(value)}
                  >
                    <SelectTrigger className="w-full sm:w-[200px] border border-white/10 rounded-xl font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent >
                      <SelectItem value="light">
                        <div className="flex items-center">
                          <Sun className="h-4 w-4 mr-2" />
                          {t('settings.light')}
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center">
                          <Moon className="h-4 w-4 mr-2" />
                          {t('settings.dark')}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Language Setting */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-white/[0.07]">
                  <div className="space-y-1 flex-1">
                    <Label className="text-base sm:text-lg font-semibold">{t('settings.language')}</Label>
                    <p className="text-sm text-muted-foreground">{t('settings.languageDescription')}</p>
                  </div>
                  <Select
                    value={settings.preferences.language}
                    onValueChange={(value) => handleSettingChange('preferences', 'language', value)}
                  >
                    <SelectTrigger className="w-full sm:w-[200px] border border-white/10 rounded-xl font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent >
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="af">Afrikaans</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="hi">हिन्दी</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="sw">Kiswahili</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Currency Setting */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <Label className="text-base sm:text-lg font-semibold">{t('settings.currency')}</Label>
                    <p className="text-sm text-muted-foreground">{t('settings.currencyDescription')}</p>
                  </div>
                  <Select
                    value={settings.preferences.currency}
                    onValueChange={(value) => handleSettingChange('preferences', 'currency', value)}
                  >
                    <SelectTrigger className="w-full sm:w-[200px] border border-white/10 rounded-xl font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent >
                      <SelectItem value="USD">{t('settings.usd')}</SelectItem>
                      <SelectItem value="EUR">{t('settings.eur')}</SelectItem>
                      <SelectItem value="GBP">{t('settings.gbp')}</SelectItem>
                      <SelectItem value="JPY">{t('settings.jpy')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-0">
            <div className="hr-settings-card hr-rise">
              <div className="hr-settings-head p-4 sm:p-5" data-tone="amber">
                <h3 className="hr-card-title text-[20px]">{t('dashboard.settings.notificationPreferences')}</h3>
                <p className="text-sm text-[#a1a1a6] mt-1">
                  {t('dashboard.settings.chooseHowNotified')}
                </p>
              </div>
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-6">
                {/* Email Notifications */}
                <div className="flex items-center justify-between gap-4 hr-settings-row">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                    <div className="hr-settings-row-icon">
                      <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-base sm:text-lg font-semibold">Email Notifications</Label>
                      <p className="text-sm text-[#a1a1a6]">Receive updates via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'email', checked)}
                    className="shrink-0"
                  />
                </div>

                {/* Push Notifications */}
                <div className="flex items-center justify-between gap-4 hr-settings-row">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                    <div className="hr-settings-row-icon">
                      <Smartphone className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-base sm:text-lg font-semibold">Push Notifications</Label>
                      <p className="text-sm text-[#a1a1a6]">Get notified on your device</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notifications.push}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'push', checked)}
                    className="shrink-0"
                  />
                </div>

                {/* SMS Notifications */}
                <div className="flex items-center justify-between gap-4 hr-settings-row">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                    <div className="hr-settings-row-icon">
                      <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-base sm:text-lg font-semibold">SMS Notifications</Label>
                      <p className="text-sm text-[#a1a1a6]">Receive text messages for important updates</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notifications.sms}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'sms', checked)}
                    className="shrink-0"
                  />
                </div>

                {/* Marketing Communications */}
                <div className="flex items-center justify-between gap-4 hr-settings-row">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                    <div className="hr-settings-row-icon">
                      <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-base sm:text-lg font-semibold">Marketing Communications</Label>
                      <p className="text-sm text-[#a1a1a6]">Receive promotional offers and updates</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notifications.marketing}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'marketing', checked)}
                    className="shrink-0"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="mt-0">
            <div className="hr-settings-card hr-rise">
              <div className="hr-settings-head p-4 sm:p-5" data-tone="mint">
                <h3 className="hr-card-title text-[20px]">{t('dashboard.settings.privacySettings')}</h3>
                <p className="text-sm text-[#a1a1a6] mt-1">
                  {t('dashboard.settings.controlDataPrivacy')}
                </p>
              </div>
              <div className="p-4 sm:p-6 space-y-5">
                {/* Profile Visibility */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/[0.07]">
                  <div className="space-y-1 flex-1">
                    <Label className="text-base sm:text-lg font-semibold">Profile Visibility</Label>
                    <p className="text-sm text-[#a1a1a6]">Who can see your profile information</p>
                  </div>
                  <Select 
                    value={settings.privacy.profileVisibility} 
                    onValueChange={(value) => handleSettingChange('privacy', 'profileVisibility', value)}
                  >
                    <SelectTrigger className="w-full sm:w-[200px] border border-white/10 rounded-xl font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent >
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Data Sharing */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/[0.07]">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                    <div className="hr-settings-row-icon">
                      <Database className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-base sm:text-lg font-semibold">Data Sharing</Label>
                      <p className="text-sm text-[#a1a1a6]">Allow sharing anonymized data for improvements</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.privacy.dataSharing}
                    onCheckedChange={(checked) => handleSettingChange('privacy', 'dataSharing', checked)}
                    className="shrink-0"
                  />
                </div>

                {/* Analytics */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                    <div className="hr-settings-row-icon">
                      <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-base sm:text-lg font-semibold">Analytics</Label>
                      <p className="text-sm text-[#a1a1a6]">Help improve the app with usage analytics</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.privacy.analytics}
                    onCheckedChange={(checked) => handleSettingChange('privacy', 'analytics', checked)}
                    className="shrink-0"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="mt-0">
            <div className="hr-settings-card hr-rise">
              <div className="hr-settings-head p-4 sm:p-5" data-tone="coral">
                <h3 className="hr-card-title text-[20px]">{t('dashboard.settings.accountManagement')}</h3>
                <p className="text-sm text-[#a1a1a6] mt-1">
                  {t('dashboard.settings.manageAccountData')}
                </p>
              </div>
              <div className="p-3 sm:p-4 space-y-2">
                {/* Face ID / fingerprint lock; only shown in the phone apps */}
                <AppLockSetting />

                {/* Identity check (Persona); needed before money can be sent or withdrawn */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 hr-settings-row">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                    <div className="hr-settings-row-icon">
                      <IdCard className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-base sm:text-lg">Identity verification</p>
                      <p className="text-sm text-[#a1a1a6] mt-1">
                        {identity === 'verified' ? 'Verified' : identity === 'in_review' ? 'Being reviewed' : identity === 'in_progress' ? 'Started, not finished' : identity === 'declined' ? "Didn't go through. You can try again." : 'Needed to send money and withdraw'}
                      </p>
                    </div>
                  </div>
                  {identity !== 'verified' && (
                    <Button asChild variant="outline" className="w-full sm:w-auto rounded-full border border-white/15 font-medium shrink-0">
                      <Link href="/face-verification">{identity === 'in_review' ? 'View' : identity === 'in_progress' ? 'Continue' : 'Verify'}</Link>
                    </Button>
                  )}
                </div>

                {/* {t('dashboard.settings.exportData')} */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 hr-settings-row">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                    <div className="hr-settings-row-icon">
                      <Download className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-base sm:text-lg">{t('dashboard.settings.exportData')}</p>
                      <p className="text-sm text-[#a1a1a6] mt-1">{t('dashboard.settings.downloadAccountData')}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={exportData}
                    disabled={exporting}
                    className="w-full sm:w-auto rounded-full border border-white/15 font-medium shrink-0"
                  >
                    {exporting ? 'Preparing…' : 'Export'}
                  </Button>
                </div>

                {/* {t('dashboard.settings.deleteAccount')} */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 hr-settings-row">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                    <div className="hr-settings-row-icon">
                      <Trash2 className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-base sm:text-lg">{t('dashboard.settings.deleteAccount')}</p>
                      <p className="text-sm text-[#a1a1a6] mt-1">{t('dashboard.settings.permanentlyDeleteAccount')}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setCloseOpen(true)}
                    className="w-full sm:w-auto rounded-full border border-[#fb7185]/40 font-medium text-[#fb7185] shrink-0"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <CloseAccountDialog open={closeOpen} onOpenChange={setCloseOpen} onExport={exportData} />
    </div>
  )
}