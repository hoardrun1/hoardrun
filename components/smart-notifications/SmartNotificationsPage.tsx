'use client';

import React from 'react';
import { SmartNotificationsFeed } from './SmartNotificationsFeed';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Bell, Settings, TrendingUp, AlertTriangle, Target } from 'lucide-react';

export function SmartNotificationsPage() {
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Smart Notifications</h1>
        <p className="text-gray-600">
          Intelligent financial nudges to help you make better money decisions
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Opportunities</p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Warnings</p>
              <p className="text-2xl font-bold">1</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Goal Nudges</p>
              <p className="text-2xl font-bold">2</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="feed" className="space-y-4">
        <TabsList>
          <TabsTrigger value="feed">
            <Bell className="h-4 w-4 mr-2" />
            Notification Feed
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed">
          <SmartNotificationsFeed showSettings={true} />
        </TabsContent>

        <TabsContent value="settings">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Notification Preferences</h2>
            <p className="text-gray-500">
              Customize which types of notifications you want to receive.
            </p>
            {/* Settings form will go here */}
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Surplus Notifications</p>
                  <p className="text-sm text-gray-500">Get notified when you have extra cash</p>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Overspending Warnings</p>
                  <p className="text-sm text-gray-500">Alerts when you exceed budget</p>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Goal Progress Nudges</p>
                  <p className="text-sm text-gray-500">Updates on your savings goals</p>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Investment Opportunities</p>
                  <p className="text-sm text-gray-500">Suggestions for investing surplus</p>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Section */}
      <Card className="mt-6 p-6 bg-blue-50 border-blue-200">
        <h3 className="font-bold mb-2">💡 How Smart Notifications Work</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• <strong>Surplus Detection:</strong> We analyze your income and expenses to find extra cash</li>
          <li>• <strong>Budget Monitoring:</strong> Get alerts when you're close to or over budget</li>
          <li>• <strong>Goal Tracking:</strong> Stay on track with personalized savings recommendations</li>
          <li>• <strong>Smart Timing:</strong> Notifications are prioritized and limited to avoid overwhelm</li>
        </ul>
      </Card>
    </div>
  );
}

