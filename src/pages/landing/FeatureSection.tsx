import React from 'react';
import { Zap, RefreshCw, Code, PenTool, Activity, Search } from 'lucide-react';

export default function FeatureSection() {
  const features = [
    {
      icon: <Zap className="h-10 w-10 text-indigo-500" />,
      title: 'AI-Powered Generation',
      description: 'Leverage artificial intelligence to create professional sitemaps based on your description or existing website.'
    },
    {
      icon: <PenTool className="h-10 w-10 text-indigo-500" />,
      title: 'Visual Sitemap Editor',
      description: 'Intuitive drag-and-drop interface for customizing your sitemap with our advanced node-based editor.'
    },
    {
      icon: <Code className="h-10 w-10 text-indigo-500" />,
      title: 'Developer-Friendly Exports',
      description: 'Export your sitemap in multiple formats including JSON, XML, and visual diagrams for implementation.'
    },
    {
      icon: <RefreshCw className="h-10 w-10 text-indigo-500" />,
      title: 'Automatic Updates',
      description: 'Changes are saved in real-time with version history, allowing you to track and revert modifications.'
    },
    {
      icon: <Activity className="h-10 w-10 text-indigo-500" />,
      title: 'SEO Optimization',
      description: 'Get recommendations for improving your site structure to maximize search engine visibility.'
    },
    {
      icon: <Search className="h-10 w-10 text-indigo-500" />,
      title: 'Website Analysis',
      description: 'Analyze existing websites to extract and visualize their structure automatically.'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Streamline Your Website Planning
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our powerful features help you design better websites faster than ever before
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="mb-5">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}