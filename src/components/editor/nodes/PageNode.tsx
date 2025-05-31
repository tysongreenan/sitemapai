import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FileText } from 'lucide-react';

function PageNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`min-w-[180px] bg-white border-2 rounded-lg shadow-md overflow-hidden ${
        selected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'
      }`}
    >
      <div className="bg-indigo-50 px-3 py-2 border-b border-indigo-100 flex items-center">
        <FileText size={16} className="text-indigo-600 mr-2" />
        <div className="font-medium text-indigo-900 truncate">{data.label}</div>
      </div>
      
      <div className="px-3 py-2">
        <div className="text-xs text-gray-500 mb-1">URL: {data.url}</div>
        
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
        className="w-3 h-3 bg-indigo-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-indigo-500"
      />
    </div>
  );
}

export default memo(PageNode);