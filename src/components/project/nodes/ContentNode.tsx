import React, { memo, useState, useRef, useImperativeHandle, forwardRef, useEffect, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  FileText, Image, BarChart3, Video, Copy, Trash2, Bold, Italic, 
  Underline, List, Link2, Send, Globe, Youtube, Facebook, Instagram,
  ExternalLink, Play, Monitor, Smartphone, Edit3, Twitter, Linkedin
} from 'lucide-react';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';

export interface ContentNodeData {
  title: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'website' | 'youtube' | 'social_ad' | 'embed' | 'analytics' | 'action';
  subType?: 'facebook' | 'google' | 'instagram' | 'tiktok' | 'linkedin' | 'twitter' | 'funnel' | 'heatmap' | 'metrics' | 'form' | 'purchase' | 'payment' | 'cta';
  createdAt: Date;
  selected?: boolean;
  metadata?: {
    url?: string;
    embedCode?: string;
    platform?: string;
    aspectRatio?: string;
    autoplay?: boolean;
    muted?: boolean;
    loop?: boolean;
    campaignId?: string;
    adId?: string;
    thumbnail?: string;
    device?: 'desktop' | 'mobile' | 'both';
    conversionRate?: string;
    clickThroughRate?: string;
    impressions?: number;
    clicks?: number;
    cost?: string;
  };
  onDelete?: (nodeId: string) => void;
  onContentUpdate?: (nodeId: string, newContent: string) => void;
  onMetadataUpdate?: (nodeId: string, metadata: any) => void;
  onSendTextToChat?: (text: string) => void;
  onNodeDoubleClick?: (nodeId: string) => void;
}

