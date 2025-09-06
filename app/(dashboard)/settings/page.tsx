'use client'

import { useState } from 'react'
import { SidebarProvider, ResponsiveSidebarLayout } from '@/components/ui/sidebar-layout'
import { SidebarContent } from '@/components/ui/sidebar-content'
import { SidebarToggle } from '@/components/ui/sidebar-toggle'
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
    <SidebarProvider>
      <ResponsiveSidebarLayout
        sidebar={<SidebarContent onAddMoney={() => setIsDepositModalOpen(true)} />}
      >
        <SidebarToggle />
        <div className="min-h-screen bg-background pt-16 pb-20 px-4 sm:pt-20 sm:pb-24 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Settings
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  Customize your app experience and preferences
                </p>
              </div>
            </div>

            <Tabs defaultValue="general" className="space-y-4 sm:space-y-6">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                <TabsTrigger value="general" className="text-xs sm:text-sm">General</TabsTrigger>
                <TabsTrigger value="notifications" className="text-xs sm:text-sm">Notifications</TabsTrigger>
                <TabsTrigger value="privacy" className="text-xs sm:text-sm">Privacy</TabsTrigger>
                <TabsTrigger value="account" className="text-xs sm:text-sm">Account</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Customize how the app looks and feels
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Theme</Label>
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
                      <div className="space-y-0.5">
                        <Label>Language</Label>
                        <p className="text-sm text-muted-foreground">Select your preferred language</p>
                      </div>
                      <Select 
                        value={settings.preferences.language} 
                        onValueChange={(value) => handleSettingChange('preferences', 'language', value)}
                      >
                        <SelectTrigger className="w-[180px]">
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
                      <div className="space-y-0.5">
                        <Label>Currency</Label>
                        <p className="text-sm text-muted-foreground">Default currency for transactions</p>
                      </div>
                      <Select 
                        value={settings.preferences.currency} 
                        onValueChange={(value) => handleSettingChange('preferences', 'currency', value)}
                      >
                        <SelectTrigger className="w-[180px]">
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
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Choose how and when you want to be notified
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-foreground" />
                        <div className="space-y-0.5">
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive updates via email</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.notifications.email}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'email', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="h-5 w-5 text-foreground" />
                        <div className="space-y-0.5">
                          <Label>Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">Get notified on your device</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.notifications.push}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'push', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Bell className="h-5 w-5 text-foreground" />
                        <div className="space-y-0.5">
                          <Label>SMS Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive text messages for important updates</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.notifications.sms}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'sms', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="h-5 w-5 text-foreground" />
                        <div className="space-y-0.5">
                          <Label>Marketing Communications</Label>
                          <p className="text-sm text-muted-foreground">Receive promotional offers and updates</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.notifications.marketing}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'marketing', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="privacy" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Control your data and privacy preferences
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Profile Visibility</Label>
                        <p className="text-sm text-muted-foreground">Who can see your profile information</p>
                      </div>
                      <Select 
                        value={settings.privacy.profileVisibility} 
                        onValueChange={(value) => handleSettingChange('privacy', 'profileVisibility', value)}
                      >
                        <SelectTrigger className="w-[180px]">
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
                      <div className="flex items-center space-x-3">
                        <Database className="h-5 w-5 text-foreground" />
                        <div className="space-y-0.5">
                          <Label>Data Sharing</Label>
                          <p className="text-sm text-muted-foreground">Allow sharing anonymized data for improvements</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.privacy.dataSharing}
                        onCheckedChange={(checked) => handleSettingChange('privacy', 'dataSharing', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-foreground" />
                        <div className="space-y-0.5">
                          <Label>Analytics</Label>
                          <p className="text-sm text-muted-foreground">Help improve the app with usage analytics</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.privacy.analytics}
                        onCheckedChange={(checked) => handleSettingChange('privacy', 'analytics', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="account" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Management</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Manage your account data and preferences
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Download className="h-5 w-5 text-foreground" />
                        <div>
                          <p className="font-medium text-foreground">Export Data</p>
                          <p className="text-sm text-muted-foreground">Download a copy of your account data</p>
                        </div>
                      </div>
                      <Button variant="outline">
                        Export
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Trash2 className="h-5 w-5 text-foreground" />
                        <div>
                          <p className="font-medium text-foreground">Delete Account</p>
                          <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                        </div>
                      </div>
                      <Button variant="outline">
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <DepositModal
          open={isDepositModalOpen}
          onOpenChange={setIsDepositModalOpen}
        />

        <SectionFooter section="account" activePage="/settings" />
      </ResponsiveSidebarLayout>
    </SidebarProvider>
  )
}
