import React, { useState, useRef, useEffect } from 'react';
import { Plus, Download, Share, Maximize2, Grid, Image, FileText, Video, BarChart3, Trash2, Copy, Edit3 } from 'lucide-react';
import { Button } from '../ui/Button';

interface CanvasItem {
  id: string;
  type: 'text' | 'image' | 'chart' | 'video';
  title: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  createdAt: Date;
}

interface ProjectCanvasProps {
  projectId: string;
  onItemSelect?: (item: CanvasItem | null) => void;
  selectedItem?: CanvasItem | null;
}

export function ProjectCanvas({ projectId, onItemSelect, selectedItem }: ProjectCanvasProps) {
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  // Add new item to canvas
  const addItem = (type: CanvasItem['type'], content: string, title: string) => {
    const newItem: CanvasItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      content,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: type === 'text' ? 300 : 250,
      height: type === 'text' ? 200 : 180,
      createdAt: new Date()
    };
    
    setItems(prev => [...prev, newItem]);
    onItemSelect?.(newItem);
  };

  // Delete item
  const deleteItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
    if (selectedItem?.id === itemId) {
      onItemSelect?.(null);
    }
  };

  // Duplicate item
  const duplicateItem = (item: CanvasItem) => {
    const newItem: CanvasItem = {
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: `${item.title} (Copy)`,
      x: item.x + 20,
      y: item.y + 20,
      createdAt: new Date()
    };
    setItems(prev => [...prev, newItem]);
  };

  // Pan controls
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom controls
  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(0.25, Math.min(2, prev + delta)));
  };

  // Fit view
  const fitView = () => {
    if (items.length === 0) return;
    
    const minX = Math.min(...items.map(item => item.x)) - 50;
    const maxX = Math.max(...items.map(item => item.x + item.width)) + 50;
    const minY = Math.min(...items.map(item => item.y)) - 50;
    const maxY = Math.max(...items.map(item => item.y + item.height)) + 50;

    const canvasWidth = canvasRef.current?.clientWidth || 800;
    const canvasHeight = canvasRef.current?.clientHeight || 600;

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    const scaleX = canvasWidth / contentWidth;
    const scaleY = canvasHeight / contentHeight;
    const newZoom = Math.min(scaleX, scaleY, 1) * 0.9;

    setZoom(newZoom);
    setPanOffset({
      x: (canvasWidth - contentWidth * newZoom) / 2 - minX * newZoom,
      y: (canvasHeight - contentHeight * newZoom) / 2 - minY * newZoom
    });
  };

  // Get icon for item type
  const getItemIcon = (type: CanvasItem['type']) => {
    switch (type) {
      case 'text': return <FileText size={16} />;
      case 'image': return <Image size={16} />;
      case 'chart': return <BarChart3 size={16} />;
      case 'video': return <Video size={16} />;
      default: return <FileText size={16} />;
    }
  };

  // Get item color
  const getItemColor = (type: CanvasItem['type']) => {
    switch (type) {
      case 'text': return 'border-blue-200 bg-blue-50';
      case 'image': return 'border-green-200 bg-green-50';
      case 'chart': return 'border-purple-200 bg-purple-50';
      case 'video': return 'border-orange-200 bg-orange-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  // Render canvas item
  const renderItem = (item: CanvasItem) => {
    const isSelected = selectedItem?.id === item.id;
    
    return (
      <div
        key={item.id}
        className={`absolute bg-white rounded-lg shadow-lg border-2 cursor-pointer transition-all duration-200 ${
          isSelected 
            ? 'border-indigo-400 shadow-xl ring-2 ring-indigo-200' 
            : `${getItemColor(item.type)} hover:shadow-xl`
        }`}
        style={{
          left: item.x * zoom + panOffset.x,
          top: item.y * zoom + panOffset.y,
          width: item.width * zoom,
          height: item.height * zoom,
          zIndex: isSelected ? 20 : 10
        }}
        onClick={() => onItemSelect?.(item)}
      >
        {/* Item Header */}
        <div className={`px-3 py-2 border-b rounded-t-lg ${
          item.type === 'text' ? 'bg-blue-100 border-blue-200' :
          item.type === 'image' ? 'bg-green-100 border-green-200' :
          item.type === 'chart' ? 'bg-purple-100 border-purple-200' :
          'bg-orange-100 border-orange-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`${
                item.type === 'text' ? 'text-blue-600' :
                item.type === 'image' ? 'text-green-600' :
                item.type === 'chart' ? 'text-purple-600' :
                'text-orange-600'
              }`}>
                {getItemIcon(item.type)}
              </span>
              <span className="text-sm font-medium text-gray-900 truncate">
                {item.title}
              </span>
            </div>
            {isSelected && (
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateItem(item);
                  }}
                  className="p-1 rounded text-gray-500 hover:text-gray-700 hover:bg-white/50"
                  title="Duplicate"
                >
                  <Copy size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteItem(item.id);
                  }}
                  className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-white/50"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Item Content */}
        <div className="p-3 h-full overflow-hidden">
          {item.type === 'text' && (
            <div className="text-sm text-gray-700 leading-relaxed">
              {item.content.length > 200 ? `${item.content.substring(0, 200)}...` : item.content}
            </div>
          )}
          
          {item.type === 'image' && (
            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Image size={32} className="text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Generated Image</p>
                <p className="text-xs text-gray-400 mt-1">{item.title}</p>
              </div>
            </div>
          )}
          
          {item.type === 'chart' && (
            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 size={32} className="text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Data Visualization</p>
                <p className="text-xs text-gray-400 mt-1">{item.title}</p>
              </div>
            </div>
          )}
          
          {item.type === 'video' && (
            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Video size={32} className="text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Video Content</p>
                <p className="text-xs text-gray-400 mt-1">{item.title}</p>
              </div>
            </div>
          )}
        </div>

        {/* Creation timestamp */}
        <div className="absolute bottom-1 right-2 text-xs text-gray-400">
          {item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    );
  };

  // Expose addItem function to parent component
  useEffect(() => {
    (window as any).addCanvasItem = addItem;
    return () => {
      delete (window as any).addCanvasItem;
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Canvas Toolbar */}
      <div className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Canvas</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleZoom(-0.25)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Zoom out"
            >
              <span className="text-sm">−</span>
            </button>
            <span className="text-sm text-gray-600 min-w-[60px] text-center font-medium">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.25)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Zoom in"
            >
              <span className="text-sm">+</span>
            </button>
            <button
              onClick={fitView}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Fit to view"
            >
              <Maximize2 size={16} />
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-lg transition-colors ${
                showGrid ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Toggle grid"
            >
              <Grid size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<Share size={16} />}>
            Share
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Download size={16} />}>
            Export
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        ref={canvasRef}
        className="flex-1 relative overflow-hidden cursor-move bg-gray-50"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid Background */}
        {showGrid && (
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                radial-gradient(circle, #d1d5db 1px, transparent 1px)
              `,
              backgroundSize: `${25 * zoom}px ${25 * zoom}px`,
              backgroundPosition: `${panOffset.x % (25 * zoom)}px ${panOffset.y % (25 * zoom)}px`
            }}
          />
        )}

        {/* Canvas Items */}
        <div className="relative w-full h-full">
          {items.map(renderItem)}
        </div>

        {/* Empty State */}
        {items.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your canvas is empty</h3>
              <p className="text-gray-600 mb-4 max-w-md">
                Start chatting with AI to generate content that will appear here
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addItem('text', 'This is a sample blog post about AI marketing trends...', 'Sample Blog Post')}
                >
                  Add Sample Text
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addItem('image', 'AI-generated marketing image', 'Marketing Visual')}
                >
                  Add Sample Image
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}