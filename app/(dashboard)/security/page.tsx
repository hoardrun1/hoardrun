'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api-client'
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

export default function SecurityPage() {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [userSettings, setUserSettings] = useState<any>(null)
  const [securityEvents, setSecurityEvents] = useState<any[]>([])
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const { toast } = useToast()
  const { theme } = useTheme()
  const { user } = useAuth()

  // Mock login sessions data (this would come from a sessions API in a real app)
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

  // Fetch user settings and security data on component mount
  useEffect(() => {
    const fetchSecurityData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch user settings for 2FA status
        const settingsResponse = await apiClient.getUserSettings()
        if (settingsResponse.data && settingsResponse.data.success && settingsResponse.data.data) {
          setUserSettings(settingsResponse.data.data.settings)
        } else {
          // Set default settings if none exist
          setUserSettings({
            two_factor_enabled: false,
            email_notifications: true,
            sms_notifications: true
          })
        }

        // Fetch audit logs for security activity
        const auditResponse = await apiClient.getAuditLogs({
          limit: 10,
          page: 1
        })
        
        if (auditResponse.data && auditResponse.data.data) {
          setSecurityEvents(auditResponse.data.data || [])
        }
      } catch (error) {
        console.error('Error fetching security data:', error)
        toast({
          title: "Error loading security data",
          description: "Failed to load your security settings. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchSecurityData()
    }
  }, [user, toast])

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast({
        title: "Error",
        description: "New passwords don't match.",
        variant: "destructive"
      })
      return
    }

    if (passwordData.new.length < 8) {
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
        current_password: passwordData.current,
        new_password: passwordData.new
      })
      
      if (response.error) {
        throw new Error(response.error)
      }

      setPasswordData({ current: '', new: '', confirm: '' })
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      })

      // Log the password change event
      await apiClient.createAuditLog({
        event_type: 'password_change',
        description: 'Password changed successfully',
        metadata: { source: 'security_page' }
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

  const handleTwoFactorToggle = async (enabled: boolean) => {
    try {
      setIsSaving(true)
      const response = await apiClient.updateUserSettings({ 
        two_factor_enabled: enabled 
      })
      
      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data && response.data.success && response.data.data) {
        setUserSettings(response.data.data.settings)
        toast({
          title: enabled ? "2FA Enabled" : "2FA Disabled",
          description: enabled 
            ? "Two-factor authentication has been enabled for your account."
            : "Two-factor authentication has been disabled.",
        })

        // Log the 2FA change event
        await apiClient.createAuditLog({
          event_type: enabled ? '2fa_enabled' : '2fa_disabled',
          description: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'}`,
          metadata: { source: 'security_page' }
        })
      }
    } catch (error: any) {
      console.error('Error updating 2FA:', error)
      toast({
        title: "Error updating 2FA",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const terminateSession = (sessionId: string) => {
    // This would call a real API to terminate the session
    toast({
      title: "Session Terminated",
      description: "The selected session has been terminated.",
    })
  }

  return (
    <div className="min-h-screen bg-background pt-16 pb-32 px-2">
      <div className="w-full space-y-4 sm:space-y-6">
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
                    {userSettings?.two_factor_enabled ? (
                      <CheckCircle className="h-5 w-5 text-foreground" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium text-foreground">
                      Two-Factor Authentication {userSettings?.two_factor_enabled ? 'Enabled' : 'Disabled'}
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
                        checked={userSettings?.two_factor_enabled || false}
                        onCheckedChange={handleTwoFactorToggle}
                      />
                    </div>
                    {userSettings?.two_factor_enabled && (
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

          <DepositModal
            open={isDepositModalOpen}
            onOpenChange={setIsDepositModalOpen}
          />
          
          <SectionFooter section="account" activePage="/security" />
        </div>
  )
}
