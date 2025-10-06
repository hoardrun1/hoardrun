'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTheme } from '@/contexts/ThemeContext'
import { useTranslation } from 'react-i18next'
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
  Trash2
} from 'lucide-react'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { t, i18n } = useTranslation()
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

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }))

    // Handle language change
    if (category === 'preferences' && setting === 'language') {
      i18n.changeLanguage(value)
    }
  }



  return (
    <div className="min-h-screen bg-background text-foreground px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 sm:mb-12">
        <div className="text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3">{t('settings.title')}</h1>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
            {t('settings.description')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2 bg-muted p-2 rounded-xl mb-8">
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
            <div className="bg-card border-2 border-border rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="bg-primary text-primary-foreground p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-bold">{t('settings.appearance')}</h3>
                <p className="text-sm sm:text-base text-primary-foreground/80 mt-2">
                  {t('settings.description')}
                </p>
              </div>
              <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                {/* Theme Setting */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b-2 border-border">
                  <div className="space-y-1 flex-1">
                    <Label className="text-base sm:text-lg font-semibold">{t('settings.theme')}</Label>
                    <p className="text-sm text-muted-foreground">{t('settings.themeDescription')}</p>
                  </div>
                  <Select
                    value={theme}
                    onValueChange={(value: 'light' | 'dark') => setTheme(value)}
                  >
                    <SelectTrigger className="w-full sm:w-[200px] border-2 border-border rounded-lg font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-border">
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b-2 border-border">
                  <div className="space-y-1 flex-1">
                    <Label className="text-base sm:text-lg font-semibold">{t('settings.language')}</Label>
                    <p className="text-sm text-muted-foreground">{t('settings.languageDescription')}</p>
                  </div>
                  <Select
                    value={settings.preferences.language}
                    onValueChange={(value) => handleSettingChange('preferences', 'language', value)}
                  >
                    <SelectTrigger className="w-full sm:w-[200px] border-2 border-border rounded-lg font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-border">
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
                    <SelectTrigger className="w-full sm:w-[200px] border-2 border-border rounded-lg font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-border">
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
            <div className="bg-card border-2 border-border rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="bg-primary text-primary-foreground p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-bold">{t('dashboard.settings.notificationPreferences')}</h3>
                <p className="text-sm sm:text-base text-primary-foreground/80 mt-2">
                  {t('dashboard.settings.chooseHowNotified')}
                </p>
              </div>
              <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                {/* Email Notifications */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                    <div className="p-3 rounded-xl bg-white border-2 border-black shrink-0">
                      <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-base sm:text-lg font-semibold">Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive updates via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'email', checked)}
                    className="shrink-0"
                  />
                </div>

                {/* Push Notifications */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                    <div className="p-3 rounded-xl bg-white border-2 border-black shrink-0">
                      <Smartphone className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-base sm:text-lg font-semibold">Push Notifications</Label>
                      <p className="text-sm text-gray-600">Get notified on your device</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notifications.push}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'push', checked)}
                    className="shrink-0"
                  />
                </div>

                {/* SMS Notifications */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                    <div className="p-3 rounded-xl bg-white border-2 border-black shrink-0">
                      <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-base sm:text-lg font-semibold">SMS Notifications</Label>
                      <p className="text-sm text-gray-600">Receive text messages for important updates</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notifications.sms}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'sms', checked)}
                    className="shrink-0"
                  />
                </div>

                {/* Marketing Communications */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                    <div className="p-3 rounded-xl bg-white border-2 border-black shrink-0">
                      <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-base sm:text-lg font-semibold">Marketing Communications</Label>
                      <p className="text-sm text-gray-600">Receive promotional offers and updates</p>
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
            <div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="bg-black text-white p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-bold">{t('dashboard.settings.privacySettings')}</h3>
                <p className="text-sm sm:text-base text-gray-300 mt-2">
                  {t('dashboard.settings.controlDataPrivacy')}
                </p>
              </div>
              <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                {/* Profile Visibility */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b-2 border-gray-100">
                  <div className="space-y-1 flex-1">
                    <Label className="text-base sm:text-lg font-semibold">Profile Visibility</Label>
                    <p className="text-sm text-gray-600">Who can see your profile information</p>
                  </div>
                  <Select 
                    value={settings.privacy.profileVisibility} 
                    onValueChange={(value) => handleSettingChange('privacy', 'profileVisibility', value)}
                  >
                    <SelectTrigger className="w-full sm:w-[200px] border-2 border-black rounded-lg font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-black">
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Data Sharing */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b-2 border-gray-100">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                    <div className="p-3 rounded-xl bg-gray-50 border-2 border-black shrink-0">
                      <Database className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-base sm:text-lg font-semibold">Data Sharing</Label>
                      <p className="text-sm text-gray-600">Allow sharing anonymized data for improvements</p>
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
                    <div className="p-3 rounded-xl bg-gray-50 border-2 border-black shrink-0">
                      <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-base sm:text-lg font-semibold">Analytics</Label>
                      <p className="text-sm text-gray-600">Help improve the app with usage analytics</p>
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
            <div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="bg-black text-white p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-bold">{t('dashboard.settings.accountManagement')}</h3>
                <p className="text-sm sm:text-base text-gray-300 mt-2">
                  {t('dashboard.settings.manageAccountData')}
                </p>
              </div>
              <div className="p-4 sm:p-6 lg:p-8 space-y-4">
                {/* {t('dashboard.settings.exportData')} */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 rounded-xl bg-gray-50 border-2 border-gray-200 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                    <div className="p-3 rounded-xl bg-white border-2 border-black shrink-0">
                      <Download className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-base sm:text-lg">{t('dashboard.settings.exportData')}</p>
                      <p className="text-sm text-gray-600 mt-1">{t('dashboard.settings.downloadAccountData')}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto border-2 border-black hover:bg-black hover:text-white font-semibold transition-all shrink-0"
                  >
                    Export
                  </Button>
                </div>

                {/* {t('dashboard.settings.deleteAccount')} */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 rounded-xl bg-gray-50 border-2 border-gray-200 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                    <div className="p-3 rounded-xl bg-white border-2 border-black shrink-0">
                      <Trash2 className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-base sm:text-lg">{t('dashboard.settings.deleteAccount')}</p>
                      <p className="text-sm text-gray-600 mt-1">{t('dashboard.settings.permanentlyDeleteAccount')}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto border-2 border-black hover:bg-black hover:text-white font-semibold transition-all shrink-0"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}