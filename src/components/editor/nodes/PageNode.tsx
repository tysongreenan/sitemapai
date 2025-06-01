import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FileText, Eye, EyeOff, Package, ChevronDown, ChevronUp } from 'lucide-react';

// Component categories for icon mapping
const componentIcons: Record<string, React.ReactNode> = {
  'navbar': <Menu size={12} />,
  'sidebar': <PanelRight size={12} />,
  'hero-centered': <Layout size={12} />,
  'hero-split': <Grid size={12} />,
  'feature-grid': <Grid size={12} />,
  'testimonials': <MessageCircle size={12} />,
  'footer-simple': <Layout size={12} />,
  'footer-columns': <Grid size={12} />,
  'contact-form': <Mail size={12} />,
  'team-section': <Users size={12} />,
  'cta-simple': <Zap size={12} />,
};

// Import missing icons
import { 
  Menu, 
  PanelRight, 
  Layout, 
  Grid, 
  MessageCircle, 
  Mail, 
  Users, 
  Zap 
} from 'lucide-react';

// Component preview renderer
export const ComponentPreview = ({ type }: { type: string }) => {
  const previews: Record<string, JSX.Element> = {
    'navbar': (
      <div className="w-full h-8 bg-gray-800 rounded-t flex items-center px-2 gap-2">
        <div className="w-6 h-4 bg-blue-500 rounded" />
        <div className="flex-1 flex gap-2">
          <div className="w-10 h-3 bg-gray-600 rounded" />
          <div className="w-10 h-3 bg-gray-600 rounded" />
          <div className="w-10 h-3 bg-gray-600 rounded" />
        </div>
        <div className="w-12 h-4 bg-blue-500 rounded text-xs" />
      </div>
    ),
    'hero-centered': (
      <div className="w-full h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded p-3 flex flex-col items-center justify-center gap-1">
        <div className="w-20 h-3 bg-white/20 rounded" />
        <div className="w-16 h-2 bg-white/20 rounded" />
        <div className="w-12 h-4 bg-white rounded mt-1" />
      </div>
    ),
    'hero-split': (
      <div className="w-full h-24 bg-gray-100 rounded p-2 flex gap-2">
        <div className="flex-1 flex flex-col justify-center gap-1">
          <div className="w-full h-2 bg-gray-300 rounded" />
          <div className="w-3/4 h-2 bg-gray-300 rounded" />
          <div className="w-10 h-3 bg-blue-500 rounded mt-1" />
        </div>
        <div className="flex-1 bg-gray-300 rounded" />
      </div>
    ),
    'feature-grid': (
      <div className="grid grid-cols-3 gap-1 p-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 rounded" />
        ))}
      </div>
    ),
    'testimonials': (
      <div className="p-2 space-y-1">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-2 bg-gray-100 rounded p-1">
            <div className="w-6 h-6 bg-gray-300 rounded-full" />
            <div className="flex-1 space-y-1">
              <div className="w-full h-1 bg-gray-300 rounded" />
              <div className="w-3/4 h-1 bg-gray-300 rounded" />
            </div>
          </div>
        ))}
      </div>
    ),
    'footer-simple': (
      <div className="w-full h-12 bg-gray-800 rounded-b p-2">
        <div className="flex justify-between items-center h-full">
          <div className="w-12 h-3 bg-gray-600 rounded" />
          <div className="flex gap-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-3 h-3 bg-gray-600 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    ),
    'footer-columns': (
      <div className="w-full h-16 bg-gray-800 rounded-b p-2 flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1 space-y-1">
            <div className="w-full h-2 bg-gray-700 rounded" />
            <div className="w-3/4 h-1 bg-gray-600 rounded" />
            <div className="w-1/2 h-1 bg-gray-600 rounded" />
          </div>
        ))}
      </div>
    ),
    'contact-form': (
      <div className="p-2 space-y-1">
        <div className="w-full h-4 bg-gray-200 rounded" />
        <div className="w-full h-4 bg-gray-200 rounded" />
        <div className="w-full h-8 bg-gray-200 rounded" />
        <div className="w-16 h-4 bg-blue-500 rounded" />
      </div>
    ),
    'team-section': (
      <div className="grid grid-cols-3 gap-1 p-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="aspect-square bg-gray-200 rounded-full" />
            <div className="w-full h-1 bg-gray-300 rounded" />
            <div className="w-3/4 h-1 bg-gray-300 rounded mx-auto" />
          </div>
        ))}
      </div>
    ),
    'cta-simple': (
      <div className="w-full h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded p-3 flex items-center justify-center gap-2">
        <div className="w-24 h-3 bg-white/20 rounded" />
        <div className="w-12 h-4 bg-white rounded" />
      </div>
    ),
    'text': (
      <div className="p-2 space-y-1">
        <div className="w-full h-2 bg-gray-300 rounded" />
        <div className="w-full h-2 bg-gray-300 rounded" />
        <div className="w-3/4 h-2 bg-gray-300 rounded" />
      </div>
    ),
    'default': (
      <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
        <Package size={20} className="text-gray-400" />
      </div>
    )
  };

  return previews[type] || previews.default;
};

// Enhanced page node component
const EnhancedPageNode = ({ data, selected }: NodeProps) => {
  const [showPreview, setShowPreview] = useState(true);
  const [expandedComponents, setExpandedComponents] = useState(false);
  
  return (
    <div
      className={`min-w-[280px] max-w-[320px] bg-white border-2 rounded-lg shadow-lg overflow-hidden transition-all duration-200 ${
        selected ? 'border-blue-500 ring-2 ring-blue-200 scale-105' : 'border-gray-200 hover:border-gray-300 hover:shadow-xl'
      }`}
    >
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FileText size={16} className="text-white flex-shrink-0" />
          <div className="font-medium text-white truncate">{data.label}</div>
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="text-white/80 hover:text-white transition-colors p-1"
        >
          {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      
      <div className="p-3">
        <div className="text-xs text-gray-500 mb-2 font-mono">{data.url}</div>
        
        {data.description && (
          <div className="text-xs text-gray-600 mb-3 line-clamp-2">{data.description}</div>
        )}
        
        {data.components && data.components.length > 0 && (
          <div className="border-t pt-3">
            <button
              onClick={() => setExpandedComponents(!expandedComponents)}
              className="w-full flex items-center justify-between text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              <span>Components ({data.components.length})</span>
              {expandedComponents ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            
            {expandedComponents && showPreview && (
              <div className="mt-2 space-y-2">
                {data.components.map((componentId: string, index: number) => {
                  const icon = componentIcons[componentId];
                  
                  return (
                    <div key={index} className="bg-gray-50 rounded p-2">
                      <div className="flex items-center gap-2 mb-1">
                        {icon || <Package size={12} />}
                        <span className="text-xs font-medium capitalize">
                          {componentId.replace(/-/g, ' ')}
                        </span>
                      </div>
                      <div className="h-12 overflow-hidden rounded border border-gray-200">
                        <ComponentPreview type={componentId} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
        style={{ top: -6 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
        style={{ bottom: -6 }}
      />
    </div>
  );
};

export default memo(EnhancedPageNode);