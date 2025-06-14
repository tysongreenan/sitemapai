import React, { useState } from 'react';
import { ArrowRight, Upload, Settings, Users, FileText, Palette, Database, Brain } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { BrandVoiceSetup } from '../components/jasper/BrandVoiceSetup';
import { KnowledgeBase } from '../components/jasper/KnowledgeBase';

type ActiveView = 'overview' | 'brand-voice' | 'audiences' | 'knowledge-base' | 'style-guide' | 'visual-guidelines';

export default function JasperIQPage() {
  const [activeView, setActiveView] = useState<ActiveView>('overview');

  const knowledgeAssets = [
    {
      id: 'brand-voice',
      title: 'Brand Voice',
      description: 'Brand Voice allows Jasper to use your unique personality in your outputs.',
      color: 'bg-gradient-to-br from-yellow-100 to-yellow-200',
      pattern: 'diagonal-lines',
      icon: <Brain size={32} />,
      status: 'Not Set Up',
      statusColor: 'text-gray-500'
    },
    {
      id: 'audiences',
      title: 'Audiences',
      description: 'Audiences help Jasper create targeted content for your specific audience segments.',
      color: 'bg-gradient-to-br from-pink-100 to-pink-200',
      pattern: 'dots',
      icon: <Users size={32} />,
      status: 'Not Set Up',
      statusColor: 'text-gray-500'
    },
    {
      id: 'knowledge-base',
      title: 'Knowledge Base',
      description: 'Upload company information and assets so Jasper can create more accurate, relevant content.',
      color: 'bg-gradient-to-br from-blue-100 to-blue-200',
      pattern: 'squares',
      icon: <Database size={32} />,
      status: '3 items',
      statusColor: 'text-green-600'
    },
    {
      id: 'style-guide',
      title: 'Style Guide',
      description: 'Style Guide allows you to set rules for your organization\'s term usage, grammar and punctuation.',
      color: 'bg-gradient-to-br from-purple-100 to-purple-200',
      pattern: 'triangles',
      icon: <FileText size={32} />,
      status: 'Not Set Up',
      statusColor: 'text-gray-500'
    },
    {
      id: 'visual-guidelines',
      title: 'Visual Guidelines',
      description: 'Visual Guidelines ensure pictures align with your brand.',
      color: 'bg-gradient-to-br from-green-100 to-green-200',
      pattern: 'circles',
      icon: <Palette size={32} />,
      status: 'Not Set Up',
      statusColor: 'text-gray-500'
    }
  ];

  const getPatternSVG = (pattern: string) => {
    switch (pattern) {
      case 'diagonal-lines':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
            <defs>
              <pattern id="diagonal" patternUnits="userSpaceOnUse" width="10" height="10">
                <path d="M0,10 L10,0" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#diagonal)"/>
          </svg>
        );
      case 'dots':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
            <defs>
              <pattern id="dots" patternUnits="userSpaceOnUse" width="20" height="20">
                <circle cx="10" cy="10" r="2" fill="currentColor"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#dots)"/>
          </svg>
        );
      case 'squares':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
            <defs>
              <pattern id="squares" patternUnits="userSpaceOnUse" width="15" height="15">
                <rect x="5" y="5" width="5" height="5" fill="currentColor"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#squares)"/>
          </svg>
        );
      case 'triangles':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
            <defs>
              <pattern id="triangles" patternUnits="userSpaceOnUse" width="20" height="20">
                <polygon points="10,5 15,15 5,15" fill="currentColor"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#triangles)"/>
          </svg>
        );
      case 'circles':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
            <defs>
              <pattern id="circles" patternUnits="userSpaceOnUse" width="25" height="25">
                <circle cx="12.5" cy="12.5" r="8" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#circles)"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const handleAssetClick = (assetId: string) => {
    setActiveView(assetId as ActiveView);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'brand-voice':
        return <BrandVoiceSetup />;
      case 'knowledge-base':
        return <KnowledgeBase />;
      case 'audiences':
        return (
          <div className="max-w-4xl mx-auto p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Audience Setup</h1>
            <p className="text-gray-600 mb-8">Coming soon! Define your target audiences for more personalized content.</p>
            <Button onClick={() => setActiveView('overview')}>Back to Overview</Button>
          </div>
        );
      case 'style-guide':
        return (
          <div className="max-w-4xl mx-auto p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Style Guide Setup</h1>
            <p className="text-gray-600 mb-8">Coming soon! Set rules for grammar, punctuation, and terminology.</p>
            <Button onClick={() => setActiveView('overview')}>Back to Overview</Button>
          </div>
        );
      case 'visual-guidelines':
        return (
          <div className="max-w-4xl mx-auto p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Palette className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Visual Guidelines Setup</h1>
            <p className="text-gray-600 mb-8">Coming soon! Define visual brand guidelines for AI-generated images.</p>
            <Button onClick={() => setActiveView('overview')}>Back to Overview</Button>
          </div>
        );
      default:
        return (
          <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Jasper IQ</h1>
                  <p className="text-gray-600">
                    Combining deep marketing knowledge with your brand and company knowledge to apply rich, relevant context to every output.
                  </p>
                </div>
              </div>
            </div>

            {/* Knowledge Assets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {knowledgeAssets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => handleAssetClick(asset.id)}
                  className="group relative overflow-hidden rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 cursor-pointer hover:shadow-lg"
                >
                  {/* Background with pattern */}
                  <div className={`${asset.color} h-32 relative`}>
                    {getPatternSVG(asset.pattern)}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-gray-600">
                        {asset.icon}
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {asset.title}
                      </h3>
                      <span className={`text-sm font-medium ${asset.statusColor}`}>
                        {asset.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {asset.description}
                    </p>
                    
                    {/* Action Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      rightIcon={<ArrowRight size={16} />}
                      className="text-indigo-600 hover:text-indigo-700 p-0 h-auto font-medium"
                    >
                      {asset.status === 'Not Set Up' ? `Set up ${asset.title}` : `Manage ${asset.title}`}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Getting Started Section */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200">
              <div className="max-w-3xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Get Started with Jasper IQ
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Jasper IQ helps you create more accurate and relevant content by understanding your brand, audience, and business context. Start by setting up your brand voice and defining your target audiences.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => setActiveView('brand-voice')}
                    leftIcon={<Brain size={16} />}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    Setup Brand Voice
                  </Button>
                  <Button
                    onClick={() => setActiveView('knowledge-base')}
                    variant="outline"
                    leftIcon={<Upload size={16} />}
                  >
                    Upload Knowledge Base
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Tips</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-indigo-600 text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Start with Brand Voice</h4>
                    <p className="text-sm text-gray-600">Define your unique brand personality to ensure consistent messaging across all content.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-indigo-600 text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Upload Knowledge Base</h4>
                    <p className="text-sm text-gray-600">Provide company information and assets for more accurate and relevant content generation.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-indigo-600 text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Define Your Audiences</h4>
                    <p className="text-sm text-gray-600">Create detailed audience profiles to generate more targeted and effective content.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-indigo-600 text-sm font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Set Style Guidelines</h4>
                    <p className="text-sm text-gray-600">Establish rules for grammar, punctuation, and terminology to maintain consistency.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {activeView !== 'overview' && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => setActiveView('overview')}
            leftIcon={<ArrowRight size={16} className="rotate-180" />}
          >
            Back to Jasper IQ
          </Button>
        </div>
      )}
      {renderContent()}
    </div>
  );
}