'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Bell, 
  TrendingUp, 
  Target, 
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react'

interface RightSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function RightSidebar({ isOpen, onClose }: RightSidebarProps) {
  // Mock data for the right sidebar
  const notifications = [
    {
      id: 1,
      type: 'transaction',
      title: 'Payment Received',
      message: 'You received $500 from John Doe',
      time: '2 min ago',
      unread: true
    },
    {
      id: 2,
      type: 'goal',
      title: 'Savings Goal Update',
      message: 'You\'re 75% towards your vacation goal!',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 3,
      type: 'security',
      title: 'Login Alert',
      message: 'New login from Chrome on Windows',
      time: '3 hours ago',
      unread: false
    }
  ]

  const savingsGoals = [
    {
      id: 1,
      name: 'Emergency Fund',
      current: 3500,
      target: 5000,
      progress: 70,
      color: 'bg-gray-500'
    },
    {
      id: 2,
      name: 'Vacation',
      current: 1200,
      target: 2000,
      progress: 60,
      color: 'bg-gray-500'
    },
    {
      id: 3,
      name: 'New Car',
      current: 8500,
      target: 15000,
      progress: 57,
      color: 'bg-gray-500'
    }
  ]

  const upcomingBills = [
    {
      id: 1,
      name: 'Rent',
      amount: 1200,
      dueDate: '2024-01-25',
      status: 'upcoming'
    },
    {
      id: 2,
      name: 'Electricity',
      amount: 85,
      dueDate: '2024-01-28',
      status: 'upcoming'
    },
    {
      id: 3,
      name: 'Internet',
      amount: 60,
      dueDate: '2024-01-30',
      status: 'paid'
    }
  ]

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: isOpen ? 0 : '100%' }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.320, 1] }}
      className="fixed right-0 top-0 h-full w-full sm:w-96 md:w-80 bg-white border-l border-black/10 shadow-2xl z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-black/10">
        <h2 className="text-lg font-semibold text-black">Activity</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 rounded-lg hover:bg-black/5"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="h-full overflow-y-auto pb-20">
        {/* Recent Notifications */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-black">Recent Notifications</h3>
            <Badge variant="secondary" className="bg-black/10 text-black text-xs">
              {notifications.filter(n => n.unread).length}
            </Badge>
          </div>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${
                  notification.unread 
                    ? 'bg-black/5 border-black/20' 
                    : 'bg-white border-black/10'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-1.5 rounded-full ${
                    notification.type === 'transaction' ? 'bg-gray-100' :
                    notification.type === 'goal' ? 'bg-gray-100' :
                    'bg-gray-100'
                  }`}>
                    {notification.type === 'transaction' ? (
                      <DollarSign className="h-3 w-3 text-gray-600" />
                    ) : notification.type === 'goal' ? (
                      <Target className="h-3 w-3 text-gray-600" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-black/60 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-black/40 mt-1">
                      {notification.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Savings Goals */}
        <div className="p-4 border-t border-black/10">
          <h3 className="text-sm font-medium text-black mb-3">Savings Goals</h3>
          <div className="space-y-4">
            {savingsGoals.map((goal) => (
              <div key={goal.id} className="p-3 bg-black/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-black">{goal.name}</span>
                  <span className="text-xs text-black/60">{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} className="h-2 mb-2" />
                <div className="flex items-center justify-between text-xs text-black/60">
                  <span>${goal.current.toLocaleString()}</span>
                  <span>${goal.target.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Bills */}
        <div className="p-4 border-t border-black/10">
          <h3 className="text-sm font-medium text-black mb-3">Upcoming Bills</h3>
          <div className="space-y-3">
            {upcomingBills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-3 bg-black/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-1.5 rounded-full ${
                    bill.status === 'paid' ? 'bg-gray-100' : 'bg-gray-100'
                  }`}>
                    {bill.status === 'paid' ? (
                      <CheckCircle className="h-3 w-3 text-gray-600" />
                    ) : (
                      <Clock className="h-3 w-3 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black">{bill.name}</p>
                    <p className="text-xs text-black/60">{bill.dueDate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-black">
                    ${bill.amount}
                  </p>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      bill.status === 'paid' 
                        ? 'bg-gray-100 text-gray-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {bill.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-4 border-t border-black/10">
          <h3 className="text-sm font-medium text-black mb-3">This Month</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-black/5 rounded-lg text-center">
              <ArrowUpRight className="h-4 w-4 text-gray-600 mx-auto mb-1" />
              <p className="text-xs text-black/60">Income</p>
              <p className="text-sm font-semibold text-black">$5,200</p>
            </div>
            <div className="p-3 bg-black/5 rounded-lg text-center">
              <ArrowDownLeft className="h-4 w-4 text-gray-600 mx-auto mb-1" />
              <p className="text-xs text-black/60">Expenses</p>
              <p className="text-sm font-semibold text-black">$3,150</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
