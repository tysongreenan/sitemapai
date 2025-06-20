import React, { memo, useState, useRef, useImperativeHandle, forwardRef, useEffect, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FileText, Image, BarChart3, Video, Copy, Trash2, Edit3, Save, X, Send, Bold, Italic, Underline, List, Link2 } from 'lucide-react';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';
import { Button } from '../../ui/Button';

export interface ContentNodeData {
  title: string;
  content: string;
  type: 'text' | 'image' | 'chart' | 'video';
  createdAt: Date;
  selected?: boolean;
  onDelete?: (nodeId: string) => void;
  onContentUpdate?: (nodeId: string, newContent: string) => void;
  onSendTextToChat?: (text: string) => void;
  onNodeDoubleClick?: (nodeId: string) => void;
}

const ContentNode = memo(forwardRef<any, NodeProps<ContentNodeData>>(({ data, selected, id }, ref) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(data.content || '');
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  // Update content when data changes
  useEffect(() => {
    setEditedContent(data.content || '');
  }, [data.content]);

  // Set node as non-draggable when editing
  useEffect(() => {
    if (nodeRef.current) {
      const nodeElement = nodeRef.current.closest('.react-flow__node');
      if (nodeElement) {
        if (isEditing) {
          nodeElement.classList.add('nodrag');
          (nodeElement as HTMLElement).style.cursor = 'default';
        } else {
          nodeElement.classList.remove('nodrag');
          (nodeElement as HTMLElement).style.cursor = 'grab';
        }
      }
    }
  }, [isEditing]);

  // Handle text selection for toolbar
  useEffect(() => {
    const handleSelection = () => {
      if (!isEditing || !contentRef.current) return;

      const selection = window.getSelection();
      const text = selection?.toString();

      if (text && text.length > 0) {
        setSelectedText(text);
        
        // Get selection coordinates
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();
        
        if (rect && contentRef.current) {
          const containerRect = contentRef.current.getBoundingClientRect();
          setToolbarPosition({
            top: rect.top - containerRect.top - 40,
            left: rect.left - containerRect.left + (rect.width / 2) - 100
          });
          setShowToolbar(true);
        }
      } else {
        setShowToolbar(false);
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, [isEditing]);

  // Hide toolbar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setShowToolbar(false);
      }
    };

    if (showToolbar) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showToolbar]);

  // Save on click-out functionality - IMPROVED: Immediate state update
  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if click is outside both the node and the toolbar
      const isOutsideNode = nodeRef.current && !nodeRef.current.contains(target);
      const isOutsideToolbar = toolbarRef.current && !toolbarRef.current.contains(target);
      
      if (isOutsideNode && isOutsideToolbar) {
        console.log('Click detected outside content node, saving changes');
        saveContent();
      }
    };

    // Add event listener to document
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing]); // Only re-run when isEditing changes

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

  const copyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(data.content || '');
    toast.success('Content copied to clipboard!');
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this content?')) {
      data.onDelete?.(id);
    }
  };

  const startEditing = () => {
    if (data.type === 'text') {
      setIsEditing(true);
      setTimeout(() => {
        contentRef.current?.focus();
      }, 0);
    }
  };

  // IMPROVED: Immediate state update for editing badge
  const saveContent = () => {
    if (contentRef.current) {
      const newContent = contentRef.current.innerHTML
        .replace(/<div>/g, '\n')
        .replace(/<\/div>/g, '')
        .replace(/<br>/g, '\n')
        .replace(/<[^>]*>/g, '');
      
      // Update editing state IMMEDIATELY before calling onContentUpdate
      setIsEditing(false);
      setShowToolbar(false);
      
      // Then call the update function
      data.onContentUpdate?.(id, newContent);
      toast.success('Content updated!');
    }
  };

  const cancelEdit = () => {
    if (contentRef.current) {
      contentRef.current.innerHTML = data.content || '';
    }
    setIsEditing(false);
    setShowToolbar(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      cancelEdit();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      saveContent();
    }
  };

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    contentRef.current?.focus();
  };

  const sendSelectedToAI = () => {
    if (selectedText && data.onSendTextToChat) {
      data.onSendTextToChat(`Please rewrite this text: "${selectedText}"`);
      toast.success('Text sent to AI!');
      setShowToolbar(false);
    }
  };

  // Handle double-click on header to focus/zoom
  const handleHeaderDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.onNodeDoubleClick) {
      data.onNodeDoubleClick(id);
    }
  };

  // Prevent React Flow dragging when editing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isEditing) {
      e.stopPropagation();
    }
  }, [isEditing]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (isEditing) {
      e.stopPropagation();
    }
  }, [isEditing]);

  return (
    <div 
      ref={nodeRef}
      className={`
        bg-white rounded-xl shadow-lg border-2 transition-all duration-200 relative
        min-w-[400px] max-w-[600px]
        ${selected ? 'border-indigo-400 shadow-xl ring-2 ring-indigo-200' : `${getTypeColor()} hover:shadow-xl`}
        ${isEditing ? 'editing nodrag' : ''}
      `}
      onMouseDown={handleMouseDown}
      onPointerDown={handlePointerDown}
    >
      {/* Floating Toolbar */}
      {showToolbar && isEditing && (
        <div
          ref={toolbarRef}
          className="absolute z-10 bg-gray-800 text-white rounded-lg shadow-xl p-1 flex items-center gap-1 floating-toolbar"
          style={{
            top: `${toolbarPosition.top}px`,
            left: `${toolbarPosition.left}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <button
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            onClick={() => applyFormat('bold')}
            title="Bold"
          >
            <Bold size={14} />
          </button>
          <button
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            onClick={() => applyFormat('italic')}
            title="Italic"
          >
            <Italic size={14} />
          </button>
          <button
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            onClick={() => applyFormat('underline')}
            title="Underline"
          >
            <Underline size={14} />
          </button>
          <div className="w-px h-6 bg-gray-600 mx-1" />
          <button
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            onClick={() => applyFormat('insertUnorderedList')}
            title="Bullet List"
          >
            <List size={14} />
          </button>
          <button
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            onClick={() => {
              const url = prompt('Enter URL:');
              if (url) applyFormat('createLink', url);
            }}
            title="Add Link"
          >
            <Link2 size={14} />
          </button>
          {data.onSendTextToChat && (
            <>
              <div className="w-px h-6 bg-gray-600 mx-1" />
              <button
                className="p-2 hover:bg-gray-700 rounded transition-colors flex items-center gap-1"
                onClick={sendSelectedToAI}
                title="Send to AI"
              >
                <Send size={14} />
                <span className="text-xs">AI</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Node Header - Double-click to focus */}
      <div 
        className={`px-4 py-3 border-b rounded-t-xl ${getHeaderColor()} cursor-pointer hover:bg-opacity-80 transition-colors`}
        onDoubleClick={handleHeaderDoubleClick}
        title="Double-click to focus on this content"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {getIcon()}
            <span className="text-sm font-semibold text-gray-900 truncate">
              {data.title}
            </span>
            {/* IMPROVED: Editing badge only shows when actually editing */}
            {isEditing && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                Editing
              </span>
            )}
          </div>
          {selected && (
            <div className="flex items-center gap-1 ml-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={copyToClipboard}
                    className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-white/50 transition-colors"
                    title="Copy content"
                  >
                    <Copy size={12} />
                  </button>
                  {data.type === 'text' && (
                    <button
                      onClick={startEditing}
                      className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-white/50 transition-colors"
                      title="Edit content"
                    >
                      <Edit3 size={12} />
                    </button>
                  )}
                  <button
                    onClick={handleDelete}
                    className="p-1.5 rounded-md text-red-500 hover:text-red-700 hover:bg-white/50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={saveContent}
                    className="p-1.5 rounded-md text-green-500 hover:text-green-700 hover:bg-white/50 transition-colors"
                    title="Save changes (Ctrl+Enter)"
                  >
                    <Save size={12} />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-white/50 transition-colors"
                    title="Cancel (Esc)"
                  >
                    <X size={12} />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Node Content */}
      <div className="p-4">
        {data.type === 'text' && (
          <>
            {isEditing ? (
              <div
                ref={contentRef}
                contentEditable
                className="prose prose-sm max-w-none text-gray-700 outline-none min-h-[100px] p-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-300 focus:bg-white transition-colors"
                onKeyDown={handleKeyDown}
                dangerouslySetInnerHTML={{ __html: editedContent }}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={(e) => e.stopPropagation()}
                suppressContentEditableWarning={true}
              />
            ) : (
              <div 
                className="prose prose-sm max-w-none text-gray-700 cursor-pointer hover:bg-gray-50 rounded p-2 transition-colors"
                onClick={startEditing}
              >
                {data.content ? (
                  <ReactMarkdown>{data.content}</ReactMarkdown>
                ) : (
                  <p className="text-gray-400 italic">Click to add content...</p>
                )}
              </div>
            )}
            {isEditing && (
              <div className="mt-2 text-xs text-gray-500">
                Tip: Press Ctrl+Enter to save, Esc to cancel, or click outside to save. Select text to see formatting options.
              </div>
            )}
          </>
        )}

        {data.type === 'image' && (
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            {data.content ? (
              <img src={data.content} alt={data.title} className="max-w-full max-h-full object-contain rounded-lg" />
            ) : (
              <Image size={48} className="text-gray-400" />
            )}
          </div>
        )}

        {data.type === 'chart' && (
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <BarChart3 size={48} className="text-gray-400" />
          </div>
        )}

        {data.type === 'video' && (
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            {data.content ? (
              <video src={data.content} controls className="max-w-full max-h-full rounded-lg" />
            ) : (
              <Video size={48} className="text-gray-400" />
            )}
          </div>
        )}

        {/* Timestamp */}
        <div className="mt-4 text-xs text-gray-500">
          Created: {new Date(data.createdAt).toLocaleString()}
        </div>
      </div>

      {/* Connection Handles */}
      <Handle type="target" position={Position.Top} className="!bg-indigo-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-500" />
    </div>
  );
}));

ContentNode.displayName = 'ContentNode';

export default ContentNode;