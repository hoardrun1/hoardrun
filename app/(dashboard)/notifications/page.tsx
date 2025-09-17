'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'

import { DepositModal } from '@/components/deposit-modal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  Check, 
  X,
  DollarSign,
  CreditCard,
  TrendingUp,
  Shield,
  Mail,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'
import { SectionFooter } from '@/components/ui/section-footer'

export default function NotificationsPage() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [notificationList, setNotificationList] = useState<any[]>([])
  const [notificationSummary, setNotificationSummary] = useState<any>(null)
  const [selectedTab, setSelectedTab] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const unreadCount = notificationList.filter(n => n.status === 'unread').length

  // Fetch notifications data from API
  const fetchNotifications = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      // Fetch notifications and summary in parallel
      const [notificationsResponse, summaryResponse] = await Promise.all([
        apiClient.getNotifications({
          limit: 50,
          skip: 0
        }),
        apiClient.getNotificationSummary()
      ])

      // Handle notifications
      if (notificationsResponse.data) {
        const formattedNotifications = notificationsResponse.data.map((notification: any) => ({
          ...notification,
          icon: getNotificationTypeIcon(notification.type),
          read: notification.status === 'read',
          timestamp: formatTimestamp(notification.created_at)
        }))
        setNotificationList(formattedNotifications)
      }

      // Handle summary
      if (summaryResponse.data) {
        setNotificationSummary(summaryResponse.data)
      }

    } catch (err) {
      const errorMessage = 'Failed to load notifications. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Format timestamp to relative time
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    
    return date.toLocaleDateString()
  }

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      const response = await apiClient.markNotificationAsRead(id)
      
      if (response.error) {
        toast.error('Failed to mark notification as read')
        return
      }

      setNotificationList(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true, status: 'read' }
            : notification
        )
      )

      toast.success('Notification marked as read')
    } catch (error) {
      toast.error('Failed to mark notification as read')
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const unreadIds = notificationList
        .filter(n => n.status === 'unread')
        .map(n => n.id)

      if (unreadIds.length === 0) return

      const response = await apiClient.bulkUpdateNotifications({
        notification_ids: unreadIds,
        status: 'read'
      })

      if (response.error) {
        toast.error('Failed to mark all notifications as read')
        return
      }

      setNotificationList(prev => 
        prev.map(notification => ({ 
          ...notification, 
          read: true, 
          status: 'read' 
        }))
      )

      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Failed to mark all notifications as read')
    }
  }

  // Delete notification
  const deleteNotification = async (id: string) => {
    try {
      const response = await apiClient.deleteNotification(id)
      
      if (response.error) {
        toast.error('Failed to delete notification')
        return
      }

      setNotificationList(prev => prev.filter(n => n.id !== id))
      toast.success('Notification deleted')
    } catch (error) {
      toast.error('Failed to delete notification')
    }
  }

  // Filter notifications based on selected tab
  const filteredNotifications = notificationList.filter(notification => {
    if (selectedTab === 'all') return true
    if (selectedTab === 'unread') return notification.status === 'unread'
    return notification.type === selectedTab
  })

  // Load notifications on component mount
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'transaction': return DollarSign
      case 'security': return Shield
      case 'card': return CreditCard
      case 'investment': return TrendingUp
      case 'system': return Info
      default: return Bell
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen bg-background pt-16 pb-32 px-4 sm:pt-20 sm:pb-32 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center">
                  Notifications
                  {unreadCount > 0 && (
                    <Badge className="ml-3 bg-primary text-primary-foreground text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  Stay updated with your account activity and important alerts
                </p>
              </div>
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
            </div>

            {/* Error State */}
            {error && (
              <Card className="border-destructive">
                <CardContent className="flex items-center space-x-2 p-4">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Error loading notifications</p>
                    <p className="text-xs text-muted-foreground">{error}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchNotifications}
                    className="ml-auto"
                  >
                    Retry
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {isLoading ? '...' : notificationList.length}
                  </div>
                  <p className="text-xs text-muted-foreground">All notifications</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unread</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {isLoading ? '...' : unreadCount}
                  </div>
                  <p className="text-xs text-muted-foreground">Need attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Security</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {isLoading ? '...' : notificationList.filter(n => n.type === 'security').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Security alerts</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Financial</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {isLoading ? '...' : notificationList.filter(n => ['transaction', 'card', 'investment'].includes(n.type)).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Money related</p>
                </CardContent>
              </Card>
            </div>

            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4 sm:space-y-6">
              <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5">
                <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
                <TabsTrigger value="unread" className="text-xs sm:text-sm">Unread ({unreadCount})</TabsTrigger>
                <TabsTrigger value="transaction" className="text-xs sm:text-sm">Transactions</TabsTrigger>
                <TabsTrigger value="security" className="text-xs sm:text-sm">Security</TabsTrigger>
                <TabsTrigger value="system" className="text-xs sm:text-sm">System</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab} className="space-y-4">
                {filteredNotifications.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Bell className="h-12 w-12 text-muted-foreground/20 mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No notifications</h3>
                      <p className="text-muted-foreground text-center">
                        {selectedTab === 'unread' 
                          ? "You're all caught up! No unread notifications."
                          : `No ${selectedTab === 'all' ? '' : selectedTab} notifications to show.`
                        }
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {filteredNotifications.map((notification) => {
                      const IconComponent = notification.icon
                      return (
                        <Card 
                          key={notification.id} 
                          className={`transition-all hover:shadow-md ${
                            !notification.read ? 'border-l-4 border-l-primary bg-muted/50' : ''
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-4">
                              <div className="p-2 rounded-full bg-muted text-foreground">
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h3 className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                      {notification.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {notification.message}
                                    </p>
                                    <div className="flex items-center space-x-2 mt-2">
                                      <Clock className="h-3 w-3 text-muted-foreground/60" />
                                      <span className="text-xs text-muted-foreground/60">
                                        {notification.timestamp}
                                      </span>
                                      {!notification.read && (
                                        <Badge variant="secondary" className="bg-primary text-primary-foreground text-xs">
                                          New
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 ml-4">
                                    {!notification.read && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => markAsRead(notification.id)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Check className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => deleteNotification(notification.id)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <DepositModal
          open={isDepositModalOpen}
          onOpenChange={setIsDepositModalOpen}
        />
        
        <SectionFooter section="account" activePage="/notifications" />
    </div>
  )
}