const ContentNode = memo(forwardRef<any, NodeProps<ContentNodeData>>(({ data, selected, id }, ref) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [editingUrl, setEditingUrl] = useState(false);
  const [tempUrl, setTempUrl] = useState(data.metadata?.url || '');
  const contentRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const lastSavedContent = useRef(data.content);

  // Handle text selection for toolbar (only for text type)
  useEffect(() => {
    const handleSelection = () => {
      if (!isEditing || !contentRef.current || data.type !== 'text') return;

      const selection = window.getSelection();
      const text = selection?.toString();

      if (text && text.length > 0) {
        setSelectedText(text);
        
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
  }, [isEditing, data.type]);

  // Set node as non-draggable when editing
  useEffect(() => {
    if (nodeRef.current) {
      const nodeElement = nodeRef.current.closest('.react-flow__node');
      if (nodeElement) {
        if (isEditing || editingUrl) {
          nodeElement.classList.add('nodrag');
          nodeElement.style.cursor = 'default';
        } else {
          nodeElement.classList.remove('nodrag');
          nodeElement.style.cursor = 'grab';
        }
      }
    }
  }, [isEditing, editingUrl]);

  const getIcon = () => {
    switch (data.type) {
      case 'text': return <FileText size={16} className="text-blue-600" />;
      case 'image': return <Image size={16} className="text-green-600" />;
      case 'video': return <Video size={16} className="text-purple-600" />;
      case 'website': return <Globe size={16} className="text-indigo-600" />;
      case 'youtube': return <Youtube size={16} className="text-red-600" />;
      case 'social_ad': 
        switch (data.subType) {
          case 'facebook': return <Facebook size={16} className="text-blue-700" />;
          case 'instagram': return <Instagram size={16} className="text-pink-600" />;
          case 'twitter': return <Twitter size={16} className="text-blue-500" />;
          case 'linkedin': return <Linkedin size={16} className="text-blue-800" />;
          case 'google': return <Globe size={16} className="text-yellow-600" />;
          default: return <Monitor size={16} className="text-gray-600" />;
        }
      case 'embed': return <ExternalLink size={16} className="text-teal-600" />;
      case 'analytics': return <BarChart3 size={16} className="text-orange-600" />;
      case 'action': return <Play size={16} className="text-emerald-600" />;
      default: return <FileText size={16} className="text-gray-600" />;
    }
  };

  const getTypeColor = () => {
    switch (data.type) {
      case 'text': return 'border-blue-200 bg-blue-50';
      case 'image': return 'border-green-200 bg-green-50';
      case 'video': return 'border-purple-200 bg-purple-50';
      case 'website': return 'border-indigo-200 bg-indigo-50';
      case 'youtube': return 'border-red-200 bg-red-50';
      case 'social_ad': return 'border-yellow-200 bg-yellow-50';
      case 'embed': return 'border-teal-200 bg-teal-50';
      case 'analytics': return 'border-orange-200 bg-orange-50';
      case 'action': return 'border-emerald-200 bg-emerald-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getHeaderColor = () => {
    switch (data.type) {
      case 'text': return 'bg-blue-100 border-blue-200';
      case 'image': return 'bg-green-100 border-green-200';
      case 'video': return 'bg-purple-100 border-purple-200';
      case 'website': return 'bg-indigo-100 border-indigo-200';
      case 'youtube': return 'bg-red-100 border-red-200';
      case 'social_ad': return 'bg-yellow-100 border-yellow-200';
      case 'embed': return 'bg-teal-100 border-teal-200';
      case 'analytics': return 'bg-orange-100 border-orange-200';
      case 'action': return 'bg-emerald-100 border-emerald-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  const extractYoutubeId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const renderContent = () => {
    switch (data.type) {
      case 'text':
        return (
          <>
            {isEditing ? (
              <div
                ref={contentRef}
                contentEditable
                className="prose prose-sm max-w-none text-gray-700 outline-none min-h-[100px] p-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-300 focus:bg-white transition-colors"
                onKeyDown={handleKeyDown}
                onBlur={handleContentBlur}
                onMouseDown={(e) => e.stopPropagation()}
                dangerouslySetInnerHTML={{ __html: data.content || '' }}
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
          </>
        );

      case 'youtube':
        const youtubeId = data.metadata?.url ? extractYoutubeId(data.metadata.url) : null;
        return (
          <div className="space-y-2">
            {editingUrl ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  onBlur={handleUrlSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUrlSave();
                    if (e.key === 'Escape') {
                      setTempUrl(data.metadata?.url || '');
                      setEditingUrl(false);
                    }
                  }}
                  placeholder="Enter YouTube URL..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <p className="text-xs text-gray-500">Press Enter to save, Esc to cancel</p>
              </div>
            ) : (
              <>
                {youtubeId ? (
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}?modestbranding=1&rel=0`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <div 
                    className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => setEditingUrl(true)}
                  >
                    <div className="text-center">
                      <Youtube size={48} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to add YouTube video</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );

      case 'website':
        return (
          <div className="space-y-2">
            {editingUrl ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  onBlur={handleUrlSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUrlSave();
                    if (e.key === 'Escape') {
                      setTempUrl(data.metadata?.url || '');
                      setEditingUrl(false);
                    }
                  }}
                  placeholder="Enter website URL..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <p className="text-xs text-gray-500">Press Enter to save, Esc to cancel</p>
              </div>
            ) : (
              <>
                {data.metadata?.url ? (
                  <div className="space-y-2">
                    <div className="relative">
                      {/* Website Preview */}
                      <div className="aspect-video bg-white rounded-lg border border-gray-200 overflow-hidden relative group">
                        <iframe
                          src={data.metadata.url}
                          className="w-full h-full"
                          sandbox="allow-same-origin allow-scripts"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                          <a 
                            href={data.metadata.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="opacity-0 group-hover:opacity-100 bg-white rounded-full p-2 shadow-lg transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink size={20} />
                          </a>
                        </div>
                      </div>
                      {/* Device selector */}
                      <div className="absolute top-2 right-2 flex gap-1 bg-white rounded-lg shadow-md p-1">
                        <button
                          className={`p-1.5 rounded ${data.metadata?.device === 'desktop' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
                          onClick={() => handleDeviceChange('desktop')}
                          title="Desktop view"
                        >
                          <Monitor size={16} />
                        </button>
                        <button
                          className={`p-1.5 rounded ${data.metadata?.device === 'mobile' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
                          onClick={() => handleDeviceChange('mobile')}
                          title="Mobile view"
                        >
                          <Smartphone size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span className="truncate">{data.metadata.url}</span>
                      <button
                        onClick={() => setEditingUrl(true)}
                        className="text-indigo-600 hover:text-indigo-700"
                      >
                        Edit URL
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => setEditingUrl(true)}
                  >
                    <div className="text-center">
                      <Globe size={48} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to add website URL</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );

      case 'social_ad':
        return (
          <div className="space-y-2">
            {data.metadata?.thumbnail ? (
              <div className="relative group">
                <img 
                  src={data.metadata.thumbnail} 
                  alt={data.title}
                  className="w-full rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                  <Play size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                  <span className="text-xs bg-black bg-opacity-75 text-white px-2 py-1 rounded">
                    {data.subType?.toUpperCase()} Ad
                  </span>
                  {data.metadata.campaignId && (
                    <span className="text-xs bg-black bg-opacity-75 text-white px-2 py-1 rounded">
                      Campaign: {data.metadata.campaignId}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  {getIcon()}
                  <p className="text-sm text-gray-600 mt-2">Ad Preview</p>
                  <p className="text-xs text-gray-500 mt-1">{data.subType} Ad</p>
                </div>
              </div>
            )}
            
            {/* Ad Metrics */}
            {(data.metadata?.impressions || data.metadata?.clicks || data.metadata?.cost) && (
              <div className="grid grid-cols-3 gap-2 text-xs">
                {data.metadata.impressions && (
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="font-semibold">{data.metadata.impressions.toLocaleString()}</div>
                    <div className="text-gray-500">Impressions</div>
                  </div>
                )}
                {data.metadata.clicks && (
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="font-semibold">{data.metadata.clicks.toLocaleString()}</div>
                    <div className="text-gray-500">Clicks</div>
                  </div>
                )}
                {data.metadata.cost && (
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="font-semibold">{data.metadata.cost}</div>
                    <div className="text-gray-500">Cost</div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-2">
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 size={48} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">{data.subType === 'funnel' ? 'Conversion Funnel' : data.subType === 'heatmap' ? 'Heatmap Analysis' : 'Analytics Dashboard'}</p>
                <p className="text-xs text-gray-500 mt-1">Data Visualization</p>
              </div>
            </div>
            
            {/* Sample metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 p-2 rounded text-center">
                <div className="font-semibold text-green-600">+24%</div>
                <div className="text-gray-500">Conversion Rate</div>
              </div>
              <div className="bg-gray-50 p-2 rounded text-center">
                <div className="font-semibold text-blue-600">2.3s</div>
                <div className="text-gray-500">Avg. Time</div>
              </div>
            </div>
          </div>
        );

      case 'action':
        return (
          <div className="space-y-2">
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Play size={48} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {data.subType === 'form' ? 'Form Submission' : 
                   data.subType === 'purchase' ? 'Purchase Action' :
                   data.subType === 'payment' ? 'Payment Gateway' : 'Call-to-Action'}
                </p>
                <p className="text-xs text-gray-500 mt-1">User Action</p>
              </div>
            </div>
            
            {/* Action metrics */}
            {data.metadata?.conversionRate && (
              <div className="bg-gray-50 p-2 rounded text-center text-xs">
                <div className="font-semibold text-green-600">{data.metadata.conversionRate}</div>
                <div className="text-gray-500">Conversion Rate</div>
              </div>
            )}
          </div>
        );

      case 'image':
        return (
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            {data.content ? (
              <img src={data.content} alt={data.title} className="max-w-full max-h-full object-contain rounded-lg" />
            ) : (
              <Image size={48} className="text-gray-400" />
            )}
          </div>
        );

      case 'embed':
        return (
          <div className="space-y-2">
            {data.metadata?.embedCode ? (
              <div 
                className="aspect-video bg-gray-100 rounded-lg overflow-hidden"
                dangerouslySetInnerHTML={{ __html: data.metadata.embedCode }}
              />
            ) : (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <ExternalLink size={48} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Custom Embed</p>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const copyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    const contentToCopy = data.type === 'text' ? data.content : data.metadata?.url || data.title;
    navigator.clipboard.writeText(contentToCopy);
    toast.success('Content copied to clipboard!');
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this content?')) {
      data.onDelete?.(id);
    }
  };

  const startEditing = () => {
    if (data.type === 'text' && !isEditing) {
      setIsEditing(true);
      lastSavedContent.current = data.content;
    }
  };

  const saveContent = () => {
    if (contentRef.current && isEditing) {
      const newContent = contentRef.current.innerHTML
        .replace(/<div>/g, '\n')
        .replace(/<\/div>/g, '')
        .replace(/<br>/g, '\n')
        .replace(/<[^>]*>/g, '');
      
      if (newContent !== lastSavedContent.current) {
        data.onContentUpdate?.(id, newContent);
        lastSavedContent.current = newContent;
      }
      
      setIsEditing(false);
      setShowToolbar(false);
    }
  };

  const handleContentBlur = (e: React.FocusEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    const isWithinNode = nodeRef.current?.contains(relatedTarget);
    
    if (!isWithinNode) {
      saveContent();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (contentRef.current) {
        contentRef.current.innerHTML = lastSavedContent.current;
      }
      setIsEditing(false);
      setShowToolbar(false);
    }
  };

  const handleUrlSave = () => {
    if (tempUrl && tempUrl !== data.metadata?.url) {
      data.onMetadataUpdate?.(id, {
        ...data.metadata,
        url: tempUrl
      });
    }
    setEditingUrl(false);
  };

  const handleDeviceChange = (device: 'desktop' | 'mobile') => {
    data.onMetadataUpdate?.(id, {
      ...data.metadata,
      device
    });
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

  // Focus effect for text editing
  useEffect(() => {
    if (isEditing && contentRef.current && data.type === 'text') {
      const timer = setTimeout(() => {
        contentRef.current?.focus();
        const range = document.createRange();
        const selection = window.getSelection();
        if (contentRef.current.childNodes.length > 0) {
          range.selectNodeContents(contentRef.current);
          range.collapse(false);
        }
        selection?.removeAllRanges();
        selection?.addRange(range);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [isEditing, data.type]);

  return (
    <div 
      ref={nodeRef}
      className={`
        bg-white rounded-xl shadow-lg border-2 transition-all duration-200 relative
        min-w-[400px] max-w-[600px]
        ${selected ? 'border-indigo-400 shadow-xl ring-2 ring-indigo-200' : `${getTypeColor()} hover:shadow-xl`}
        ${isEditing || editingUrl ? 'editing nodrag' : ''}
      `}
      onMouseDown={(e) => {
        if (isEditing || editingUrl || (e.target as HTMLElement).getAttribute('contenteditable') === 'true') {
          e.stopPropagation();
        }
      }}
    >
      {/* Floating Toolbar for text editing */}
      {showToolbar && isEditing && data.type === 'text' && (
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
            onMouseDown={(e) => e.preventDefault()}
            title="Bold"
          >
            <Bold size={14} />
          </button>
          <button
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            onClick={() => applyFormat('italic')}
            onMouseDown={(e) => e.preventDefault()}
            title="Italic"
          >
            <Italic size={14} />
          </button>
          <button
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            onClick={() => applyFormat('underline')}
            onMouseDown={(e) => e.preventDefault()}
            title="Underline"
          >
            <Underline size={14} />
          </button>
          <div className="w-px h-6 bg-gray-600 mx-1" />
          <button
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            onClick={() => applyFormat('insertUnorderedList')}
            onMouseDown={(e) => e.preventDefault()}
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
            onMouseDown={(e) => e.preventDefault()}
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
                onMouseDown={(e) => e.preventDefault()}
                title="Send to AI"
              >
                <Send size={14} />
                <span className="text-xs">AI</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Node Header */}
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
            {(isEditing || editingUrl) && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                Editing
              </span>
            )}
          </div>
          {selected && (
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={copyToClipboard}
                className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-white/50 transition-colors"
                title="Copy content"
              >
                <Copy size={12} />
              </button>
              {(data.type === 'website' || data.type === 'youtube') && (
                <button
                  onClick={() => setEditingUrl(true)}
                  className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-white/50 transition-colors"
                  title="Edit URL"
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
            </div>
          )}
        </div>
      </div>

      {/* Node Content */}
      <div className="p-4">
        {renderContent()}
        
        {/* Metadata info */}
        {data.metadata?.platform && (
          <div className="mt-2 text-xs text-gray-500">
            Platform: {data.metadata.platform}
          </div>
        )}
        
        {/* Timestamp */}
        <div className="mt-2 text-xs text-gray-500">
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