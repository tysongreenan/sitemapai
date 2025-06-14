import React, { useState } from 'react';
import { Search, Filter, Star, Zap, FileText, Image, Mail, BarChart3, Target, Users, Video, MessageCircle, Calendar, Megaphone } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { AppCard } from '../components/apps/AppCard';
import { AppModal } from '../components/apps/AppModal';

interface App {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  isNew?: boolean;
  isUpgrade?: boolean;
  isPopular?: boolean;
  rating?: number;
  usageCount?: number;
  inputs: Array<{
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'select';
    placeholder?: string;
    options?: string[];
    required?: boolean;
  }>;
}

export default function AppsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Apps');
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = ['All Apps', 'Content Creation', 'Social Media', 'Email Marketing', 'Analytics', 'Design'];

  const apps: App[] = [
    {
      id: 'blog-post',
      name: 'Blog Post Generator',
      description: 'Create comprehensive, SEO-optimized blog posts that engage your audience and drive traffic to your website.',
      icon: <FileText size={24} />,
      category: 'Content Creation',
      isPopular: true,
      rating: 4.8,
      usageCount: 15420,
      inputs: [
        { id: 'topic', label: 'Blog Topic', type: 'text', placeholder: 'e.g., AI in Marketing', required: true },
        { id: 'audience', label: 'Target Audience', type: 'select', options: ['Marketing Professionals', 'Small Business Owners', 'Entrepreneurs', 'General Public'], required: true },
        { id: 'tone', label: 'Writing Tone', type: 'select', options: ['Professional', 'Casual', 'Authoritative', 'Friendly'], required: true },
        { id: 'keywords', label: 'SEO Keywords', type: 'text', placeholder: 'Enter keywords separated by commas' },
        { id: 'length', label: 'Article Length', type: 'select', options: ['Short (500-800 words)', 'Medium (800-1500 words)', 'Long (1500+ words)'] }
      ]
    },
    {
      id: 'social-media',
      name: 'Social Media Content Pack',
      description: 'Generate engaging social media posts for Instagram, Twitter, LinkedIn, and Facebook with hashtags and captions.',
      icon: <MessageCircle size={24} />,
      category: 'Social Media',
      isNew: true,
      rating: 4.9,
      usageCount: 8930,
      inputs: [
        { id: 'message', label: 'Core Message', type: 'textarea', placeholder: 'What do you want to communicate?', required: true },
        { id: 'platforms', label: 'Platforms', type: 'select', options: ['All Platforms', 'Instagram Only', 'Twitter Only', 'LinkedIn Only', 'Facebook Only'] },
        { id: 'style', label: 'Content Style', type: 'select', options: ['Promotional', 'Educational', 'Inspirational', 'Behind-the-scenes', 'User-generated'] },
        { id: 'hashtags', label: 'Include Hashtags', type: 'select', options: ['Yes', 'No'] }
      ]
    },
    {
      id: 'email-campaign',
      name: 'Email Campaign Builder',
      description: 'Create compelling email sequences that convert subscribers into customers with personalized messaging.',
      icon: <Mail size={24} />,
      category: 'Email Marketing',
      isUpgrade: true,
      rating: 4.7,
      usageCount: 12340,
      inputs: [
        { id: 'campaign_type', label: 'Campaign Type', type: 'select', options: ['Welcome Series', 'Product Launch', 'Newsletter', 'Promotional', 'Re-engagement'], required: true },
        { id: 'audience_segment', label: 'Audience Segment', type: 'select', options: ['New Subscribers', 'Existing Customers', 'Inactive Users', 'VIP Customers'] },
        { id: 'goal', label: 'Campaign Goal', type: 'text', placeholder: 'e.g., Increase sales, Drive website traffic', required: true },
        { id: 'offer', label: 'Special Offer', type: 'text', placeholder: 'e.g., 20% discount, Free trial' }
      ]
    },
    {
      id: 'ad-copy',
      name: 'Ad Copy Generator',
      description: 'Create high-converting ad copy for Google Ads, Facebook Ads, and other advertising platforms.',
      icon: <Target size={24} />,
      category: 'Content Creation',
      rating: 4.6,
      usageCount: 9870,
      inputs: [
        { id: 'product', label: 'Product/Service', type: 'text', placeholder: 'What are you advertising?', required: true },
        { id: 'platform', label: 'Ad Platform', type: 'select', options: ['Google Ads', 'Facebook Ads', 'Instagram Ads', 'LinkedIn Ads', 'Twitter Ads'] },
        { id: 'objective', label: 'Campaign Objective', type: 'select', options: ['Brand Awareness', 'Lead Generation', 'Sales', 'Website Traffic', 'App Downloads'] },
        { id: 'budget', label: 'Budget Range', type: 'select', options: ['Under $1,000', '$1,000-$5,000', '$5,000-$10,000', 'Over $10,000'] }
      ]
    },
    {
      id: 'video-script',
      name: 'Video Script Writer',
      description: 'Generate engaging video scripts for YouTube, TikTok, promotional videos, and explainer content.',
      icon: <Video size={24} />,
      category: 'Content Creation',
      isNew: true,
      rating: 4.5,
      usageCount: 5670,
      inputs: [
        { id: 'video_type', label: 'Video Type', type: 'select', options: ['Explainer Video', 'Product Demo', 'Tutorial', 'Promotional', 'Social Media Short'], required: true },
        { id: 'duration', label: 'Video Duration', type: 'select', options: ['30 seconds', '1 minute', '2-3 minutes', '5+ minutes'] },
        { id: 'topic', label: 'Video Topic', type: 'text', placeholder: 'What is your video about?', required: true },
        { id: 'cta', label: 'Call to Action', type: 'text', placeholder: 'What action should viewers take?' }
      ]
    },
    {
      id: 'landing-page',
      name: 'Landing Page Copy',
      description: 'Create persuasive landing page copy that converts visitors into leads and customers.',
      icon: <BarChart3 size={24} />,
      category: 'Content Creation',
      rating: 4.8,
      usageCount: 7890,
      inputs: [
        { id: 'offer', label: 'Main Offer', type: 'text', placeholder: 'What are you offering?', required: true },
        { id: 'target_audience', label: 'Target Audience', type: 'text', placeholder: 'Who is this for?', required: true },
        { id: 'pain_point', label: 'Main Pain Point', type: 'textarea', placeholder: 'What problem does your offer solve?' },
        { id: 'benefits', label: 'Key Benefits', type: 'textarea', placeholder: 'List the main benefits (one per line)' }
      ]
    },
    {
      id: 'press-release',
      name: 'Press Release Writer',
      description: 'Generate professional press releases for product launches, company news, and announcements.',
      icon: <Megaphone size={24} />,
      category: 'Content Creation',
      rating: 4.4,
      usageCount: 3450,
      inputs: [
        { id: 'announcement', label: 'Announcement', type: 'text', placeholder: 'What are you announcing?', required: true },
        { id: 'company', label: 'Company Name', type: 'text', placeholder: 'Your company name', required: true },
        { id: 'location', label: 'Location', type: 'text', placeholder: 'City, State' },
        { id: 'quote', label: 'Executive Quote', type: 'textarea', placeholder: 'Quote from company executive' }
      ]
    },
    {
      id: 'content-calendar',
      name: 'Content Calendar Planner',
      description: 'Plan and organize your content strategy with AI-generated content ideas and scheduling suggestions.',
      icon: <Calendar size={24} />,
      category: 'Content Creation',
      isUpgrade: true,
      rating: 4.7,
      usageCount: 6780,
      inputs: [
        { id: 'timeframe', label: 'Planning Timeframe', type: 'select', options: ['1 Week', '2 Weeks', '1 Month', '3 Months'], required: true },
        { id: 'content_types', label: 'Content Types', type: 'select', options: ['Blog Posts Only', 'Social Media Only', 'Mixed Content', 'Email + Social'] },
        { id: 'industry', label: 'Industry', type: 'text', placeholder: 'Your industry or niche', required: true },
        { id: 'posting_frequency', label: 'Posting Frequency', type: 'select', options: ['Daily', '3x per week', 'Weekly', 'Bi-weekly'] }
      ]
    }
  ];

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Apps' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseApp = (appId: string) => {
    const app = apps.find(a => a.id === appId);
    if (app) {
      setSelectedApp(app);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApp(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Apps Marketplace</h1>
            <p className="text-gray-600">
              Pre-built AI tools for specific marketing tasks. Create content in minutes, not hours.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-200">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              selectedCategory === category
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {category}
            {category === 'All Apps' && (
              <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                {apps.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search apps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          leftIcon={<Filter size={16} />}
        >
          Filter
        </Button>
      </div>

      {/* Featured Apps Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">🚀 Featured Apps</h2>
            <p className="text-purple-100 mb-4">
              Most popular AI tools used by marketing professionals
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-300 fill-current" />
                <span>4.8+ Rating</span>
              </div>
              <div className="flex items-center gap-1">
                <Users size={16} />
                <span>50k+ Users</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
              <Zap size={40} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApps.map((app) => (
          <AppCard
            key={app.id}
            app={app}
            onUse={handleUseApp}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredApps.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No apps found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms or browse different categories.
          </p>
        </div>
      )}

      {/* App Modal */}
      <AppModal
        app={selectedApp}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}