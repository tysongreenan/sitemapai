import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Eye, MousePointer, Activity } from 'lucide-react';

interface LiveMetrics {
  impressions?: number;
  clicks?: number;
  ctr?: number;
  conversions?: number;
  conversionRate?: number;
  spend?: number;
  cpc?: number;
  cpm?: number;
  roas?: number;
  engagement?: {
    likes?: number;
    comments?: number;
    shares?: number;
  };
  period?: {
    start: Date;
    end: Date;
  };
  previousPeriod?: {
    impressions?: number;
    clicks?: number;
    spend?: number;
  };
}

interface MetricCardProps {
  label: string;
  value: number | string;
  change?: number;
  format?: 'number' | 'currency' | 'percentage';
  icon?: any;
  color?: string;
}

function MetricCard({ label, value, change, format = 'number', icon: Icon, color = 'text-gray-600' }: MetricCardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat('en-US', {
          notation: val > 999999 ? 'compact' : 'standard',
          compactDisplay: 'short',
        }).format(val);
    }
  };

  return (
    <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600 font-medium">{label}</span>
        {Icon && <Icon size={14} className={color} />}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-lg font-bold text-gray-900">
          {formatValue(value)}
        </span>
        {change !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface SocialAdMetricsProps {
  nodeId: string;
  platform: string;
  metadata?: any;
}

export function SocialAdMetrics({ nodeId, platform, metadata }: SocialAdMetricsProps) {
  const [metrics, setMetrics] = useState<LiveMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for platform data sync events
    const handleDataSync = (event: CustomEvent) => {
      if (event.detail.platform === platform) {
        setMetrics(event.detail.data);
        setLoading(false);
      }
    };

    window.addEventListener('platform-data-sync' as any, handleDataSync);
    
    // Fetch initial data or use metadata
    if (metadata?.impressions) {
      setMetrics({
        impressions: metadata.impressions,
        clicks: metadata.clicks,
        spend: metadata.spend ? parseFloat(metadata.spend.replace('$', '')) : undefined,
        ctr: metadata.ctr,
        conversions: metadata.conversions,
        period: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          end: new Date()
        }
      });
      setLoading(false);
    } else {
      // Simulate loading
      setTimeout(() => {
        setLoading(false);
        setError('Connect your platform to see live metrics');
      }, 1000);
    }

    return () => {
      window.removeEventListener('platform-data-sync' as any, handleDataSync);
    };
  }, [nodeId, platform, metadata]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-20 bg-gray-100 rounded-lg" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-16 bg-gray-100 rounded-lg" />
          <div className="h-16 bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
        {error}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-600">
        No data available. Connect your {platform} account to see live metrics.
      </div>
    );
  }

  // Calculate changes (mock data for demo)
  const impressionChange = Math.random() * 20 - 10; // Random change between -10% and +10%
  const clickChange = Math.random() * 30 - 15;
  const spendChange = Math.random() * 25 - 12.5;

  return (
    <div className="space-y-3">
      {/* Main metrics */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCard 
          label="Impressions" 
          value={metrics.impressions || 0} 
          change={impressionChange}
          icon={Eye}
          color="text-blue-600"
        />
        <MetricCard 
          label="Clicks" 
          value={metrics.clicks || 0} 
          change={clickChange}
          icon={MousePointer}
          color="text-green-600"
        />
        <MetricCard 
          label="CTR" 
          value={metrics.ctr || 0} 
          format="percentage"
          icon={Activity}
          color="text-purple-600"
        />
        <MetricCard 
          label="Spend" 
          value={metrics.spend || 0} 
          format="currency"
          change={spendChange}
          icon={DollarSign}
          color="text-red-600"
        />
      </div>

      {/* Additional metrics based on platform */}
      {platform === 'facebook_ads' && metrics.engagement && (
        <div className="border-t pt-3">
          <p className="text-xs text-gray-600 mb-2 font-medium">Engagement</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-gray-50 rounded p-2">
              <p className="text-sm font-semibold text-blue-600">{metrics.engagement.likes}</p>
              <p className="text-xs text-gray-500">Likes</p>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <p className="text-sm font-semibold text-green-600">{metrics.engagement.comments}</p>
              <p className="text-xs text-gray-500">Comments</p>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <p className="text-sm font-semibold text-purple-600">{metrics.engagement.shares}</p>
              <p className="text-xs text-gray-500">Shares</p>
            </div>
          </div>
        </div>
      )}

      {/* Performance indicators */}
      {metrics.roas && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
          <p className="text-xs text-green-700 font-medium">ROAS</p>
          <p className="text-lg font-bold text-green-900">{metrics.roas.toFixed(2)}x</p>
        </div>
      )}

      {/* Date range */}
      {metrics.period && (
        <p className="text-xs text-gray-500 text-center">
          {new Date(metrics.period.start).toLocaleDateString()} - {new Date(metrics.period.end).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

// Analytics Dashboard Metrics
export function AnalyticsMetrics({ nodeId, subType }: { nodeId: string; subType?: string }) {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading analytics data
    setTimeout(() => {
      const mockData = {
        funnel: {
          steps: [
            { name: 'Visitors', value: 10000, change: 12 },
            { name: 'Leads', value: 2500, change: 8 },
            { name: 'Qualified', value: 800, change: -3 },
            { name: 'Customers', value: 120, change: 15 }
          ]
        },
        heatmap: {
          clicks: 15420,
          scrollDepth: 68,
          timeOnPage: 145,
          bounceRate: 32
        },
        metrics: {
          pageViews: 45600,
          uniqueVisitors: 12300,
          conversionRate: 2.8,
          avgSessionDuration: 185
        }
      };

      setMetrics(mockData[subType as keyof typeof mockData] || mockData.metrics);
      setLoading(false);
    }, 1000);
  }, [subType]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-16 bg-gray-100 rounded-lg" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-12 bg-gray-100 rounded-lg" />
          <div className="h-12 bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  if (subType === 'funnel' && metrics?.steps) {
    return (
      <div className="space-y-2">
        {metrics.steps.map((step: any, index: number) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-sm font-medium">{step.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{step.value.toLocaleString()}</span>
              <span className={`text-xs ${step.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {step.change >= 0 ? '+' : ''}{step.change}%
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (subType === 'heatmap') {
    return (
      <div className="grid grid-cols-2 gap-2">
        <MetricCard label="Clicks" value={metrics.clicks} icon={MousePointer} />
        <MetricCard label="Scroll %" value={metrics.scrollDepth} format="percentage" />
        <MetricCard label="Time (s)" value={metrics.timeOnPage} />
        <MetricCard label="Bounce %" value={metrics.bounceRate} format="percentage" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <MetricCard label="Page Views" value={metrics.pageViews} icon={Eye} />
      <MetricCard label="Visitors" value={metrics.uniqueVisitors} icon={Users} />
      <MetricCard label="Conv. Rate" value={metrics.conversionRate} format="percentage" />
      <MetricCard label="Avg. Session" value={`${metrics.avgSessionDuration}s`} />
    </div>
  );
}