'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Search, User, Lock, CreditCard, HelpCircle, LogOut, Loader2, Check, AlertCircle, Home, BarChart2, PieChart, Settings } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/contexts/AuthContext'

export function SettingsPageComponent() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [securityScore, setSecurityScore] = useState(75)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [userSettings, setUserSettings] = useState<any>(null)
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const { toast } = useToast()
  const { user, logout } = useAuth()

  // Fetch user profile and settings on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch user profile
        const profileResponse = await apiClient.getProfile()
        if (profileResponse.data) {
          setUserProfile(profileResponse.data)
        }

        // Fetch user settings
        const settingsResponse = await apiClient.getUserSettings()
        if (settingsResponse.data && settingsResponse.data.success && settingsResponse.data.data) {
          setUserSettings(settingsResponse.data.data.settings)
        } else {
          // Set default settings if none exist
          setUserSettings({
            email_notifications: true,
            sms_notifications: true,
            push_notifications: true,
            marketing_emails: false,
            two_factor_enabled: false,
            currency_preference: 'USD',
            language_preference: 'en',
            timezone: 'UTC'
          })
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        toast({
          title: "Error loading settings",
          description: "Failed to load your settings. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchUserData()
    }
  }, [user, toast])

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev)
    document.documentElement.classList.toggle('dark', !isDarkMode)
  }

  const handleProfileUpdate = async (profileData: any) => {
    try {
      setIsSaving(true)
      const response = await apiClient.updateProfile(profileData)
      
      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        setUserProfile(response.data)
        toast({
          title: "Profile updated successfully",
          description: "Your profile information has been updated.",
        })
      }
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error updating profile",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSettingsUpdate = async (settingsData: any) => {
    try {
      setIsSaving(true)
      const response = await apiClient.updateUserSettings(settingsData)
      
      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data && response.data.success && response.data.data) {
        setUserSettings(response.data.data.settings)
        toast({
          title: "Settings updated successfully",
          description: "Your preferences have been saved.",
        })
      }
    } catch (error: any) {
      console.error('Error updating settings:', error)
      toast({
        title: "Error updating settings",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.new_password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)
      const response = await apiClient.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      })
      
      if (response.error) {
        throw new Error(response.error)
      }

      setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
      toast({
        title: "Password changed successfully",
        description: "Your password has been updated.",
      })
    } catch (error: any) {
      console.error('Error changing password:', error)
      toast({
        title: "Error changing password",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen-mobile transition-colors duration-300 pb-20 sm:pb-6 overflow-x-hidden ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className="sticky top-14 sm:top-16 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 flex h-12 sm:h-14 items-center">
          <div className="mr-3 sm:mr-4 hidden md:flex">
            <Link href="/home" className="mr-4 sm:mr-6 flex items-center space-x-2">
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="hidden font-bold sm:inline-block text-sm sm:text-base"
              >
                Hoardrun
              </motion.span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/home" className="transition-colors hover:text-gray-600">Home</Link>
              <Link href="/finance" className="transition-colors hover:text-gray-600">Finance</Link>
              <Link href="/cards" className="transition-colors hover:text-gray-600">Cards</Link>
              <Link href="/investment" className="transition-colors hover:text-gray-600">Investment</Link>
              <Link href="/settings" className="text-gray-600">Settings</Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search settings" 
                  className="pl-8 transition-all focus:ring-2 focus:ring-blue-500" 
                />
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleDarkMode}
              className="transition-transform hover:scale-110"
            >
              {isDarkMode ? '🌞' : '🌙'}
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="transition-transform hover:scale-110"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-8 w-8 rounded-full transition-transform hover:scale-110"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="@johndoe" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Lock className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-gray-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container py-6 md:py-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col space-y-8"
        >
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Security Score</CardTitle>
              <CardDescription>Your account security status</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={securityScore} className="h-2" />
              <p className="mt-2 text-sm text-muted-foreground">
                Your account is {securityScore}% secure. Complete the recommended actions to improve your security.
              </p>
            </CardContent>
          </Card>

          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2">
              <TabsTrigger value="account" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white">Account</TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white">Security</TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white">Notifications</TabsTrigger>
              <TabsTrigger value="billing" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white">Billing</TabsTrigger>
              <TabsTrigger value="support" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white">Support</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="account">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Information</CardTitle>
                      <CardDescription>Update your account details here.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input 
                            id="firstName" 
                            value={userProfile?.first_name || ''}
                            onChange={(e) => setUserProfile((prev: any) => ({ ...prev, first_name: e.target.value }))}
                            className="transition-all focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input 
                            id="lastName" 
                            value={userProfile?.last_name || ''}
                            onChange={(e) => setUserProfile((prev: any) => ({ ...prev, last_name: e.target.value }))}
                            className="transition-all focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          value={userProfile?.email || ''}
                          disabled
                          className="transition-all focus:ring-2 focus:ring-blue-500 bg-gray-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          value={userProfile?.phone_number || ''}
                          onChange={(e) => setUserProfile((prev: any) => ({ ...prev, phone_number: e.target.value }))}
                          className="transition-all focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Input 
                          id="bio" 
                          value={userProfile?.bio || ''}
                          onChange={(e) => setUserProfile((prev: any) => ({ ...prev, bio: e.target.value }))}
                          className="transition-all focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <Button 
                        onClick={() => handleProfileUpdate({
                          first_name: userProfile?.first_name,
                          last_name: userProfile?.last_name,
                          phone_number: userProfile?.phone_number,
                          bio: userProfile?.bio
                        })}
                        disabled={isSaving}
                        className="w-full sm:w-auto"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving changes...
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security">
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>Manage your account security and authentication methods</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Change Password</h4>
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input 
                            id="currentPassword" 
                            type="password"
                            value={passwordData.current_password}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                            className="transition-all focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input 
                            id="newPassword" 
                            type="password"
                            value={passwordData.new_password}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                            className="transition-all focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input 
                            id="confirmPassword" 
                            type="password"
                            value={passwordData.confirm_password}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                            className="transition-all focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <Button 
                          onClick={handlePasswordChange}
                          disabled={isSaving}
                          className="w-full sm:w-auto"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Changing Password...
                            </>
                          ) : (
                            <>
                              <Lock className="mr-2 h-4 w-4" />
                              Change Password
                            </>
                          )}
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Lock className="h-5 w-5 text-foreground" />
                          <div>
                            <p className="font-medium text-foreground">Two-Factor Authentication</p>
                            <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                          </div>
                        </div>
                        <Switch 
                          checked={userSettings?.two_factor_enabled || false}
                          onCheckedChange={(checked) => handleSettingsUpdate({ two_factor_enabled: checked })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>Choose how you want to be notified about account activity</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Bell className="h-5 w-5 text-foreground" />
                          <div>
                            <p className="font-medium text-foreground">Email Notifications</p>
                            <p className="text-sm text-muted-foreground">Receive updates via email</p>
                          </div>
                        </div>
                        <Switch 
                          checked={userSettings?.email_notifications || false}
                          onCheckedChange={(checked) => handleSettingsUpdate({ email_notifications: checked })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Bell className="h-5 w-5 text-foreground" />
                          <div>
                            <p className="font-medium text-foreground">SMS Notifications</p>
                            <p className="text-sm text-muted-foreground">Receive updates via SMS</p>
                          </div>
                        </div>
                        <Switch 
                          checked={userSettings?.sms_notifications || false}
                          onCheckedChange={(checked) => handleSettingsUpdate({ sms_notifications: checked })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Bell className="h-5 w-5 text-foreground" />
                          <div>
                            <p className="font-medium text-foreground">Push Notifications</p>
                            <p className="text-sm text-muted-foreground">Receive push notifications</p>
                          </div>
                        </div>
                        <Switch 
                          checked={userSettings?.push_notifications || false}
                          onCheckedChange={(checked) => handleSettingsUpdate({ push_notifications: checked })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Bell className="h-5 w-5 text-foreground" />
                          <div>
                            <p className="font-medium text-foreground">Marketing Emails</p>
                            <p className="text-sm text-muted-foreground">Receive promotional emails</p>
                          </div>
                        </div>
                        <Switch 
                          checked={userSettings?.marketing_emails || false}
                          onCheckedChange={(checked) => handleSettingsUpdate({ marketing_emails: checked })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="billing">
                  <Card>
                    <CardHeader>
                      <CardTitle>Preferences</CardTitle>
                      <CardDescription>Manage your account preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency Preference</Label>
                        <Select 
                          value={userSettings?.currency_preference || 'USD'}
                          onValueChange={(value) => handleSettingsUpdate({ currency_preference: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                            <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="language">Language Preference</Label>
                        <Select 
                          value={userSettings?.language_preference || 'en'}
                          onValueChange={(value) => handleSettingsUpdate({ language_preference: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="sw">Swahili</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select 
                          value={userSettings?.timezone || 'UTC'}
                          onValueChange={(value) => handleSettingsUpdate({ timezone: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="America/New_York">Eastern Time</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                            <SelectItem value="Europe/London">London</SelectItem>
                            <SelectItem value="Africa/Nairobi">Nairobi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="support">
                  <Card>
                    <CardHeader>
                      <CardTitle>Support & Help</CardTitle>
                      <CardDescription>Get help and support for your account</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <HelpCircle className="h-5 w-5 text-foreground" />
                          <div>
                            <p className="font-medium text-foreground">Help Center</p>
                            <p className="text-sm text-muted-foreground">Browse our help articles</p>
                          </div>
                        </div>
                        <Button variant="outline">
                          Visit
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-foreground" />
                          <div>
                            <p className="font-medium text-foreground">Contact Support</p>
                            <p className="text-sm text-muted-foreground">Get in touch with our team</p>
                          </div>
                        </div>
                        <Button variant="outline">
                          Contact
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>

          <div className="flex justify-end">
            <Button 
              variant="destructive"
              onClick={handleLogout}
              className="group hover:bg-gray-700 transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform" />
              Log Out
            </Button>
          </div>
        </motion.div>
      </main>

      {/* Navigation Footer - Only show on mobile */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-2 lg:hidden">
        <div className="container mx-auto px-4">
          <nav className="grid grid-cols-5 gap-1 sm:gap-2">
            {[
              { icon: Home, label: 'Home', href: '/home' },
              { icon: BarChart2, label: 'Finance', href: '/finance' },
              { icon: CreditCard, label: 'Cards', href: '/cards' },
              { icon: PieChart, label: 'Investment', href: '/investment' },
              { icon: Settings, label: 'Settings', active: true, href: '/settings' }
            ].map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                  item.active
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  )
}
