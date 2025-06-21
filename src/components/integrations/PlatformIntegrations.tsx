import React, { useState, useEffect } from 'react';
import { 
  Globe, Facebook, Instagram, Youtube, BarChart3, 
  Link2, Check, X, RefreshCw, Settings, Shield,
  TrendingUp, Users, DollarSign, Eye, Twitter, Linkedin
} from 'lucide-react';
import { Button } from '../ui/Button';
import { toast } from 'react-toastify';

interface IntegrationConfig {
  id: string;
  name: string;
  platform: 'google_analytics' | 'google_ads' | 'facebook_ads' | 'instagram_ads' | 'tiktok_ads' | 'twitter_ads' | 'linkedin_ads';
  icon: any;
  color: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: Date;
  credentials?: {
    accessToken?: string;
    refreshToken?: string;
    accountId?: string;
    propertyId?: string;
    clientId?: string;
  };
  permissions?: string[];
  metrics?: {
    impressions?: number;
    clicks?: number;
    spend?: number;
    ctr?: number;
    conversions?: number;
  };
}

export function PlatformIntegrations() {
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([
    {
      id: 'google_analytics',
      name: 'Google Analytics',
      platform: 'google_analytics',
      icon: BarChart3,
      color: 'bg-orange-500',
      status: 'disconnected',
    },
    {
      id: 'google_ads',
      name: 'Google Ads',
      platform: 'google_ads',
      icon: Globe,
      color: 'bg-blue-500',
      status: 'disconnected',
    },
    {
      id: 'facebook_ads',
      name: 'Meta Ads (Facebook)',
      platform: 'facebook_ads',
      icon: Facebook,
      color: 'bg-blue-700',
      status: 'connected',
      lastSync: new Date(Date.now() - 300000), // 5 minutes ago
      metrics: {
        impressions: 125000,
        clicks: 3400,
        spend: 450.20,
        ctr: 2.72,
        conversions: 89
      }
    },
    {
      id: 'instagram_ads',
      name: 'Instagram Ads',
      platform: 'instagram_ads',
      icon: Instagram,
      color: 'bg-pink-500',
      status: 'connected',
      lastSync: new Date(Date.now() - 600000), // 10 minutes ago
      metrics: {
        impressions: 89000,
        clicks: 2100,
        spend: 320.50,
        ctr: 2.36,
        conversions: 67
      }
    },
    {
      id: 'twitter_ads',
      name: 'Twitter Ads',
      platform: 'twitter_ads',
      icon: Twitter,
      color: 'bg-blue-400',
      status: 'disconnected',
    },
    {
      id: 'linkedin_ads',
      name: 'LinkedIn Ads',
      platform: 'linkedin_ads',
      icon: Linkedin,
      color: 'bg-blue-800',
      status: 'disconnected',
    },
  ]);

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<IntegrationConfig | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // OAuth flow for Google
  const connectGooglePlatform = async (platform: 'google_analytics' | 'google_ads') => {
    setIsConnecting(true);
    
    // Simulate OAuth flow
    toast.info('Opening authentication window...');
    
    // In a real implementation, this would open OAuth window
    setTimeout(() => {
      // Simulate successful connection
      updateIntegrationStatus(platform, 'connected', {
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        accountId: 'mock_account_id'
      });
      
      toast.success(`Successfully connected to ${platform}`);
      setIsConnecting(false);
      
      // Fetch initial data
      syncPlatformData(platform);
    }, 2000);
  };

  // OAuth flow for Meta (Facebook/Instagram)
  const connectMetaPlatform = async (platform: 'facebook_ads' | 'instagram_ads') => {
    setIsConnecting(true);
    
    toast.info('Opening Meta authentication...');
    
    // Simulate OAuth flow
    setTimeout(() => {
      updateIntegrationStatus(platform, 'connected', {
        accessToken: 'mock_meta_token',
        accountId: 'mock_meta_account'
      });
      
      toast.success(`Successfully connected to ${platform}`);
      setIsConnecting(false);
      
      syncPlatformData(platform);
    }, 2000);
  };

  // Connect other platforms
  const connectOtherPlatform = async (platform: 'twitter_ads' | 'linkedin_ads' | 'tiktok_ads') => {
    setIsConnecting(true);
    
    toast.info(`Opening ${platform} authentication...`);
    
    setTimeout(() => {
      updateIntegrationStatus(platform, 'connected', {
        accessToken: `mock_${platform}_token`,
        accountId: `mock_${platform}_account`
      });
      
      toast.success(`Successfully connected to ${platform}`);
      setIsConnecting(false);
      
      syncPlatformData(platform);
    }, 2000);
  };

  // Update integration status
  const updateIntegrationStatus = (
    platformId: string, 
    status: 'connected' | 'disconnected' | 'error',
    credentials?: any
  ) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === platformId
        ? { 
            ...integration, 
            status, 
            credentials,
            lastSync: status === 'connected' ? new Date() : integration.lastSync 
          }
        : integration
    ));
  };

  // Sync platform data
  const syncPlatformData = async (platformId: string) => {
    const integration = integrations.find(i => i.id === platformId);
    if (!integration || integration.status !== 'connected') return;

    try {
      toast.info(`Syncing data from ${integration.name}...`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock metrics based on platform
      const mockMetrics = generateMockMetrics(platformId);
      
      setIntegrations(prev => prev.map(int => 
        int.id === platformId 
          ? { ...int, metrics: mockMetrics, lastSync: new Date() }
          : int
      ));
      
      toast.success(`Data synced from ${integration.name}`);
      
      // Emit event to update canvas nodes with new data
      window.dispatchEvent(new CustomEvent('platform-data-sync', {
        detail: { platform: platformId, data: mockMetrics }
      }));
    } catch (error) {
      updateIntegrationStatus(platformId, 'error');
      toast.error(`Failed to sync data from ${integration.name}`);
    }
  };

  // Generate mock metrics for demo
  const generateMockMetrics = (platformId: string) => {
    const baseMetrics = {
      impressions: Math.floor(Math.random() * 100000) + 50000,
      clicks: Math.floor(Math.random() * 5000) + 1000,
      spend: Math.floor(Math.random() * 500) + 100,
      ctr: Math.random() * 3 + 1,
      conversions: Math.floor(Math.random() * 100) + 20
    };

    // Adjust metrics based on platform characteristics
    switch (platformId) {
      case 'google_ads':
        return { ...baseMetrics, ctr: baseMetrics.ctr * 1.2 }; // Google typically has higher CTR
      case 'facebook_ads':
        return { ...baseMetrics, impressions: baseMetrics.impressions * 1.5 }; // Facebook has high reach
      case 'instagram_ads':
        return { ...baseMetrics, ctr: baseMetrics.ctr * 0.8, impressions: baseMetrics.impressions * 0.7 };
      case 'linkedin_ads':
        return { ...baseMetrics, spend: baseMetrics.spend * 2, ctr: baseMetrics.ctr * 0.6 }; // LinkedIn is more expensive
      default:
        return baseMetrics;
    }
  };

  // Disconnect platform
  const disconnectPlatform = async (platformId: string) => {
    if (window.confirm('Are you sure you want to disconnect this platform?')) {
      try {
        updateIntegrationStatus(platformId, 'disconnected');
        
        // Clear metrics
        setIntegrations(prev => prev.map(int => 
          int.id === platformId 
            ? { ...int, metrics: undefined, credentials: undefined }
            : int
        ));
        
        toast.success('Platform disconnected');
      } catch (error) {
        toast.error('Failed to disconnect platform');
      }
    }
  };

  // Calculate total metrics
  const totalMetrics = integrations
    .filter(i => i.status === 'connected' && i.metrics)
    .reduce((acc, integration) => {
      const metrics = integration.metrics!;
      return {
        impressions: acc.impressions + (metrics.impressions || 0),
        clicks: acc.clicks + (metrics.clicks || 0),
        spend: acc.spend + (metrics.spend || 0),
        conversions: acc.conversions + (metrics.conversions || 0)
      };
    }, { impressions: 0, clicks: 0, spend: 0, conversions: 0 });

  const avgCTR = totalMetrics.clicks > 0 ? (totalMetrics.clicks / totalMetrics.impressions) * 100 : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Platform Integrations</h2>
          <p className="text-gray-600 mt-1">Connect your marketing platforms to pull live data into your customer journey</p>
        </div>
        <Button
          variant="outline"
          leftIcon={<RefreshCw size={16} />}
          onClick={() => integrations.forEach(i => i.status === 'connected' && syncPlatformData(i.id))}
        >
          Sync All
        </Button>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          const isConnected = integration.status === 'connected';
          
          return (
            <div
              key={integration.id}
              className={`bg-white rounded-xl border-2 p-4 transition-all ${
                isConnected ? 'border-green-200 shadow-sm' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${integration.color} rounded-lg flex items-center justify-center`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{integration.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {isConnected ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-xs text-green-600">Connected</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-gray-400 rounded-full" />
                          <span className="text-xs text-gray-500">Not connected</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {isConnected && (
                  <button
                    onClick={() => disconnectPlatform(integration.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Disconnect"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {isConnected ? (
                <div className="space-y-3">
                  {/* Metrics */}
                  {integration.metrics && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-50 p-2 rounded text-center">
                        <div className="font-semibold text-blue-600">
                          {integration.metrics.impressions?.toLocaleString()}
                        </div>
                        <div className="text-gray-500">Impressions</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded text-center">
                        <div className="font-semibold text-green-600">
                          {integration.metrics.clicks?.toLocaleString()}
                        </div>
                        <div className="text-gray-500">Clicks</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded text-center">
                        <div className="font-semibold text-purple-600">
                          ${integration.metrics.spend?.toFixed(2)}
                        </div>
                        <div className="text-gray-500">Spend</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded text-center">
                        <div className="font-semibold text-orange-600">
                          {integration.metrics.ctr?.toFixed(2)}%
                        </div>
                        <div className="text-gray-500">CTR</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-600">
                    Last sync: {integration.lastSync?.toLocaleTimeString()}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => syncPlatformData(integration.id)}
                      leftIcon={<RefreshCw size={14} />}
                    >
                      Sync Now
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedPlatform(integration);
                        setShowConnectModal(true);
                      }}
                      leftIcon={<Settings size={14} />}
                    >
                      Settings
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setSelectedPlatform(integration);
                    setIsConnecting(true);
                    
                    if (integration.platform.includes('google')) {
                      connectGooglePlatform(integration.platform as any);
                    } else if (integration.platform.includes('facebook') || integration.platform.includes('instagram')) {
                      connectMetaPlatform(integration.platform as any);
                    } else {
                      connectOtherPlatform(integration.platform as any);
                    }
                  }}
                  leftIcon={<Link2 size={14} />}
                  className="w-full"
                  disabled={isConnecting}
                >
                  {isConnecting ? 'Connecting...' : 'Connect'}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Connected Accounts Summary */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Accounts Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Eye size={16} />
              <span className="text-sm">Total Impressions</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {totalMetrics.impressions.toLocaleString()}
            </p>
            <p className="text-xs text-green-600 mt-1">+12% vs last week</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Users size={16} />
              <span className="text-sm">Total Clicks</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {totalMetrics.clicks.toLocaleString()}
            </p>
            <p className="text-xs text-green-600 mt-1">+8% vs last week</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <DollarSign size={16} />
              <span className="text-sm">Total Spend</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${totalMetrics.spend.toFixed(2)}
            </p>
            <p className="text-xs text-red-600 mt-1">+5% vs last week</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <TrendingUp size={16} />
              <span className="text-sm">Avg. CTR</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {avgCTR.toFixed(2)}%
            </p>
            <p className="text-xs text-green-600 mt-1">+0.3% vs last week</p>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Shield size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Your data is secure</p>
          <p>We use OAuth 2.0 for authentication and only request read-only access to your marketing data. Your credentials are encrypted and never shared.</p>
        </div>
      </div>

      {/* Connection Instructions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Connect Your Platforms</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Google Platforms</h4>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Click "Connect" on Google Ads or Analytics</li>
              <li>Sign in with your Google account</li>
              <li>Grant read-only permissions</li>
              <li>Select the accounts you want to connect</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Meta Platforms</h4>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Click "Connect" on Facebook or Instagram Ads</li>
              <li>Log in to your Meta Business account</li>
              <li>Authorize the application</li>
              <li>Choose your ad accounts to sync</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}