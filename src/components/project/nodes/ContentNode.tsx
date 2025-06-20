import React, { memo, useState, useRef, useImperativeHandle, forwardRef, useEffect, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FileText, Image, BarChart3, Video, Copy, Trash2, Edit3, Save, X, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
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
}

const ContentNode = memo(forwardRef<any, NodeProps<ContentNodeData>>(({ data, selected, id }, ref) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(String(data.content || ''));
  const [quillKey, setQuillKey] = useState(0); // Force remount when switching modes
  const quillRef = useRef<ReactQuill>(null);

  // Update editedContent when data.content changes, ensuring it's always a string
  useEffect(() => {
    setEditedContent(String(data.content || ''));
  }, [data.content]);

  // Auto-enter editing mode when text node is selected (removed data.content and isEditing from deps)
  useEffect(() => {
    if (selected && data.type === 'text' && !isEditing) {
      setEditedContent(String(data.content || ''));
      setQuillKey(prev => prev + 1); // Force Quill remount
      setIsEditing(true);
    } else if (!selected && isEditing) {
      // Auto-exit editing mode when node is deselected
      handleCancel();
    }
  }, [selected, data.type]); // Removed data.content and isEditing from dependencies

  useImperativeHandle(ref, () => ({
    startEditing: () => {
      if (data.type === 'text') {
        setEditedContent(String(data.content || ''));
        setQuillKey(prev => prev + 1); // Force Quill remount
        setIsEditing(true);
      }
    }
  }));

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

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.type === 'text') {
      setEditedContent(String(data.content || '')); // Ensure string type
      setQuillKey(prev => prev + 1); // Force Quill remount
      setIsEditing(true);
    } else {
      toast.info('Editing is only available for text content');
    }
  };

  // Improved handleSave with error handling
  const handleSave = useCallback(async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    try {
      if (data.onContentUpdate) {
        data.onContentUpdate(id, String(editedContent || ''));
        setIsEditing(false);
        setQuillKey(prev => prev + 1); // Force clean remount
        toast.success('Content updated successfully!');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    }
  }, [data, id, editedContent]);

  // Improved handleCancel with proper cleanup
  const handleCancel = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Reset content before hiding editor
    setEditedContent(String(data.content || ''));
    
    // Use setTimeout to ensure state updates happen in correct order
    setTimeout(() => {
      setIsEditing(false);
      setQuillKey(prev => prev + 1); // Force clean remount
    }, 0);
  }, [data.content]);

  // Enhanced handleSendSelectedText with error handling
  const handleSendSelectedText = useCallback(() => {
    try {
      if (quillRef.current && data.onSendTextToChat) {
        const quill = quillRef.current.getEditor();
        const selection = quill.getSelection();
        
        if (selection && selection.length > 0) {
          const selectedText = quill.getText(selection.index, selection.length);
          if (selectedText.trim()) {
            data.onSendTextToChat(`Please rewrite this text: "${selectedText.trim()}"`);
            toast.success('Selected text sent to AI chat!');
          } else {
            toast.warn('Please select some text first');
          }
        } else {
          toast.warn('Please select some text to send to AI');
        }
      }
    } catch (error) {
      console.error('Error sending text to chat:', error);
      toast.error('Failed to send text to AI');
    }
  }, [data.onSendTextToChat]);

  // Enhanced handleQuillChange wrapper with error handling
  const handleQuillChange = useCallback((value: string) => {
    try {
      // Ensure content is always treated as a string
      setEditedContent(String(value || ''));
    } catch (error) {
      console.error('Error updating Quill content:', error);
      // Fallback to empty string
      setEditedContent('');
    }
  }, []);

  // Enhanced React Quill modules configuration with custom toolbar
  const quillModules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        ['link'],
        ['send-to-ai'], // Custom button
        ['clean']
      ],
      handlers: {
        'send-to-ai': handleSendSelectedText
      }
    },
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'blockquote', 'code-block', 'link'
  ];

  // Add custom button to Quill toolbar with error handling
  useEffect(() => {
    try {
      if (quillRef.current && isEditing) {
        const quill = quillRef.current.getEditor();
        const toolbar = quill.getModule('toolbar');
        
        // Add custom send button
        const sendButton = toolbar.container.querySelector('.ql-send-to-ai');
        if (sendButton) {
          sendButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22,2 15,22 11,13 2,9"></polygon></svg>';
          sendButton.setAttribute('title', 'Send selected text to AI');
        }
      }
    } catch (error) {
      console.error('Error setting up Quill toolbar:', error);
    }
  }, [isEditing, quillKey]); // Added quillKey to dependencies

  // Focus the editor when entering edit mode with error handling
  useEffect(() => {
    if (isEditing && quillRef.current) {
      try {
        setTimeout(() => {
          const quill = quillRef.current?.getEditor();
          if (quill) {
            quill.focus();
            // Set cursor at the end of content
            const length = quill.getLength();
            quill.setSelection(length - 1, 0);
          }
        }, 100);
      } catch (error) {
        console.error('Error focusing Quill editor:', error);
      }
    }
  }, [isEditing, quillKey]); // Added quillKey to dependencies

  return (
    <div 
      className={`
        bg-white rounded-xl shadow-lg border-2 transition-all duration-200 cursor-pointer
        ${isEditing ? 'min-w-[600px] max-w-[800px]' : 'min-w-[400px] max-w-[600px]'}
        ${selected ? 'border-indigo-400 shadow-xl ring-2 ring-indigo-200' : `${getTypeColor()} hover:shadow-xl`}
      `}
    >
      {/* Node Header */}
      <div className={`px-4 py-3 border-b rounded-t-xl ${getHeaderColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {getIcon()}
            <span className="text-sm font-semibold text-gray-900 truncate">
              {data.title}
            </span>
            {isEditing && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                Editing
              </span>
            )}
            {!isEditing && data.type === 'text' && (
              <span className="text-xs text-gray-500">
                Click to edit
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
                  <button
                    onClick={handleEdit}
                    className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-white/50 transition-colors"
                    title="Edit content"
                  >
                    <Edit3 size={12} />
                  </button>
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
                    onClick={handleSave}
                    className="p-1.5 rounded-md text-green-500 hover:text-green-700 hover:bg-white/50 transition-colors"
                    title="Save changes"
                  >
                    <Save size={12} />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-white/50 transition-colors"
                    title="Cancel editing"
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
            {/* ReactQuill Editor - Only rendered when editing with key for clean remount */}
            {isEditing && (
              <div className="space-y-4">
                <div className="canvas-editor">
                  <ReactQuill
                    key={quillKey} // Force remount with key
                    ref={quillRef}
                    value={String(editedContent || '')}
                    onChange={handleQuillChange} // Use wrapper function
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Edit your content..."
                    theme="snow"
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-blue-800">
                    <Send size={14} />
                    <span className="font-medium">Pro tip:</span>
                    <span>Select text and click the send button (📤) in the toolbar to ask AI to rewrite it</span>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    leftIcon={<X size={14} />}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    leftIcon={<Save size={14} />}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {/* ReactMarkdown Preview - Only shown when not editing */}
            {!isEditing && (
              <div className="text-sm text-gray-700 leading-relaxed">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>
                    {data.content || ''}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </>
        )}
        
        {data.type === 'image' && (
          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Image size={32} className="text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">AI Generated Image</p>
              <p className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">{data.title}</p>
            </div>
          </div>
        )}
        
        {data.type === 'chart' && (
          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 size={32} className="text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Data Visualization</p>
              <p className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">{data.title}</p>
            </div>
          </div>
        )}
        
        {data.type === 'video' && (
          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Video size={32} className="text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Video Content</p>
              <p className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">{data.title}</p>
            </div>
          </div>
        )}

        {/* Metadata - Only show for non-text types or when not editing text */}
        {(data.type !== 'text' || !isEditing) && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              {data.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-xs text-gray-500">
              {(data.content || '').length} characters
            </span>
          </div>
        )}
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
}));

ContentNode.displayName = 'ContentNode';

export default ContentNode;