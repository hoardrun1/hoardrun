'use client'

import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { SidebarProvider, ResponsiveSidebarLayout } from '@/components/ui/sidebar-layout'
import { SidebarContent } from '@/components/ui/sidebar-content'
import { SidebarToggle } from '@/components/ui/sidebar-toggle'
import { DepositModal } from '@/components/deposit-modal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { 
  Shield, 
  Key, 
  Smartphone,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Clock,
  MapPin,
  Monitor
} from 'lucide-react'
import { SectionFooter } from '@/components/ui/section-footer'

// Mock security data
const loginSessions = [
  {
    id: '1',
    device: 'MacBook Pro',
    location: 'New York, NY',
    lastActive: '2024-01-15 14:30',
    current: true
  },
  {
    id: '2',
    device: 'iPhone 15',
    location: 'New York, NY',
    lastActive: '2024-01-15 12:15',
    current: false
  },
  {
    id: '3',
    device: 'Chrome Browser',
    location: 'Boston, MA',
    lastActive: '2024-01-14 09:45',
    current: false
  }
]

const securityEvents = [
  {
    id: '1',
    type: 'login',
    description: 'Successful login from MacBook Pro',
    timestamp: '2024-01-15 14:30',
    status: 'success'
  },
  {
    id: '2',
    type: 'password_change',
    description: 'Password changed successfully',
    timestamp: '2024-01-10 16:20',
    status: 'success'
  },
  {
    id: '3',
    type: 'failed_login',
    description: 'Failed login attempt from unknown device',
    timestamp: '2024-01-08 22:15',
    status: 'warning'
  }
]

export default function SecurityPage() {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const { addToast } = useToast()
  const { theme } = useTheme()

  const handlePasswordChange = () => {
    if (passwordData.new !== passwordData.confirm) {
      addToast({
        title: "Error",
        description: "New passwords don't match.",
        variant: "destructive"
      })
      return
    }

    // Here you would typically call an API
    addToast({
      title: "Password Updated",
      description: "Your password has been changed successfully.",
    })
    
    setPasswordData({ current: '', new: '', confirm: '' })
  }

  const handleTwoFactorToggle = (enabled: boolean) => {
    setTwoFactorEnabled(enabled)
    addToast({
      title: enabled ? "2FA Enabled" : "2FA Disabled",
      description: enabled 
        ? "Two-factor authentication has been enabled for your account."
        : "Two-factor authentication has been disabled.",
    })
  }

  const terminateSession = (sessionId: string) => {
    addToast({
      title: "Session Terminated",
      description: "The selected session has been terminated.",
    })
  }

  return (
    <SidebarProvider>
      <ResponsiveSidebarLayout
        sidebar={<SidebarContent onAddMoney={() => setIsDepositModalOpen(true)} />}
      >
        <SidebarToggle />
        <div className="min-h-screen bg-background pt-16 pb-32 px-4 sm:pt-20 sm:pb-32 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Security
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  Manage your account security and authentication settings
                </p>
              </div>
            </div>

            {/* Security Status */}
            <Card>
              <CardHeader>
                <CardTitle>Security Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-foreground" />
                    <span className="text-sm font-medium text-foreground">Account Verified</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {twoFactorEnabled ? (
                      <CheckCircle className="h-5 w-5 text-foreground" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium text-foreground">
                      Two-Factor Authentication {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <Badge variant="secondary" className="bg-muted text-foreground">
                    Strong Security
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="password" className="space-y-4 sm:space-y-6">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                <TabsTrigger value="password" className="text-xs sm:text-sm">Password</TabsTrigger>
                <TabsTrigger value="2fa" className="text-xs sm:text-sm">Two-Factor Auth</TabsTrigger>
                <TabsTrigger value="sessions" className="text-xs sm:text-sm">Active Sessions</TabsTrigger>
                <TabsTrigger value="activity" className="text-xs sm:text-sm">Security Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="password" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Update your password to keep your account secure
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.current}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                          placeholder="Enter current password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.new}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                          placeholder="Enter new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirm}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                        placeholder="Confirm new password"
                      />
                    </div>
                    <Button 
                      onClick={handlePasswordChange}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Update Password
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="2fa" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="h-5 w-5 text-foreground" />
                        <div>
                          <p className="font-medium text-foreground">Authenticator App</p>
                          <p className="text-sm text-muted-foreground">Use an app like Google Authenticator</p>
                        </div>
                      </div>
                      <Switch
                        checked={twoFactorEnabled}
                        onCheckedChange={handleTwoFactorToggle}
                      />
                    </div>
                    {twoFactorEnabled && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Two-factor authentication is enabled. You'll need to enter a code from your authenticator app when signing in.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sessions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Sessions</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Manage devices that are currently signed in to your account
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loginSessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-4 border border-border rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <Monitor className="h-5 w-5 text-foreground" />
                            <div>
                              <p className="font-medium flex items-center text-foreground">
                                {session.device}
                                {session.current && (
                                  <Badge variant="secondary" className="ml-2 bg-muted text-foreground">
                                    Current
                                  </Badge>
                                )}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {session.location}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {session.lastActive}
                                </span>
                              </div>
                            </div>
                          </div>
                          {!session.current && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => terminateSession(session.id)}
                            >
                              Terminate
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Activity</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Recent security events and login attempts
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {securityEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center space-x-4 p-4 border border-border rounded-lg"
                        >
                          <div className={`p-2 rounded-full ${
                            event.status === 'success' ? 'bg-muted' : 'bg-muted'
                          }`}>
                            {event.status === 'success' ? (
                              <CheckCircle className="h-4 w-4 text-foreground" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{event.description}</p>
                            <p className="text-sm text-muted-foreground">{event.timestamp}</p>
                          </div>
                        </div>
                      ))}
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
        
        <SectionFooter section="account" activePage="/security" />
      </ResponsiveSidebarLayout>
    </SidebarProvider>
  )
}
