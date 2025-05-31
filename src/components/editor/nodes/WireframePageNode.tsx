// src/components/editor/nodes/WireframePageNode.tsx
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { SquareStack, LayoutDashboard, Component } from 'lucide-react';

function WireframePageNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`min-w-[180px] bg-white border-2 rounded-lg shadow-md overflow-hidden ${
        selected ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'
      }`}
    >
      <div className="bg-purple-50 px-3 py-2 border-b border-purple-100 flex items-center">
        <LayoutDashboard size={16} className="text-purple-600 mr-2" />
        <div className="font-medium text-purple-900 truncate">{data.label}</div>
      </div>
      
      <div className="px-3 py-2">
        {data.url && (
          <div className="text-xs text-gray-500 mb-1 truncate">URL: {data.url}</div>
        )}
        
        {data.components && data.components.length > 0 && (
          <div className="flex items-center text-xs text-gray-600">
            <Component size={12} className="mr-1" />
            {data.components.length} Components
          </div>
        )}
      </div>
      
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-purple-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-purple-500"
      />
    </div>
  );
}

export default memo(WireframePageNode);