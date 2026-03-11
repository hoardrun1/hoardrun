'use client';

import React, { useEffect, useState } from 'react';
import { useAIGuidance } from '@/hooks/useAIGuidance';
import { RecommendationCard } from './RecommendationCard';
import { InvestmentReadinessGauge } from './InvestmentReadinessGauge';
import { MLInsightsFeed } from './MLInsightsFeed';
import { AIGuidanceSettings } from './AIGuidanceSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  Sparkles, 
  TrendingUp, 
  Lightbulb, 
  Settings,
  Brain,
  Target
} from 'lucide-react';

export const AIGuidancePage: React.FC = () => {
  const {
    guidance,
    recommendations,
    investmentReadiness,
    insights,
    settings,
    loading,
    error,
    fetchGuidance,
    fetchRecommendations,
    fetchInvestmentReadiness,
    fetchInsights,
    fetchSettings,
    getPersonaIcon
  } = useAIGuidance();

  const [activeTab, setActiveTab] = useState('overview');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Fetch complete guidance on mount
    fetchGuidance();
    fetchSettings();
  }, []);

  const handleRefresh = async () => {
    await fetchGuidance();
  };

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="py-8 text-center">
          <p className="text-red-600">Error: {error}</p>
          <Button onClick={handleRefresh} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-600" />
            AI Financial Guidance
          </h1>
          <p className="text-gray-600 mt-1">
            Personalized recommendations powered by intelligent analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && settings && (
        <AIGuidanceSettings 
          settings={settings} 
          onClose={() => setShowSettings(false)} 
        />
      )}

      {/* Financial Persona & Health */}
      {guidance && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{getPersonaIcon(guidance.financial_persona.persona)}</span>
                Your Financial Persona
              </CardTitle>
              <CardDescription>Based on your behavior patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 capitalize mb-2">
                {guidance.financial_persona.persona.replace('_', ' ')}
              </div>
              <div className="text-sm text-gray-600 mb-3">
                Confidence: {(guidance.financial_persona.confidence * 100).toFixed(0)}%
              </div>
              <div className="space-y-1">
                {guidance.financial_persona.characteristics.slice(0, 3).map((char, index) => (
                  <Badge key={index} variant="secondary" className="mr-2">
                    {char}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Financial Health
              </CardTitle>
              <CardDescription>Overall wellness score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-green-600 mb-2">
                {guidance.overall_financial_health}
                <span className="text-2xl text-gray-500">/100</span>
              </div>
              <div className="text-sm text-gray-600">
                Next review: {new Date(guidance.next_review_date).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Recommendations
            {recommendations.length > 0 && (
              <Badge variant="secondary" className="ml-1">{recommendations.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="readiness" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Investment
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Insights
            {insights.length > 0 && (
              <Badge variant="secondary" className="ml-1">{insights.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-600" />
                <p className="text-gray-600">Loading your personalized guidance...</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Top Recommendations */}
              {recommendations.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    Top Recommendations
                  </h2>
                  <div className="space-y-4">
                    {recommendations.slice(0, 3).map((rec) => (
                      <RecommendationCard key={rec.id} recommendation={rec} />
                    ))}
                  </div>
                  {recommendations.length > 3 && (
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => setActiveTab('recommendations')}
                    >
                      View All {recommendations.length} Recommendations
                    </Button>
                  )}
                </div>
              )}

              {/* Investment Readiness Preview */}
              {investmentReadiness && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Investment Readiness
                  </h2>
                  <InvestmentReadinessGauge readiness={investmentReadiness} />
                </div>
              )}

              {/* Recent Insights */}
              {insights.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-green-600" />
                    Recent Insights
                  </h2>
                  <MLInsightsFeed insights={insights.slice(0, 2)} />
                  {insights.length > 2 && (
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => setActiveTab('insights')}
                    >
                      View All {insights.length} Insights
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-600" />
                <p className="text-gray-600">Loading recommendations...</p>
              </CardContent>
            </Card>
          ) : recommendations.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  All Recommendations ({recommendations.length})
                </h2>
                <Button variant="outline" size="sm" onClick={() => fetchRecommendations()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
              {recommendations.map((rec) => (
                <RecommendationCard key={rec.id} recommendation={rec} />
              ))}
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No recommendations available. You're doing great!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Investment Readiness Tab */}
        <TabsContent value="readiness">
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
                <p className="text-gray-600">Calculating readiness...</p>
              </CardContent>
            </Card>
          ) : investmentReadiness ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Investment Readiness Analysis</h2>
                <Button variant="outline" size="sm" onClick={() => fetchInvestmentReadiness()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recalculate
                </Button>
              </div>
              <InvestmentReadinessGauge readiness={investmentReadiness} />

              {/* Recommendations to improve */}
              {investmentReadiness.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>How to Improve Your Readiness</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {investmentReadiness.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-blue-500 mt-0.5">→</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No readiness data available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights">
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-green-600" />
                <p className="text-gray-600">Analyzing patterns...</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  ML-Powered Insights ({insights.length})
                </h2>
                <Button variant="outline" size="sm" onClick={() => fetchInsights()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
              <MLInsightsFeed insights={insights} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIGuidancePage;

