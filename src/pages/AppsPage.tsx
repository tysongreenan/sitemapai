import React, { useState } from 'react';
import { Search, Filter, Star, Zap, FileText, Image, Mail, BarChart3, Target, Users } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function AppsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Apps');

  const categories = ['All Apps', 'Workspace Apps', 'My Apps', 'Favorites'];

  const apps = [
    {
      id: 1,
      name: 'Abandoned Cart Reminder',
      description: 'Re-engage potential customers by sending gentle, persuasive reminders',
      icon: <Mail size={24} />,
      category: 'Business',
      isNew: false,
      isUpgrade: false,
      isPopular: false
    },
    {
      id: 2,
      name: 'Ad Campaign',
      description: 'Target audiences on Meta, Google and more with cohesive digital ads',
      icon: <Target size={24} />,
      category: 'Business',
      isNew: false,
      isUpgrade: true,
      isPopular: false
    },
    {
      id: 3,
      name: 'Alt Text Generator',
      description: 'Generate accurate and descriptive alt text for your images effortlessly',
      icon: <Image size={24} />,
      category: 'Content',
      isNew: true,
      isUpgrade: false,
      isPopular: false
    },
    {
      id: 4,
      name: 'Amazon Product Listing',
      description: 'Craft a detailed Amazon listing to boost your product\'s visibility and reach the right buyers',
      icon: <BarChart3 size={24} />,
      category: 'Business',
      isNew: false,
      isUpgrade: true,
      isPopular: false
    },
    {
      id: 5,
      name: 'Audio/Video Summarizer',
      description: 'Transform recordings or transcripts into clear summaries with chapter breakdowns',
      icon: <FileText size={24} />,
      category: 'Content',
      isNew: true,
      isUpgrade: false,
      isPopular: false
    },
    {
      id: 6,
      name: 'Background Remover',
      description: 'Effortlessly remove backgrounds from any image',
      icon: <Image size={24} />,
      category: 'Design',
      isNew: true,
      isUpgrade: false,
      isPopular: true
    },
    {
      id: 7,
      name: 'Battle Cards',
      description: 'Equip your sales team with insights by analyzing your company against competitors',
      icon: <Users size={24} />,
      category: 'Business',
      isNew: false,
      isUpgrade: true,
      isPopular: false
    },
    {
      id: 8,
      name: 'Blog Outline',
      description: 'Kickstart your writing process with a detailed blog outline',
      icon: <FileText size={24} />,
      category: 'Content',
      isNew: false,
      isUpgrade: true,
      isPopular: false
    },
    {
      id: 9,
      name: 'Blog Post',
      description: 'Write long-form content that provides value, drives traffic, and enhances SEO',
      icon: <FileText size={24} />,
      category: 'Content',
      isNew: false,
      isUpgrade: false,
      isPopular: true
    }
  ];

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Apps' || 
                           (selectedCategory === 'Favorites' && app.isPopular) ||
                           selectedCategory === 'Workspace Apps' ||
                           selectedCategory === 'My Apps';
    return matchesSearch && matchesCategory;
  });

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'upgrade': return 'bg-blue-100 text-blue-800';
      case 'popular': return 'bg-pink-100 text-pink-800';
      default: return '';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Apps</h1>
        <p className="text-gray-600">
          Use an App, or create your own, to achieve your marketing goals.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-200">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              selectedCategory === category
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {category}
            {category === 'All Apps' && (
              <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                103
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
            placeholder="Search"
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

      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApps.map((app) => (
          <div
            key={app.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
          >
            {/* App Icon and Badges */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 group-hover:bg-gray-200 transition-colors">
                {app.icon}
              </div>
              <div className="flex flex-col gap-1">
                {app.isNew && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBadgeColor('new')}`}>
                    NEW
                  </span>
                )}
                {app.isUpgrade && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBadgeColor('upgrade')}`}>
                    UPGRADE
                  </span>
                )}
                {app.isPopular && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBadgeColor('popular')}`}>
                    POPULAR
                  </span>
                )}
              </div>
            </div>

            {/* App Info */}
            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {app.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {app.description}
            </p>

            {/* Category Badge */}
            {app.category && (
              <div className="flex items-center">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  {app.category}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredApps.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No apps found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms or browse different categories.
          </p>
        </div>
      )}
    </div>
  );
}