'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { AccountsOverview } from './AccountsOverview';
import { FinancialSnapshot } from './FinancialSnapshot';
import { RecentActivity } from './RecentActivity';
import { QuickActions } from './QuickActions';
import { InsightsPanel } from './InsightsPanel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  LayoutDashboard,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

export const EnhancedDashboard: React.FC = () => {
  const {
    dashboardData,
    aiGuidance,
    smartNotifications,
    loading,
    error,
    refresh,
  } = useDashboard();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8 text-blue-600" />
            Financial Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Your complete financial overview in one place
          </p>
        </div>
        <div className="flex items-center gap-3">
          {smartNotifications && smartNotifications.unread_count > 0 && (
            <Badge variant="destructive" className="px-3 py-1">
              {smartNotifications.unread_count} New Alerts
            </Badge>
          )}
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing || loading}
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">Failed to load dashboard data</p>
            </div>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm" 
              className="mt-3"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Account Alerts */}
      {dashboardData && dashboardData.account_alerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-orange-900 mb-2">Account Alerts</p>
                <div className="space-y-2">
                  {dashboardData.account_alerts.map((alert, index) => (
                    <div key={index} className="text-sm text-orange-800">
                      <p className="font-medium">{alert.message}</p>
                      {alert.action_suggested && (
                        <p className="text-xs text-orange-700 mt-1">
                          💡 {alert.action_suggested}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accounts Overview - Top Cards */}
      <AccountsOverview data={dashboardData} loading={loading} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial Snapshot */}
          <FinancialSnapshot data={dashboardData} loading={loading} />

          {/* Recent Activity */}
          <RecentActivity data={dashboardData} loading={loading} />

          {/* Quick Actions */}
          <QuickActions />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="lg:col-span-1">
          <InsightsPanel 
            aiGuidance={aiGuidance}
            smartNotifications={smartNotifications}
            loading={loading}
          />
        </div>
      </div>

      {/* Footer Stats */}
      {dashboardData && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  Dashboard last updated: {new Date().toLocaleTimeString()}
                </span>
              </div>
              <Badge variant="secondary" className="bg-white">
                Read-Only Mode
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedDashboard;

