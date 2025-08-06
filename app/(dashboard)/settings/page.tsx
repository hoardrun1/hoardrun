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

export default function SettingsPage() {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
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
      theme: 'light',
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

  return (
    <SidebarProvider>
      <ResponsiveSidebarLayout
        sidebar={<SidebarContent onAddMoney={() => setIsDepositModalOpen(true)} />}
      >
        <SidebarToggle />
        <div className="min-h-screen bg-white p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-black">
                  Settings
                </h1>
                <p className="text-black/60 mt-1">
                  Customize your app experience and preferences
                </p>
              </div>
            </div>

            <Tabs defaultValue="general" className="space-y-6">
              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <p className="text-sm text-black/60">
                      Customize how the app looks and feels
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Theme</Label>
                        <p className="text-sm text-black/60">Choose your preferred theme</p>
                      </div>
                      <Select 
                        value={settings.preferences.theme} 
                        onValueChange={(value) => handleSettingChange('preferences', 'theme', value)}
                      >
                        <SelectTrigger className="w-[180px]">
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
                        <p className="text-sm text-black/60">Select your preferred language</p>
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
                        <p className="text-sm text-black/60">Default currency for transactions</p>
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
                    <p className="text-sm text-black/60">
                      Choose how and when you want to be notified
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-black" />
                        <div className="space-y-0.5">
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-black/60">Receive updates via email</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.notifications.email}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'email', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="h-5 w-5 text-black" />
                        <div className="space-y-0.5">
                          <Label>Push Notifications</Label>
                          <p className="text-sm text-black/60">Get notified on your device</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.notifications.push}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'push', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Bell className="h-5 w-5 text-black" />
                        <div className="space-y-0.5">
                          <Label>SMS Notifications</Label>
                          <p className="text-sm text-black/60">Receive text messages for important updates</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.notifications.sms}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'sms', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="h-5 w-5 text-black" />
                        <div className="space-y-0.5">
                          <Label>Marketing Communications</Label>
                          <p className="text-sm text-black/60">Receive promotional offers and updates</p>
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
                    <p className="text-sm text-black/60">
                      Control your data and privacy preferences
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Profile Visibility</Label>
                        <p className="text-sm text-black/60">Who can see your profile information</p>
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
                        <Database className="h-5 w-5 text-black" />
                        <div className="space-y-0.5">
                          <Label>Data Sharing</Label>
                          <p className="text-sm text-black/60">Allow sharing anonymized data for improvements</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.privacy.dataSharing}
                        onCheckedChange={(checked) => handleSettingChange('privacy', 'dataSharing', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-black" />
                        <div className="space-y-0.5">
                          <Label>Analytics</Label>
                          <p className="text-sm text-black/60">Help improve the app with usage analytics</p>
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
                    <p className="text-sm text-black/60">
                      Manage your account data and preferences
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-black/10 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Download className="h-5 w-5 text-black" />
                        <div>
                          <p className="font-medium">Export Data</p>
                          <p className="text-sm text-black/60">Download a copy of your account data</p>
                        </div>
                      </div>
                      <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                        Export
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-black/10 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Trash2 className="h-5 w-5 text-black" />
                        <div>
                          <p className="font-medium">Delete Account</p>
                          <p className="text-sm text-black/60">Permanently delete your account and all data</p>
                        </div>
                      </div>
                      <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
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
      </ResponsiveSidebarLayout>
    </SidebarProvider>
  )
}
