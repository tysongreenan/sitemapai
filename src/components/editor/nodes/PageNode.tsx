import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FileText, Plus } from 'lucide-react';

interface Section {
  id: string;
  label: string;
  description: string;
  components: string[];
}

interface PageData {
  label: string;
  url: string;
  description?: string;
  isHomePage?: boolean;
  isEditing?: boolean;
  sections: Section[];
  onAddNode?: (direction: 'bottom' | 'left' | 'right', nodeId: string) => void;
  onSectionsReorder?: (sections: Section[]) => void;
  onSectionDragStart?: () => void;
  onSectionDragEnd?: () => void;
  onTitleChange?: (title: string) => void;
}

// Ultra simple - no hover states, buttons always visible
const PageNode = ({ data, selected, id }: NodeProps<PageData>) => {
  const handleAddNode = useCallback((direction: 'bottom' | 'left' | 'right') => {
    console.log('🎯 PageNode: Adding node:', { direction, nodeId: id });
    console.log('🎯 PageNode: Has callback:', !!data.onAddNode);
    
    if (data.onAddNode) {
      console.log('📞 PageNode: Calling onAddNode callback');
      data.onAddNode(direction, id);
    } else {
      console.error('❌ PageNode: No onAddNode callback available');
      console.log('📋 PageNode: Available data keys:', Object.keys(data));
    }
  }, [data.onAddNode, id, data]);

  console.log('🔍 PageNode rendered:', { 
    id, 
    label: data.label, 
    hasCallback: !!data.onAddNode,
    dataKeys: Object.keys(data)
  });

  return (
    <div className="relative" style={{ padding: '40px' }}>
      {/* Always visible add buttons */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🟢 Bottom button clicked');
          handleAddNode('bottom');
        }}
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center z-20"
        title="Add child page"
      >
        <Plus size={18} />
      </button>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🔵 Left button clicked');
          handleAddNode('left');
        }}
        className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-20"
        title="Add sibling (left)"
      >
        <Plus size={18} />
      </button>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🟣 Right button clicked');
          handleAddNode('right');
        }}
        className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center z-20"
        title="Add sibling (right)"
      >
        <Plus size={18} />
      </button>

      {/* Main node */}
      <div
        className={`bg-white border-2 rounded-lg shadow-lg overflow-hidden transition-all duration-200 ${
          selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
        }`}
        style={{ width: '280px', minHeight: '180px' }}
      >
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-2">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-white" />
            <div className="font-medium text-white">{data.label}</div>
          </div>
        </div>
        
        <div className="p-3">
          <div className="text-xs text-gray-500 mb-2 font-mono">{data.url}</div>
          
          {data.description && (
            <div className="text-xs text-gray-600 mb-3">{data.description}</div>
          )}
          
          <div className="text-xs text-gray-400 mb-3">
            {data.sections?.length || 0} sections
          </div>

          {/* Debug info */}
          <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
            <div><strong>ID:</strong> {id}</div>
            <div><strong>Callback:</strong> {data.onAddNode ? '✅ Available' : '❌ Missing'}</div>
            <div><strong>Type:</strong> Page Node</div>
          </div>

          {/* Backup test buttons inside the node */}
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('🧪 Internal left button clicked');
                handleAddNode('left');
              }}
              className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100 border border-blue-200"
            >
              ← Left
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('🧪 Internal bottom button clicked');
                handleAddNode('bottom');
              }}
              className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs hover:bg-green-100 border border-green-200"
            >
              ↓ Child
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('🧪 Internal right button clicked');
                handleAddNode('right');
              }}
              className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-xs hover:bg-purple-100 border border-purple-200"
            >
              Right →
            </button>
          </div>
        </div>
      </div>

      {/* React Flow handles - transparent but functional */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
    </div>
  );
};

export default memo(PageNode);