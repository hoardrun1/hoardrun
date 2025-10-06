'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'

import { DepositModal } from '@/components/deposit-modal'
import { SectionFooter } from '@/components/ui/section-footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { apiClient } from '@/lib/api-client'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Save,
  Camera,
  Shield,
  CreditCard,
  Bell,
  Loader2
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function ProfilePage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    bio: '',
    country: '',
    profilePictureUrl: '',
    status: '',
    role: '',
    emailVerified: false,
    createdAt: '',
    updatedAt: '',
    lastLoginAt: ''
  })
  const { addToast } = useToast()
  const { user } = useAuth()

  // Fetch user profile data from API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        console.log('Fetching profile data...')
        console.log('Current user from AuthContext:', user)
        
        const response = await apiClient.getProfile()
        console.log('Profile API response:', response)
        
        if (response.error) {
          console.error('Profile API error:', response.error)
          throw new Error(response.error)
        }

        if (response.data) {
          console.log('Profile data received:', response.data)
          setProfileData({
            firstName: response.data.first_name || '',
            lastName: response.data.last_name || '',
            email: response.data.email || '',
            phone: response.data.phone_number || '',
            dateOfBirth: response.data.date_of_birth || '',
            bio: response.data.bio || '',
            country: response.data.country || '',
            profilePictureUrl: response.data.profile_picture_url || '',
            status: response.data.status || '',
            role: response.data.role || '',
            emailVerified: response.data.email_verified || false,
            createdAt: response.data.created_at || '',
            updatedAt: response.data.updated_at || '',
            lastLoginAt: response.data.last_login_at || ''
          })
        } else {
          console.warn('No profile data received from API')
          // If no data from API but user exists in AuthContext, use that data
          if (user) {
            console.log('Using user data from AuthContext as fallback')
            setProfileData({
              firstName: user.name?.split(' ')[0] || '',
              lastName: user.name?.split(' ').slice(1).join(' ') || '',
              email: user.email || '',
              phone: '',
              dateOfBirth: '',
              bio: '',
              country: '',
              profilePictureUrl: '',
              status: 'active',
              role: 'standard',
              emailVerified: user.emailVerified || false,
              createdAt: '',
              updatedAt: '',
              lastLoginAt: ''
            })
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        
        // If API fails but user exists in AuthContext, use that data as fallback
        if (user) {
          console.log('API failed, using user data from AuthContext as fallback')
          setProfileData({
            firstName: user.name?.split(' ')[0] || '',
            lastName: user.name?.split(' ').slice(1).join(' ') || '',
            email: user.email || '',
            phone: '',
            dateOfBirth: '',
            bio: '',
            country: '',
            profilePictureUrl: '',
            status: 'active',
            role: 'standard',
            emailVerified: user.emailVerified || false,
            createdAt: '',
            updatedAt: '',
            lastLoginAt: ''
          })
        } else {
          addToast({
            title: "Error",
            description: "Failed to load profile data",
            variant: "destructive",
          })
        }
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchProfile()
    } else {
      console.log('No user found in AuthContext, skipping profile fetch')
      setLoading(false)
    }
  }, [user, addToast])

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await apiClient.updateProfile({
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone_number: profileData.phone,
        date_of_birth: profileData.dateOfBirth,
        bio: profileData.bio,
        country: profileData.country,
        profile_picture_url: profileData.profilePictureUrl
      })

      if (response.error) {
        throw new Error(response.error)
      }

      setIsEditing(false)
      addToast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      addToast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }



  return (
    <div className="min-h-screen bg-background">
        <div className="min-h-screen bg-background pt-16 pb-32 px-2">
          <div className="w-full space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {t('dashboard.profile.title')}
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  {t('dashboard.profile.description')}
                </p>
              </div>
              <Button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={saving}
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('dashboard.profile.saving')}
                  </>
                ) : isEditing ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t('dashboard.profile.saveChanges')}
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    {t('dashboard.profile.editProfile')}
                  </>
                )}
              </Button>
            </div>

            <Tabs defaultValue="personal" className="space-y-4 sm:space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal" className="text-xs sm:text-sm">{t('dashboard.profile.tabs.personalInfo')}</TabsTrigger>
                <TabsTrigger value="security" className="text-xs sm:text-sm">{t('dashboard.profile.tabs.security')}</TabsTrigger>
                <TabsTrigger value="preferences" className="text-xs sm:text-sm">{t('dashboard.profile.tabs.preferences')}</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4 sm:space-y-6">
                {/* Profile Header */}
                <Card>
                  <CardContent className="pt-4 sm:pt-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                      <div className="relative">
                        <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
                          <AvatarImage src={profileData.profilePictureUrl || "/placeholder-avatar.jpg"} />
                          <AvatarFallback className="text-xl sm:text-2xl bg-primary text-primary-foreground">
                            {profileData.firstName[0]}{profileData.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        {isEditing && (
                          <Button
                            size="sm"
                            className="absolute -bottom-2 -right-2 rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0 bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                          {profileData.firstName} {profileData.lastName}
                        </h2>
                        <p className="text-muted-foreground text-sm sm:text-base">{profileData.email}</p>
                        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-4 mt-2">
                          <Badge variant="secondary" className="bg-muted text-foreground text-xs">
                            {profileData.emailVerified ? t('dashboard.profile.verifiedAccount') : t('dashboard.profile.unverifiedAccount')}
                          </Badge>
                          <Badge variant="secondary" className="bg-muted text-foreground text-xs">
                            {profileData.role === 'premium' ? t('dashboard.profile.premiumMember') : t('dashboard.profile.standardMember')}
                          </Badge>
                          <Badge variant="secondary" className="bg-muted text-foreground text-xs">
                            {t('dashboard.profile.status')}: {profileData.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Personal Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('dashboard.profile.basicInformation')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">{t('dashboard.profile.fields.firstName')}</Label>
                          <Input
                            id="firstName"
                            value={profileData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">{t('dashboard.profile.fields.lastName')}</Label>
                          <Input
                            id="lastName"
                            value={profileData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t('dashboard.profile.fields.email')}</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t('dashboard.profile.fields.phone')}</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">{t('dashboard.profile.fields.dateOfBirth')}</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={profileData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>{t('dashboard.profile.additionalInformation')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="country">{t('dashboard.profile.fields.country')}</Label>
                        <Input
                          id="country"
                          value={profileData.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profilePictureUrl">{t('dashboard.profile.fields.profilePictureUrl')}</Label>
                        <Input
                          id="profilePictureUrl"
                          value={profileData.profilePictureUrl}
                          onChange={(e) => handleInputChange('profilePictureUrl', e.target.value)}
                          disabled={!isEditing}
                          placeholder="https://example.com/avatar.jpg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accountInfo">{t('dashboard.profile.accountInformation')}</Label>
                        <div className="p-3 bg-muted rounded-lg space-y-2">
                          <p className="text-sm"><strong>{t('dashboard.profile.created')}:</strong> {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'N/A'}</p>
                          <p className="text-sm"><strong>{t('dashboard.profile.lastUpdated')}:</strong> {profileData.updatedAt ? new Date(profileData.updatedAt).toLocaleDateString() : 'N/A'}</p>
                          <p className="text-sm"><strong>{t('dashboard.profile.lastLogin')}:</strong> {profileData.lastLoginAt ? new Date(profileData.lastLoginAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">{t('dashboard.profile.fields.bio')}</Label>
                        <Textarea
                          id="bio"
                          value={profileData.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          disabled={!isEditing}
                          rows={4}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('dashboard.profile.securitySettings')}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {t('dashboard.profile.securityDescription')}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Shield className="h-5 w-5 text-foreground" />
                          <div>
                            <p className="font-medium text-foreground">{t('dashboard.profile.twoFactorAuth')}</p>
                            <p className="text-sm text-muted-foreground">{t('dashboard.profile.twoFactorDescription')}</p>
                          </div>
                        </div>
                        <Button variant="outline">
                          {t('dashboard.profile.enable')}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-5 w-5 text-foreground" />
                          <div>
                            <p className="font-medium text-foreground">{t('dashboard.profile.password')}</p>
                            <p className="text-sm text-muted-foreground">{t('dashboard.profile.passwordLastChanged')}</p>
                          </div>
                        </div>
                        <Button variant="outline">
                          {t('dashboard.profile.change')}
                        </Button>
                      </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('dashboard.profile.notificationPreferences')}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {t('dashboard.profile.notificationDescription')}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Bell className="h-5 w-5 text-foreground" />
                        <div>
                          <p className="font-medium text-foreground">{t('dashboard.profile.emailNotifications')}</p>
                          <p className="text-sm text-muted-foreground">{t('dashboard.profile.emailNotificationsDescription')}</p>
                        </div>
                      </div>
                      <Button variant="outline">
                        {t('dashboard.profile.configure')}
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
        <SectionFooter section="account" activePage="/profile" />
    </div>
  )
}
