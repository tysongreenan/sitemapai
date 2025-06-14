import React from 'react';
import { Star, Zap, Clock, Users } from 'lucide-react';
import { Button } from '../ui/Button';

interface AppCardProps {
  app: {
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
  };
  onUse: (appId: string) => void;
}

export function AppCard({ app, onUse }: AppCardProps) {
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'new': return 'bg-green-100 text-green-800 border-green-200';
      case 'upgrade': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'popular': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return '';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-lg transition-all duration-200 cursor-pointer group">
      {/* App Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
          {app.icon}
        </div>
        <div className="flex flex-col gap-1">
          {app.isNew && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getBadgeColor('new')}`}>
              NEW
            </span>
          )}
          {app.isUpgrade && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getBadgeColor('upgrade')}`}>
              UPGRADE
            </span>
          )}
          {app.isPopular && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getBadgeColor('popular')}`}>
              POPULAR
            </span>
          )}
        </div>
      </div>

      {/* App Info */}
      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
        {app.name}
      </h3>
      <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
        {app.description}
      </p>

      {/* App Stats */}
      <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
        {app.rating && (
          <div className="flex items-center gap-1">
            <Star size={12} className="text-yellow-400 fill-current" />
            <span>{app.rating}</span>
          </div>
        )}
        {app.usageCount && (
          <div className="flex items-center gap-1">
            <Users size={12} />
            <span>{app.usageCount}+ uses</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>~2 min</span>
        </div>
      </div>

      {/* Category Badge */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          {app.category}
        </span>
        
        <Button
          size="sm"
          onClick={() => onUse(app.id)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          leftIcon={<Zap size={14} />}
        >
          Use App
        </Button>
      </div>
    </div>
  );
}