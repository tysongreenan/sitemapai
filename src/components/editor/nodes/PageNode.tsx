// src/components/editor/nodes/PageNode.tsx (modified sections)
import React, { memo, useState } from 'react'; // Import useState
import { Handle, Position, NodeProps } from 'reactflow';
import { FileText, MoreHorizontal, Plus, Sparkles, Home, X } from 'lucide-react'; // Import X for close button in popover

function PageNode({ data, selected, id }: NodeProps) {
  const { label, url, description, components, isHomePage, onShowNodeContextMenu, onAddSection, onGenerateContent } = data;

  const [showAddMenu, setShowAddMenu] = useState(false); // State to control visibility of the add menu

  const handleContextMenuClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (onShowNodeContextMenu) {
      onShowNodeContextMenu(id, { x: event.clientX, y: event.clientY });
    }
  };

  const handleAddSectionClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent node click event from propagating
    if (onAddSection) {
      onAddSection(id); // Pass node ID to open section panel
    }
    setShowAddMenu(false); // Close the popover
  };

  const handleGenerateContentClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent node click event from propagating
    if (onGenerateContent) {
      onGenerateContent(id); // Pass node ID for content generation
    }
    setShowAddMenu(false); // Close the popover
  };

  return (
    <div
      className={`min-w-[260px] bg-white border-2 rounded-lg shadow-xl overflow-hidden transition-transform ring-offset-2 relative
        ${selected ? 'ring-2 ring-indigo-500 scale-105' : 'hover:ring-2 hover:ring-indigo-200'}
      `}
      onMouseEnter={() => setShowAddMenu(true)} // Show menu on hover
      onMouseLeave={() => setShowAddMenu(false)} // Hide menu on mouse leave
    >
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isHomePage && <Home size={16} className="text-yellow-300 fill-current" />}
          <FileText size={16} className="text-white" />
          <div className="font-medium text-white truncate">{label}</div>
        </div>
        <button
          className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
          onClick={handleContextMenuClick}
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="p-3 space-y-3">
        {url && (
          <div className="text-sm text-gray-700">URL: <span className="font-mono text-gray-600">{url}</span></div>
        )}
        {description && (
          <div className="text-sm text-gray-700 line-clamp-3">{description}</div>
        )}

        {/* Removed always-visible "Add Section" and "Generate Content" buttons here */}

        {/* This block will control the visibility of the new hover-triggered menu */}
        {showAddMenu && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full h-full flex items-center justify-center bg-black bg-opacity-20 backdrop-blur-sm rounded-lg pointer-events-none">
            {/* The actual popover menu */}
            <div className="p-4 bg-white rounded-lg shadow-xl border border-indigo-200 flex flex-col gap-2 pointer-events-auto">
              <button
                onClick={handleAddSectionClick}
                className="flex items-center justify-center w-full px-4 py-2 bg-indigo-50 rounded-md text-indigo-700 hover:bg-indigo-100 transition-colors text-sm font-medium"
              >
                <Plus size={16} className="mr-2" /> Add Section
              </button>
              <button
                onClick={handleGenerateContentClick}
                className="flex items-center justify-center w-full px-4 py-2 bg-indigo-50 rounded-md text-indigo-700 hover:bg-indigo-100 transition-colors text-sm font-medium"
              >
                <Sparkles size={16} className="mr-2" /> Generate content
              </button>
            </div>
          </div>
        )}

        {/* Removed display of components array here, as per user feedback */}
        {/* If you still need to display components in some simplified way, you can re-add it.
            For now, assuming sections will handle the primary content blocks. */}
        {/*
        {components && components.length > 0 && (
          <div className="border-t pt-3 space-y-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Components</h4>
            {components.map((componentId: string, index: number) => (
              <div key={index} className="bg-gray-50 rounded p-2 text-xs text-gray-700">
                {componentId}
              </div>
            ))}
          </div>
        )}
        */}
      </div>

      <Handle
        type="target"
        position={Position.Top}
        className="w-4 h-4 bg-indigo-500 border-2 border-white shadow-lg"
        style={{ top: -8 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-4 h-4 bg-indigo-500 border-2 border-white shadow-lg"
        style={{ bottom: -8 }}
      />
    </div>
  );
}

export default memo(PageNode);