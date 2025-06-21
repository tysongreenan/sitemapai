import React, { useState } from 'react';
import { 
  Plus, FileText, Image, Video, Globe, Youtube, 
  Facebook, Instagram, Monitor, Code, Link2,
  BarChart3, Mail, MessageSquare, ShoppingCart,
  CreditCard, Users, Target, Zap, Twitter, Linkedin,
  Play, TrendingUp, MousePointer, Activity
} from 'lucide-react';
import { Button } from '../ui/Button';

interface AddContentMenuProps {
  onAddContent: (type: string, subType?: string, metadata?: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function AddContentMenu({ onAddContent, isOpen, onClose }: AddContentMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('touchpoints');

  const categories = [
    { id: 'touchpoints', label: 'Touch Points', icon: Target },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'ads', label: 'Ads & Media', icon: Monitor },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'actions', label: 'Actions', icon: Zap },
  ];

  const contentTypes = {
    touchpoints: [
      {
        type: 'website',
        label: 'Website/Landing Page',
        icon: Globe,
        description: 'Add a website URL or landing page',
        metadata: { device: 'desktop' }
      },
      {
        type: 'social_ad',
        subType: 'facebook',
        label: 'Facebook Ad',
        icon: Facebook,
        description: 'Facebook/Instagram ad campaign',
        metadata: { platform: 'Facebook', impressions: 12500, clicks: 340, cost: '$45.20' }
      },
      {
        type: 'social_ad',
        subType: 'google',
        label: 'Google Ad',
        icon: Globe,
        description: 'Google Ads campaign',
        metadata: { platform: 'Google Ads', impressions: 8900, clicks: 267, cost: '$38.50' }
      },
      {
        type: 'youtube',
        label: 'YouTube Video',
        icon: Youtube,
        description: 'YouTube video content',
        metadata: {}
      },
      {
        type: 'social_ad',
        subType: 'instagram',
        label: 'Instagram Ad',
        icon: Instagram,
        description: 'Instagram feed/story ad',
        metadata: { platform: 'Instagram', impressions: 15600, clicks: 420, cost: '$52.80' }
      },
      {
        type: 'social_ad',
        subType: 'linkedin',
        label: 'LinkedIn Ad',
        icon: Linkedin,
        description: 'LinkedIn sponsored content',
        metadata: { platform: 'LinkedIn', impressions: 4200, clicks: 89, cost: '$67.30' }
      },
    ],
    content: [
      {
        type: 'text',
        label: 'Text Content',
        icon: FileText,
        description: 'Add text, copy, or notes',
        metadata: {}
      },
      {
        type: 'image',
        label: 'Image/Screenshot',
        icon: Image,
        description: 'Add images or screenshots',
        metadata: {}
      },
      {
        type: 'video',
        label: 'Video Asset',
        icon: Video,
        description: 'Add video content',
        metadata: {}
      },
      {
        type: 'embed',
        label: 'Custom Embed',
        icon: Code,
        description: 'Embed custom HTML/iframe',
        metadata: {}
      },
    ],
    ads: [
      {
        type: 'social_ad',
        subType: 'twitter',
        label: 'Twitter Ad',
        icon: Twitter,
        description: 'Twitter promoted tweets',
        metadata: { platform: 'Twitter', impressions: 6800, clicks: 156, cost: '$29.40' }
      },
      {
        type: 'social_ad',
        subType: 'tiktok',
        label: 'TikTok Ad',
        icon: Video,
        description: 'TikTok advertising',
        metadata: { platform: 'TikTok', impressions: 22000, clicks: 890, cost: '$78.90' }
      },
      {
        type: 'social_ad',
        subType: 'google',
        label: 'Display Banner',
        icon: Monitor,
        description: 'Display/banner advertising',
        metadata: { platform: 'Display Network', impressions: 45000, clicks: 234, cost: '$34.60' }
      },
      {
        type: 'youtube',
        label: 'YouTube Ad',
        icon: Youtube,
        description: 'YouTube video advertising',
        metadata: { platform: 'YouTube Ads' }
      },
    ],
    analytics: [
      {
        type: 'analytics',
        subType: 'funnel',
        label: 'Funnel Analytics',
        icon: TrendingUp,
        description: 'Conversion funnel data',
        metadata: { chartType: 'funnel' }
      },
      {
        type: 'analytics',
        subType: 'heatmap',
        label: 'Heatmap',
        icon: MousePointer,
        description: 'Click/scroll heatmap data',
        metadata: { chartType: 'heatmap' }
      },
      {
        type: 'analytics',
        subType: 'metrics',
        label: 'Key Metrics',
        icon: Activity,
        description: 'KPIs and metrics dashboard',
        metadata: { chartType: 'metrics' }
      },
      {
        type: 'analytics',
        subType: 'performance',
        label: 'Performance Report',
        icon: BarChart3,
        description: 'Campaign performance analytics',
        metadata: { chartType: 'performance' }
      },
    ],
    actions: [
      {
        type: 'action',
        subType: 'form',
        label: 'Form Submission',
        icon: MessageSquare,
        description: 'Contact or lead form',
        metadata: { actionType: 'form', conversionRate: '12.5%' }
      },
      {
        type: 'action',
        subType: 'purchase',
        label: 'Purchase/Checkout',
        icon: ShoppingCart,
        description: 'E-commerce checkout',
        metadata: { actionType: 'purchase', conversionRate: '3.2%' }
      },
      {
        type: 'action',
        subType: 'payment',
        label: 'Payment Gateway',
        icon: CreditCard,
        description: 'Payment processing',
        metadata: { actionType: 'payment', conversionRate: '8.7%' }
      },
      {
        type: 'action',
        subType: 'cta',
        label: 'Call-to-Action',
        icon: Zap,
        description: 'CTA button or link',
        metadata: { actionType: 'cta', conversionRate: '15.8%' }
      },
      {
        type: 'action',
        subType: 'signup',
        label: 'Email Signup',
        icon: Mail,
        description: 'Newsletter or email signup',
        metadata: { actionType: 'signup', conversionRate: '22.1%' }
      },
    ],
  };

