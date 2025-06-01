import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FileText, MoreHorizontal, Plus, Sparkles, Home } from 'lucide-react';

function PageNode({ data, selected, id }: NodeProps) {
  const { label, url, description, components, isHomePage, onShowNodeContextMenu, onAddSection, onGenerateContent } = data;
  const [showAddMenu, setShowAddMenu] = useState(false);

  const handleContextMenuClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (onShowNodeContextMenu) {
      onShowNodeContextMenu(id, { x: event.clientX, y: event.clientY });
    }
  };

  const handleAddSectionClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (onAddSection) {
      onAddSection(id);
    }
    setShowAddMenu(false);
  };

  const handleGenerateContentClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (onGenerateContent) {
      onGenerateContent(id);
    }
    setShowAddMenu(false);
  };

  return (
    <div
      className={`min-w-[260px] bg-white border-2 rounded-lg shadow-xl overflow-hidden transition-all duration-200 ring-offset-2 relative group
        ${selected ? 'ring-2 ring-indigo-500 scale-105' : 'hover:ring-2 hover:ring-indigo-200'}
      `}
      onMouseEnter={() => setShowAddMenu(true)}
      onMouseLeave={() => setShowAddMenu(false)}
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

      <div className="p-3 space-y-2">
        {url && (
          <div className="text-sm text-gray-700">
            URL: <span className="font-mono text-gray-600">{url}</span>
          </div>
        )}
        {description && (
          <div className="text-sm text-gray-700 line-clamp-2">{description}</div>
        )}
      </div>

      {/* Hover Menu */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
          showAddMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-indigo-500/10 backdrop-blur-[2px]" />
        <div className="relative z-10 flex flex-col gap-2 p-3">
          <button
            onClick={handleAddSectionClick}
            className="flex items-center px-4 py-2 bg-white rounded-md text-indigo-700 hover:bg-indigo-50 transition-colors text-sm font-medium shadow-sm hover:shadow border border-indigo-100 hover:border-indigo-200"
          >
            <Plus size={16} className="mr-2" />
            Add Section
          </button>
          <button
            onClick={handleGenerateContentClick}
            className="flex items-center px-4 py-2 bg-white rounded-md text-indigo-700 hover:bg-indigo-50 transition-colors text-sm font-medium shadow-sm hover:shadow border border-indigo-100 hover:border-indigo-200"
          >
            <Sparkles size={16} className="mr-2" />
            Generate content
          </button>
        </div>
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