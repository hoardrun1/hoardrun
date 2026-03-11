'use client';

import React, { useState } from 'react';
import { AIGuidanceSettings as SettingsType } from '@/hooks/useAIGuidance';
import { useAIGuidance } from '@/hooks/useAIGuidance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Save } from 'lucide-react';

interface AIGuidanceSettingsProps {
  settings: SettingsType;
  onClose: () => void;
}

export const AIGuidanceSettings: React.FC<AIGuidanceSettingsProps> = ({ 
  settings: initialSettings, 
  onClose 
}) => {
  const { updateSettings, loading } = useAIGuidance();
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({
        risk_tolerance: settings.risk_tolerance,
        recommendation_frequency: settings.recommendation_frequency,
        min_recommendation_priority: settings.min_recommendation_priority,
        enable_ml_insights: settings.enable_ml_insights,
        enable_behavioral_nudges: settings.enable_behavioral_nudges
      });
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-purple-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>AI Guidance Settings</CardTitle>
            <CardDescription>Customize your personalized recommendations</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Risk Tolerance */}
        <div className="space-y-2">
          <Label htmlFor="risk-tolerance">Risk Tolerance</Label>
          <Select
            value={settings.risk_tolerance}
            onValueChange={(value: any) => setSettings({ ...settings, risk_tolerance: value })}
          >
            <SelectTrigger id="risk-tolerance">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conservative">Conservative - Lower risk, stable returns</SelectItem>
              <SelectItem value="moderate">Moderate - Balanced approach</SelectItem>
              <SelectItem value="aggressive">Aggressive - Higher risk, higher potential</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            Affects investment recommendations and portfolio allocation
          </p>
        </div>

        {/* Recommendation Frequency */}
        <div className="space-y-2">
          <Label htmlFor="frequency">Recommendation Frequency</Label>
          <Select
            value={settings.recommendation_frequency}
            onValueChange={(value: any) => setSettings({ ...settings, recommendation_frequency: value })}
          >
            <SelectTrigger id="frequency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily - Get fresh insights every day</SelectItem>
              <SelectItem value="weekly">Weekly - Once per week updates</SelectItem>
              <SelectItem value="monthly">Monthly - Monthly review</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            How often you want to receive new recommendations
          </p>
        </div>

        {/* Minimum Priority */}
        <div className="space-y-2">
          <Label htmlFor="priority">Minimum Recommendation Priority</Label>
          <Select
            value={settings.min_recommendation_priority}
            onValueChange={(value: any) => setSettings({ ...settings, min_recommendation_priority: value })}
          >
            <SelectTrigger id="priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="critical">Critical Only - Most important actions</SelectItem>
              <SelectItem value="high">High & Above - Important recommendations</SelectItem>
              <SelectItem value="medium">Medium & Above - All significant items</SelectItem>
              <SelectItem value="low">All - Show everything</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            Filter recommendations by importance level
          </p>
        </div>

        {/* ML Insights Toggle */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="space-y-0.5">
            <Label htmlFor="ml-insights" className="text-base">ML-Powered Insights</Label>
            <p className="text-xs text-gray-600">
              Enable machine learning analysis of your financial patterns
            </p>
          </div>
          <Switch
            id="ml-insights"
            checked={settings.enable_ml_insights}
            onCheckedChange={(checked) => setSettings({ ...settings, enable_ml_insights: checked })}
          />
        </div>

        {/* Behavioral Nudges Toggle */}
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="space-y-0.5">
            <Label htmlFor="behavioral-nudges" className="text-base">Behavioral Nudges</Label>
            <p className="text-xs text-gray-600">
              Receive gentle reminders to improve financial habits
            </p>
          </div>
          <Switch
            id="behavioral-nudges"
            checked={settings.enable_behavioral_nudges}
            onCheckedChange={(checked) => setSettings({ ...settings, enable_behavioral_nudges: checked })}
          />
        </div>

        {/* Save Button */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIGuidanceSettings;

