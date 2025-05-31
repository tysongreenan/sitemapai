import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { LayoutGrid } from 'lucide-react';

function SectionNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`min-w-[180px] bg-white border-2 rounded-lg shadow-md overflow-hidden ${
        selected ? 'border-pink-500 ring-2 ring-pink-200' : 'border-gray-200'
      }`}
    >
      <div className="bg-pink-50 px-3 py-2 border-b border-pink-100 flex items-center">
        <LayoutGrid size={16} className="text-pink-600 mr-2" />
        <div className="font-medium text-pink-900 truncate">{data.label}</div>
      </div>
      
      <div className="px-3 py-2">
        {data.description && (
          <div className="text-xs text-gray-600 mb-2 line-clamp-2">{data.description}</div>
        )}
        
        {data.components && data.components.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {data.components.map((component: string) => (
              <span 
                key={component} 
                className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
              >
                {component}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-pink-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-pink-500"
      />
    </div>
  );
}

export default memo(SectionNode);