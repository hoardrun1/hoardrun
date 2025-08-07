'use client'

import { useState } from 'react'
import { SidebarProvider, ResponsiveSidebarLayout } from '@/components/ui/sidebar-layout'
import { SidebarContent } from '@/components/ui/sidebar-content'
import { SidebarToggle } from '@/components/ui/sidebar-toggle'
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

// Mock notifications data
const notifications = [
  {
    id: '1',
    type: 'transaction',
    title: 'Payment Received',
    message: 'You received $500 from John Smith',
    timestamp: '2 minutes ago',
    read: false,
    icon: DollarSign,
    color: 'text-black'
  },
  {
    id: '2',
    type: 'security',
    title: 'New Login Detected',
    message: 'Someone signed in from a new device in New York',
    timestamp: '1 hour ago',
    read: false,
    icon: Shield,
    color: 'text-black'
  },
  {
    id: '3',
    type: 'card',
    title: 'Card Payment',
    message: 'Your card ending in 1234 was charged $89.99',
    timestamp: '3 hours ago',
    read: true,
    icon: CreditCard,
    color: 'text-black'
  },
  {
    id: '4',
    type: 'investment',
    title: 'Portfolio Update',
    message: 'Your portfolio gained 2.5% today (+$125.50)',
    timestamp: '5 hours ago',
    read: true,
    icon: TrendingUp,
    color: 'text-black'
  },
  {
    id: '5',
    type: 'system',
    title: 'Maintenance Complete',
    message: 'Scheduled maintenance has been completed successfully',
    timestamp: '1 day ago',
    read: true,
    icon: CheckCircle,
    color: 'text-black'
  }
]

export default function NotificationsPage() {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [notificationList, setNotificationList] = useState(notifications)
  const [selectedTab, setSelectedTab] = useState('all')

  const unreadCount = notificationList.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotificationList(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotificationList(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotificationList(prev => prev.filter(n => n.id !== id))
  }

  const filteredNotifications = notificationList.filter(notification => {
    if (selectedTab === 'all') return true
    if (selectedTab === 'unread') return !notification.read
    return notification.type === selectedTab
  })

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
    <SidebarProvider>
      <ResponsiveSidebarLayout
        sidebar={<SidebarContent onAddMoney={() => setIsDepositModalOpen(true)} />}
      >
        <SidebarToggle />
        <div className="min-h-screen bg-white pt-16 pb-4 px-4 sm:pt-20 sm:pb-6 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-black flex items-center">
                  Notifications
                  {unreadCount > 0 && (
                    <Badge className="ml-3 bg-black text-white text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </h1>
                <p className="text-black/60 mt-1 text-sm sm:text-base">
                  Stay updated with your account activity and important alerts
                </p>
              </div>
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  variant="outline"
                  className="border-black text-black hover:bg-black hover:text-white w-full sm:w-auto"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                  <Bell className="h-4 w-4 text-black/60" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black">
                    {notificationList.length}
                  </div>
                  <p className="text-xs text-black/60">All notifications</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unread</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-black/60" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black">
                    {unreadCount}
                  </div>
                  <p className="text-xs text-black/60">Need attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Security</CardTitle>
                  <Shield className="h-4 w-4 text-black/60" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black">
                    {notificationList.filter(n => n.type === 'security').length}
                  </div>
                  <p className="text-xs text-black/60">Security alerts</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Financial</CardTitle>
                  <DollarSign className="h-4 w-4 text-black/60" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black">
                    {notificationList.filter(n => ['transaction', 'card', 'investment'].includes(n.type)).length}
                  </div>
                  <p className="text-xs text-black/60">Money related</p>
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
                      <Bell className="h-12 w-12 text-black/20 mb-4" />
                      <h3 className="text-lg font-medium text-black mb-2">No notifications</h3>
                      <p className="text-black/60 text-center">
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
                            !notification.read ? 'border-l-4 border-l-black bg-black/5' : ''
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-4">
                              <div className={`p-2 rounded-full bg-black/10 ${notification.color}`}>
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h3 className={`font-medium ${!notification.read ? 'text-black' : 'text-black/80'}`}>
                                      {notification.title}
                                    </h3>
                                    <p className="text-sm text-black/60 mt-1">
                                      {notification.message}
                                    </p>
                                    <div className="flex items-center space-x-2 mt-2">
                                      <Clock className="h-3 w-3 text-black/40" />
                                      <span className="text-xs text-black/40">
                                        {notification.timestamp}
                                      </span>
                                      {!notification.read && (
                                        <Badge variant="secondary" className="bg-black text-white text-xs">
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
                                        className="h-8 w-8 p-0 hover:bg-black/10"
                                      >
                                        <Check className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => deleteNotification(notification.id)}
                                      className="h-8 w-8 p-0 hover:bg-black/10"
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
      </ResponsiveSidebarLayout>
    </SidebarProvider>
  )
}
