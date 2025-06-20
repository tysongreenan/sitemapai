import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FileText, Image, BarChart3, Video, Copy, Trash2, Edit3, ExternalLink } from 'lucide-react';

export interface ContentNodeData {
  title: string;
  content: string;
  type: 'text' | 'image' | 'chart' | 'video';
  createdAt: Date;
  selected?: boolean;
}

const ContentNode = memo(({ data, selected }: NodeProps<ContentNodeData>) => {
  const getIcon = () => {
    switch (data.type) {
      case 'text': return <FileText size={16} className="text-blue-600" />;
      case 'image': return <Image size={16} className="text-green-600" />;
      case 'chart': return <BarChart3 size={16} className="text-purple-600" />;
      case 'video': return <Video size={16} className="text-orange-600" />;
      default: return <FileText size={16} className="text-gray-600" />;
    }
  };

  const getTypeColor = () => {
    switch (data.type) {
      case 'text': return 'border-blue-200 bg-blue-50';
      case 'image': return 'border-green-200 bg-green-50';
      case 'chart': return 'border-purple-200 bg-purple-50';
      case 'video': return 'border-orange-200 bg-orange-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getHeaderColor = () => {
    switch (data.type) {
      case 'text': return 'bg-blue-100 border-blue-200';
      case 'image': return 'bg-green-100 border-green-200';
      case 'chart': return 'bg-purple-100 border-purple-200';
      case 'video': return 'bg-orange-100 border-orange-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(data.content);
  };

  return (
    <div className={`
      bg-white rounded-xl shadow-lg border-2 transition-all duration-200 min-w-[320px] max-w-[400px]
      ${selected ? 'border-indigo-400 shadow-xl ring-2 ring-indigo-200' : `${getTypeColor()} hover:shadow-xl`}
    `}>
      {/* Node Header */}
      <div className={`px-4 py-3 border-b rounded-t-xl ${getHeaderColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {getIcon()}
            <span className="text-sm font-semibold text-gray-900 truncate">
              {data.title}
            </span>
          </div>
          {selected && (
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={copyToClipboard}
                className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-white/50 transition-colors"
                title="Copy content"
              >
                <Copy size={12} />
              </button>
              <button
                className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-white/50 transition-colors"
                title="Edit"
              >
                <Edit3 size={12} />
              </button>
              <button
                className="p-1.5 rounded-md text-red-500 hover:text-red-700 hover:bg-white/50 transition-colors"
                title="Delete"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Node Content */}
      <div className="p-4">
        {data.type === 'text' && (
          <div className="text-sm text-gray-700 leading-relaxed">
            <div className="max-h-32 overflow-hidden">
              {data.content.length > 200 ? `${data.content.substring(0, 200)}...` : data.content}
            </div>
          </div>
        )}
        
        {data.type === 'image' && (
          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Image size={32} className="text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">AI Generated Image</p>
            </div>
          </div>
        )}
        
        {data.type === 'chart' && (
          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 size={32} className="text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Data Visualization</p>
            </div>
          </div>
        )}
        
        {data.type === 'video' && (
          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Video size={32} className="text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Video Content</p>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            {data.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
            <ExternalLink size={10} />
            View Full
          </button>
        </div>
      </div>

      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-indigo-500 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-indigo-500 !border-2 !border-white"
      />
    </div>
  );
});

ContentNode.displayName = 'ContentNode';

export default ContentNode;