import React, { memo, useState, useCallback, useRef } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FileText, Plus } from 'lucide-react';

interface PageData {
  label: string;
  url: string;
  description?: string;
  isHomePage?: boolean;
  sections: any[];
  onAddNode?: (direction: 'bottom' | 'left' | 'right', nodeId: string) => void;
}

// Simplified debug version - let's get the basics working first
const DebugPageNode = ({ data, selected, id }: NodeProps<PageData>) => {
  const [hoveredZone, setHoveredZone] = useState<'bottom' | 'left' | 'right' | null>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  // Debug: Let's add console logs to see what's happening
  const handleAddNode = useCallback((direction: 'bottom' | 'left' | 'right') => {
    console.log('🎯 ADD NODE CLICKED:', { direction, nodeId: id, hasCallback: !!data.onAddNode });
    
    if (data.onAddNode) {
      console.log('📞 Calling onAddNode callback');
      data.onAddNode(direction, id);
    } else {
      console.log('❌ No onAddNode callback available');
    }
  }, [data.onAddNode, id]);

  // Simplified hover handlers with debug logs
  const handleZoneEnter = useCallback((direction: 'bottom' | 'left' | 'right') => {
    console.log('🎮 Zone entered:', direction);
    setHoveredZone(direction);
  }, []);

  const handleZoneLeave = useCallback(() => {
    console.log('🎮 Zone left');
    setHoveredZone(null);
  }, []);

  // Debug button component
  const DebugAddButton = ({ direction, visible }: { direction: 'bottom' | 'left' | 'right', visible: boolean }) => {
    const getPosition = () => {
      switch (direction) {
        case 'bottom': return 'bottom-[-50px] left-1/2 transform -translate-x-1/2';
        case 'left': return 'left-[-50px] top-1/2 transform -translate-y-1/2';
        case 'right': return 'right-[-50px] top-1/2 transform -translate-y-1/2';
      }
    };

    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🔵 Button clicked:', direction);
          handleAddNode(direction);
        }}
        className={`absolute ${getPosition()} w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-[200] transition-all duration-200 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'
        }`}
        style={{
          pointerEvents: visible ? 'auto' : 'none'
        }}
      >
        <Plus size={20} />
        <span className="sr-only">Add {direction}</span>
      </button>
    );
  };

  return (
    <div
      ref={nodeRef}
      className="relative"
      style={{ minWidth: '300px', minHeight: '200px' }}
    >
      {/* DEBUG: Visible hover zones with bright colors */}
      <div 
        className={`absolute -bottom-16 left-4 right-4 h-20 z-[100] cursor-pointer transition-all duration-200 ${
          hoveredZone === 'bottom' ? 'bg-green-200 opacity-50' : 'bg-red-200 opacity-30'
        }`}
        onMouseEnter={() => handleZoneEnter('bottom')}
        onMouseLeave={handleZoneLeave}
        onClick={() => {
          console.log('🟢 Bottom zone clicked directly');
          handleAddNode('bottom');
        }}
      >
        <div className="flex items-center justify-center h-full text-xs font-bold">
          BOTTOM ZONE {hoveredZone === 'bottom' ? '(ACTIVE)' : ''}
        </div>
      </div>

      <div 
        className={`absolute -left-16 top-4 bottom-4 w-20 z-[100] cursor-pointer transition-all duration-200 ${
          hoveredZone === 'left' ? 'bg-green-200 opacity-50' : 'bg-red-200 opacity-30'
        }`}
        onMouseEnter={() => handleZoneEnter('left')}
        onMouseLeave={handleZoneLeave}
        onClick={() => {
          console.log('🟢 Left zone clicked directly');
          handleAddNode('left');
        }}
      >
        <div className="flex items-center justify-center h-full text-xs font-bold transform -rotate-90">
          LEFT
        </div>
      </div>

      <div 
        className={`absolute -right-16 top-4 bottom-4 w-20 z-[100] cursor-pointer transition-all duration-200 ${
          hoveredZone === 'right' ? 'bg-green-200 opacity-50' : 'bg-red-200 opacity-30'
        }`}
        onMouseEnter={() => handleZoneEnter('right')}
        onMouseLeave={handleZoneLeave}
        onClick={() => {
          console.log('🟢 Right zone clicked directly');
          handleAddNode('right');
        }}
      >
        <div className="flex items-center justify-center h-full text-xs font-bold transform rotate-90">
          RIGHT
        </div>
      </div>

      {/* Add buttons */}
      <DebugAddButton direction="bottom" visible={hoveredZone === 'bottom'} />
      <DebugAddButton direction="left" visible={hoveredZone === 'left'} />
      <DebugAddButton direction="right" visible={hoveredZone === 'right'} />

      {/* Main node content */}
      <div
        className={`bg-white border-2 rounded-lg shadow-lg overflow-hidden transition-all duration-200 ${
          selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
        }`}
        style={{ width: '300px', minHeight: '200px' }}
      >
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-white" />
            <div className="font-medium text-white">{data.label}</div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="text-sm text-gray-500 mb-2">{data.url}</div>
          {data.description && (
            <div className="text-sm text-gray-600 mb-3">{data.description}</div>
          )}
          
          {/* Debug info */}
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
            <div><strong>Node ID:</strong> {id}</div>
            <div><strong>Has onAddNode:</strong> {data.onAddNode ? '✅ Yes' : '❌ No'}</div>
            <div><strong>Hovered Zone:</strong> {hoveredZone || 'None'}</div>
            <div><strong>Sections:</strong> {data.sections?.length || 0}</div>
          </div>

          {/* Direct test buttons */}
          <div className="mt-3 space-y-2">
            <button
              onClick={() => handleAddNode('bottom')}
              className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              🧪 Test Add Bottom (Direct)
            </button>
            <button
              onClick={() => handleAddNode('left')}
              className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              🧪 Test Add Left (Direct)
            </button>
            <button
              onClick={() => handleAddNode('right')}
              className="w-full px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
            >
              🧪 Test Add Right (Direct)
            </button>
          </div>
        </div>
      </div>

      {/* React Flow handles - completely transparent but functional */}
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
    </div>
  );
};

export default memo(DebugPageNode);