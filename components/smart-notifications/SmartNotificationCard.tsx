'use client';

import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  DollarSign, 
  Shield,
  ArrowRight,
  Check,
  X
} from 'lucide-react';

export interface SmartNotification {
  id: string;
  user_id: string;
  type: 'surplus_detected' | 'investment_opportunity' | 'overspending_warning' | 
        'goal_progress_nudge' | 'savings_opportunity' | 'emergency_fund_reminder';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recommended_action: string;
  action_details: Record<string, any>;
  amount?: number;
  category?: string;
  goal_id?: string;
  is_read: boolean;
  is_acted_upon: boolean;
  created_at: string;
}

interface SmartNotificationCardProps {
  notification: SmartNotification;
  onMarkAsRead?: (id: string) => void;
  onTakeAction?: (notification: SmartNotification) => void;
  onDismiss?: (id: string) => void;
}

const getNotificationIcon = (type: SmartNotification['type']) => {
  switch (type) {
    case 'surplus_detected':
    case 'investment_opportunity':
      return <DollarSign className="h-5 w-5" />;
    case 'overspending_warning':
      return <AlertTriangle className="h-5 w-5" />;
    case 'goal_progress_nudge':
      return <Target className="h-5 w-5" />;
    case 'savings_opportunity':
      return <TrendingUp className="h-5 w-5" />;
    case 'emergency_fund_reminder':
      return <Shield className="h-5 w-5" />;
    default:
      return <DollarSign className="h-5 w-5" />;
  }
};

const getPriorityColor = (priority: SmartNotification['priority']) => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500 text-white';
    case 'high':
      return 'bg-orange-500 text-white';
    case 'medium':
      return 'bg-blue-500 text-white';
    case 'low':
      return 'bg-gray-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

const getTypeColor = (type: SmartNotification['type']) => {
  switch (type) {
    case 'surplus_detected':
    case 'investment_opportunity':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'overspending_warning':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'goal_progress_nudge':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'savings_opportunity':
      return 'text-purple-600 bg-purple-50 border-purple-200';
    case 'emergency_fund_reminder':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export function SmartNotificationCard({ 
  notification, 
  onMarkAsRead, 
  onTakeAction, 
  onDismiss 
}: SmartNotificationCardProps) {
  const typeColor = getTypeColor(notification.type);
  const priorityColor = getPriorityColor(notification.priority);

  return (
    <Card className={`p-4 border-l-4 ${typeColor} ${notification.is_read ? 'opacity-70' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          {/* Icon */}
          <div className={`p-2 rounded-full ${typeColor}`}>
            {getNotificationIcon(notification.type)}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm">{notification.title}</h3>
              <Badge className={`text-xs ${priorityColor}`}>
                {notification.priority.toUpperCase()}
              </Badge>
              {!notification.is_read && (
                <Badge variant="outline" className="text-xs">New</Badge>
              )}
            </div>

            <p className="text-sm text-gray-600">{notification.message}</p>

            {/* Action Details */}
            {notification.action_details && Object.keys(notification.action_details).length > 0 && (
              <div className="text-xs text-gray-500 space-y-1">
                {notification.action_details.surplus_amount && (
                  <div>Available: ${notification.action_details.surplus_amount.toFixed(2)}</div>
                )}
                {notification.action_details.recommended_allocation && (
                  <div className="flex gap-2">
                    <span>Suggested:</span>
                    {Object.entries(notification.action_details.recommended_allocation).map(([key, value]) => (
                      <span key={key} className="font-medium">
                        {key}: ${(value as number).toFixed(2)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              {onTakeAction && !notification.is_acted_upon && (
                <Button
                  size="sm"
                  onClick={() => onTakeAction(notification)}
                  className="text-xs"
                >
                  {notification.recommended_action.replace(/_/g, ' ')}
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              )}
              {onMarkAsRead && !notification.is_read && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="text-xs"
                >
                  <Check className="mr-1 h-3 w-3" />
                  Mark Read
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Dismiss Button */}
        {onDismiss && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDismiss(notification.id)}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}

