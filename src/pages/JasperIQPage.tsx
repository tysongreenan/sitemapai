import React from 'react';
import { ArrowRight, Upload, Settings } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function JasperIQPage() {
  const knowledgeAssets = [
    {
      id: 1,
      title: 'Brand Voice',
      description: 'Brand Voice allows Jasper to use your unique personality in your outputs.',
      color: 'bg-gradient-to-br from-yellow-100 to-yellow-200',
      pattern: 'diagonal-lines',
      href: '/jasper-iq/brand-voice'
    },
    {
      id: 2,
      title: 'Audiences',
      description: 'Audiences help Jasper create targeted content for your specific audience segments.',
      color: 'bg-gradient-to-br from-pink-100 to-pink-200',
      pattern: 'dots',
      href: '/jasper-iq/audiences'
    },
    {
      id: 3,
      title: 'Knowledge Base',
      description: 'Upload company information and assets so Jasper can create more accurate, relevant content.',
      color: 'bg-gradient-to-br from-blue-100 to-blue-200',
      pattern: 'squares',
      href: '/jasper-iq/knowledge-base'
    },
    {
      id: 4,
      title: 'Style Guide',
      description: 'Style Guide allows you to set rules for your organization\'s term usage, grammar and punctuation.',
      color: 'bg-gradient-to-br from-purple-100 to-purple-200',
      pattern: 'triangles',
      href: '/jasper-iq/style-guide'
    },
    {
      id: 5,
      title: 'Visual Guidelines',
      description: 'Visual Guidelines ensure pictures align with your brand.',
      color: 'bg-gradient-to-br from-green-100 to-green-200',
      pattern: 'circles',
      href: '/jasper-iq/visual-guidelines'
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Jasper IQ</h1>
        <p className="text-gray-600 max-w-3xl">
          Combining deep marketing knowledge with your brand and company knowledge to apply rich, relevant context to every output.
        </p>
      </div>

      {/* Knowledge Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {knowledgeAssets.map((asset) => (
          <div
            key={asset.id}
            className="group relative overflow-hidden rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 cursor-pointer hover:shadow-lg"
          >
            {/* Background with pattern */}
            <div className={`${asset.color} h-32 relative`}>
              {getPatternSVG(asset.pattern)}
            </div>
            
            {/* Content */}
            <div className="p-6 bg-white">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                {asset.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {asset.description}
              </p>
              
              {/* Action Button */}
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ArrowRight size={16} />}
                className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
              >
                Set up {asset.title}
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
              variant="primary"
              leftIcon={<Upload size={16} />}
            >
              Upload Brand Assets
            </Button>
            <Button
              variant="outline"
              leftIcon={<Settings size={16} />}
            >
              Configure Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Tips</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm font-bold">1</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Start with Brand Voice</h4>
              <p className="text-sm text-gray-600">Define your unique brand personality to ensure consistent messaging across all content.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm font-bold">2</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Define Your Audiences</h4>
              <p className="text-sm text-gray-600">Create detailed audience profiles to generate more targeted and effective content.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm font-bold">3</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Upload Knowledge Base</h4>
              <p className="text-sm text-gray-600">Provide company information and assets for more accurate and relevant content generation.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm font-bold">4</span>
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