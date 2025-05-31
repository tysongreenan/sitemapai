// src/components/editor/nodes/PageNode.tsx (modified sections)
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FileText, MoreHorizontal, Plus, Sparkles, Home } from 'lucide-react'; // Import MoreHorizontal, Plus, Sparkles, Home

function PageNode({ data, selected, id }: NodeProps) { // Make sure 'id' is destructured
  const { label, url, description, components, isHomePage, onShowNodeContextMenu, onAddSection, onGenerateContent } = data; // Destructure new props

  const handleContextMenuClick = (event: React.MouseEvent) => {
    event.preventDefault(); // Prevent default browser context menu
    event.stopPropagation(); // Stop propagation to prevent pane context menu
    if (onShowNodeContextMenu) { // Check if the function exists
      onShowNodeContextMenu(id, { x: event.clientX, y: event.clientY }); // Pass node ID and click position
    }
  };

  const handleAddSection = () => {
    if (onAddSection) {
      onAddSection(id); // Pass node ID to add section to this page
    }
  };

  const handleGenerateContent = () => {
    if (onGenerateContent) {
      onGenerateContent(id); // Pass node ID for content generation
    }
  };

  return (
    <div
      className={`min-w-[260px] bg-white border-2 rounded-lg shadow-xl overflow-hidden transition-transform ring-offset-2 ${
        selected ? 'ring-2 ring-indigo-500 scale-105' : 'hover:ring-2 hover:ring-indigo-200'
      }`}
    >
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isHomePage && <Home size={16} className="text-yellow-300 fill-current" />} {/* Home icon for home page */}
          <FileText size={16} className="text-white" />
          <div className="font-medium text-white truncate">{label}</div>
        </div>
        <button
          className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
          onClick={handleContextMenuClick} // Trigger context menu on click
        >
          <MoreHorizontal size={18} /> {/* "..." icon */}
        </button>
      </div>

      <div className="p-3 space-y-3">
        {url && (
          <div className="text-sm text-gray-700">URL: <span className="font-mono text-gray-600">{url}</span></div>
        )}
        {description && (
          <div className="text-sm text-gray-700 line-clamp-3">{description}</div>
        )}

        {/* Buttons for Add Section and Generate Content */}
        <div className="flex flex-col gap-2 pt-3 border-t border-gray-200">
          <button
            onClick={handleAddSection}
            className="flex items-center justify-center w-full px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            <Plus size={16} className="mr-2" /> Add Section
          </button>
          <button
            onClick={handleGenerateContent}
            className="flex items-center justify-center w-full px-4 py-2 bg-indigo-50 rounded-md text-indigo-700 hover:bg-indigo-100 transition-colors text-sm font-medium"
          >
            <Sparkles size={16} className="mr-2" /> Generate content
          </button>
        </div>

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