  if (!isOpen) return null;

  const handleAddContent = (item: any) => {
    const title = window.prompt(`Enter a title for this ${item.label}:`, item.label);
    if (title) {
      onAddContent(item.type, item.subType, {
        ...item.metadata,
        title,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add to Customer Journey</h2>
            <p className="text-sm text-gray-600 mt-1">Build your marketing funnel with touchpoints, content, and analytics</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
          >
            <Plus size={20} className="rotate-45" />
          </button>
        </div>

        <div className="flex h-[calc(85vh-80px)]">
          {/* Categories Sidebar */}
          <div className="w-56 bg-gray-50 border-r border-gray-200 p-4">
            <div className="space-y-1">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} />
                    {category.label}
                  </button>
                );
              })}
            </div>
            
            {/* Category Description */}
            <div className="mt-6 p-3 bg-white rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">
                {categories.find(c => c.id === selectedCategory)?.label}
              </h4>
              <p className="text-xs text-gray-600">
                {selectedCategory === 'touchpoints' && 'Customer interaction points in your marketing funnel'}
                {selectedCategory === 'content' && 'Marketing content and creative assets'}
                {selectedCategory === 'ads' && 'Paid advertising campaigns across platforms'}
                {selectedCategory === 'analytics' && 'Data visualization and performance metrics'}
                {selectedCategory === 'actions' && 'User actions and conversion points'}
              </p>
            </div>
          </div>

          {/* Content Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {contentTypes[selectedCategory as keyof typeof contentTypes]?.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleAddContent(item)}
                    className="flex items-start gap-4 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all text-left group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                      <Icon size={24} className="text-gray-600 group-hover:text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.label}</h3>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      
                      {/* Show sample metrics for ads and analytics */}
                      {(item.metadata?.impressions || item.metadata?.conversionRate) && (
                        <div className="flex gap-3 text-xs text-gray-500">
                          {item.metadata.impressions && (
                            <span>{item.metadata.impressions.toLocaleString()} impressions</span>
                          )}
                          {item.metadata.clicks && (
                            <span>{item.metadata.clicks} clicks</span>
                          )}
                          {item.metadata.conversionRate && (
                            <span>{item.metadata.conversionRate} conversion</span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}