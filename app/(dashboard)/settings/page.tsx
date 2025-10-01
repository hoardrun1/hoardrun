'use client'

import { useState } from 'react'
import { DepositModal } from '@/components/deposit-modal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  Settings as SettingsIcon, 
  Bell, 
  Globe, 
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
import { SectionFooter } from '@/components/ui/section-footer'

export default function SettingsPage() {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const { theme, setTheme } = useTheme()
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
      language: 'en',
      currency: 'USD',
      timezone: 'UTC-5'
    }
  })
  const { addToast } = useToast()

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }))
    
    addToast({
      title: "Setting Updated",
      description: "Your preference has been saved.",
    })
  }

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme)
    addToast({
      title: "Theme Updated",
      description: `Switched to ${newTheme} mode.`,
    })
  }

  return (
    <div className="dashboard-content">
      {/* Header */}
      <div className="dashboard-section">
        <div className="text-center lg:text-left">
          <h1 className="heading-primary">Settings</h1>
          <p className="text-subtle mt-2">
            Customize your app experience and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="dashboard-section">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 card-enhanced p-1">
          <TabsTrigger value="general" className="text-xs sm:text-sm">General</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs sm:text-sm">Notifications</TabsTrigger>
          <TabsTrigger value="privacy" className="text-xs sm:text-sm">Privacy</TabsTrigger>
          <TabsTrigger value="account" className="text-xs sm:text-sm">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="dashboard-section">
          <div className="card-enhanced overflow-hidden">
            <div className="card-primary p-4 -m-px rounded-t-xl">
              <h3 className="heading-tertiary text-primary-foreground">Appearance</h3>
              <p className="text-sm text-primary-foreground/80 mt-1">
                Customize how the app looks and feels
              </p>
            </div>
            <div className="p-4 sm:p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Theme</Label>
                  <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                </div>
                <Select
                  value={theme}
                  onValueChange={(value: 'light' | 'dark') => handleThemeChange(value)}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center">
                        <Sun className="h-4 w-4 mr-2" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center">
                        <Moon className="h-4 w-4 mr-2" />
                        Dark
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Language</Label>
                  <p className="text-sm text-muted-foreground">Select your preferred language</p>
                </div>
                <Select 
                  value={settings.preferences.language} 
                  onValueChange={(value) => handleSettingChange('preferences', 'language', value)}
                >
                  <SelectTrigger className="w-[180px] ">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Currency</Label>
                  <p className="text-sm text-muted-foreground">Default currency for transactions</p>
                </div>
                <Select 
                  value={settings.preferences.currency} 
                  onValueChange={(value) => handleSettingChange('preferences', 'currency', value)}
                >
                  <SelectTrigger className="w-[180px] ">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="dashboard-section">
          <div className="card-enhanced overflow-hidden">
            <div className="card-primary p-4 -m-px rounded-t-xl">
              <h3 className="heading-tertiary text-primary-foreground">Notification Preferences</h3>
              <p className="text-sm text-primary-foreground/80 mt-1">
                Choose how and when you want to be notified
              </p>
            </div>
            <div className="p-4 sm:p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-surface">
                    <Mail className="h-5 w-5 text-foreground" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => handleSettingChange('notifications', 'email', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-surface">
                    <Smartphone className="h-5 w-5 text-foreground" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified on your device</p>
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) => handleSettingChange('notifications', 'push', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-surface">
                    <Bell className="h-5 w-5 text-foreground" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-base font-medium">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive text messages for important updates</p>
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.sms}
                  onCheckedChange={(checked) => handleSettingChange('notifications', 'sms', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-surface">
                    <DollarSign className="h-5 w-5 text-foreground" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Marketing Communications</Label>
                    <p className="text-sm text-muted-foreground">Receive promotional offers and updates</p>
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.marketing}
                  onCheckedChange={(checked) => handleSettingChange('notifications', 'marketing', checked)}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="privacy" className="dashboard-section">
          <div className="card-enhanced overflow-hidden">
            <div className="card-primary p-4 -m-px rounded-t-xl">
              <h3 className="heading-tertiary text-primary-foreground">Privacy Settings</h3>
              <p className="text-sm text-primary-foreground/80 mt-1">
                Control your data and privacy preferences
              </p>
            </div>
            <div className="p-4 sm:p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground">Who can see your profile information</p>
                </div>
                <Select 
                  value={settings.privacy.profileVisibility} 
                  onValueChange={(value) => handleSettingChange('privacy', 'profileVisibility', value)}
                >
                  <SelectTrigger className="w-[180px] ">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-surface">
                    <Database className="h-5 w-5 text-foreground" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Data Sharing</Label>
                    <p className="text-sm text-muted-foreground">Allow sharing anonymized data for improvements</p>
                  </div>
                </div>
                <Switch
                  checked={settings.privacy.dataSharing}
                  onCheckedChange={(checked) => handleSettingChange('privacy', 'dataSharing', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-surface">
                    <Shield className="h-5 w-5 text-foreground" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Analytics</Label>
                    <p className="text-sm text-muted-foreground">Help improve the app with usage analytics</p>
                  </div>
                </div>
                <Switch
                  checked={settings.privacy.analytics}
                  onCheckedChange={(checked) => handleSettingChange('privacy', 'analytics', checked)}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="account" className="dashboard-section">
          <div className="card-enhanced overflow-hidden">
            <div className="card-primary p-4 -m-px rounded-t-xl">
              <h3 className="heading-tertiary text-primary-foreground">Account Management</h3>
              <p className="text-sm text-primary-foreground/80 mt-1">
                Manage your account data and preferences
              </p>
            </div>
            <div className="p-4 sm:p-6 space-y-6">
              <div className="flex items-center justify-between p-4  hover-lift">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-surface">
                    <Download className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Export Data</p>
                    <p className="text-sm text-muted-foreground">Download a copy of your account data</p>
                  </div>
                </div>
                <Button variant="outline" className="">
                  Export
                </Button>
              </div>

              <div className="flex items-center justify-between p-4  hover-lift">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-surface">
                    <Trash2 className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Delete Account</p>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                  </div>
                </div>
                <Button variant="outline" className="">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <DepositModal
        open={isDepositModalOpen}
        onOpenChange={setIsDepositModalOpen}
      />
    </div>
  )
}
