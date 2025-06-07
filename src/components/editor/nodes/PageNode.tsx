import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import { FileText, Plus, ChevronDown, ChevronUp, Package, GripVertical } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

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
  onTitleChange?: (title: string) => void;
}

interface PageNodeProps {
  data: PageData;
  selected: boolean;
  id: string;
}

const componentIcons: Record<string, React.ReactNode> = {
  'hero-centered': <Package size={12} />,
  'hero-split': <Package size={12} />,
  'feature-grid': <Package size={12} />,
  'testimonials': <Package size={12} />,
  'footer-simple': <Package size={12} />,
  'contact-form': <Package size={12} />,
};

const ComponentPreview = ({ type }: { type: string }) => {
  const previews: Record<string, JSX.Element> = {
    'hero-centered': (
      <div className="w-full h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded p-2 flex flex-col items-center justify-center gap-1">
        <div className="w-16 h-2 bg-white/20 rounded" />
        <div className="w-12 h-2 bg-white/20 rounded" />
        <div className="w-8 h-3 bg-white rounded" />
      </div>
    ),
    'feature-grid': (
      <div className="w-full h-16 bg-gray-50 rounded p-1">
        <div className="grid grid-cols-2 gap-1 h-full">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded border flex flex-col items-center justify-center">
              <div className="w-3 h-3 bg-blue-500 rounded mb-1" />
              <div className="w-4 h-1 bg-gray-300 rounded" />
            </div>
          ))}
        </div>
      </div>
    ),
    'default': (
      <div className="w-full h-16 bg-gray-100 rounded flex items-center justify-center">
        <Package size={16} className="text-gray-400" />
      </div>
    )
  };

  return previews[type] || previews.default;
};

interface AddNodeButtonProps {
  direction: 'bottom' | 'left' | 'right';
  onAdd: () => void;
  visible: boolean;
}

const AddNodeButton = ({ direction, onAdd, visible }: AddNodeButtonProps) => {
  const getPositionClasses = () => {
    switch (direction) {
      case 'bottom':
        return 'bottom-[-20px] left-1/2 transform -translate-x-1/2';
      case 'left':
        return 'left-[-20px] top-1/2 transform -translate-y-1/2';
      case 'right':
        return 'right-[-20px] top-1/2 transform -translate-y-1/2';
    }
  };

  const getColorClasses = () => {
    switch (direction) {
      case 'bottom':
        return 'bg-green-500 hover:bg-green-600';
      case 'left':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'right':
        return 'bg-purple-500 hover:bg-purple-600';
    }
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onAdd();
      }}
      className={`absolute ${getPositionClasses()} w-8 h-8 ${getColorClasses()} text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group border-2 border-white z-10 ${
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'
      }`}
      title={`Add page ${direction}`}
    >
      <Plus size={14} className="transition-transform group-hover:scale-110" />
    </button>
  );
};

const PageNode = ({ data, selected, id }: PageNodeProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [hoveredDirection, setHoveredDirection] = useState<'bottom' | 'left' | 'right' | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [title, setTitle] = useState(data.label);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data.isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [data.isEditing]);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleAddNode = useCallback((direction: 'bottom' | 'left' | 'right') => {
    if (data.onAddNode) {
      data.onAddNode(direction, id);
    }
  }, [data.onAddNode, id]);

  const handleTitleChange = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && data.onTitleChange) {
      data.onTitleChange(title);
    }
  }, [title, data.onTitleChange]);

  const handleTitleBlur = useCallback(() => {
    if (data.onTitleChange) {
      data.onTitleChange(title);
    }
  }, [title, data.onTitleChange]);

  const sections = data.sections || [];

  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setHoveredDirection(null);
      }}
    >
      {/* Hover zones */}
      <div 
        className="absolute -bottom-6 left-0 right-0 h-12 z-[5]"
        onMouseEnter={() => setHoveredDirection('bottom')}
        onMouseLeave={() => setHoveredDirection(null)}
      />
      <div 
        className="absolute -left-6 top-0 bottom-0 w-12 z-[5]"
        onMouseEnter={() => setHoveredDirection('left')}
        onMouseLeave={() => setHoveredDirection(null)}
      />
      <div 
        className="absolute -right-6 top-0 bottom-0 w-12 z-[5]"
        onMouseEnter={() => setHoveredDirection('right')}
        onMouseLeave={() => setHoveredDirection(null)}
      />

      {/* Add buttons */}
      <AddNodeButton
        direction="bottom"
        onAdd={() => handleAddNode('bottom')}
        visible={isHovering && hoveredDirection === 'bottom'}
      />
      <AddNodeButton
        direction="left"
        onAdd={() => handleAddNode('left')}
        visible={isHovering && hoveredDirection === 'left'}
      />
      <AddNodeButton
        direction="right"
        onAdd={() => handleAddNode('right')}
        visible={isHovering && hoveredDirection === 'right'}
      />

      {/* Main node content */}
      <div
        className={`w-full h-full bg-white border-2 rounded-lg shadow-lg overflow-hidden transition-all duration-200 ${
          selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText size={16} className="text-white flex-shrink-0" />
            {data.isEditing ? (
              <Input
                ref={titleInputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleTitleChange}
                onBlur={handleTitleBlur}
                className="text-white bg-white/10 border-white/20 focus:border-white/40 focus:ring-white/20 placeholder-white/60 text-sm"
                placeholder="Enter page title..."
              />
            ) : (
              <div className="font-medium text-white truncate text-sm">{data.label}</div>
            )}
          </div>
        </div>
        
        <div className="p-3 h-full overflow-y-auto" style={{ height: 'calc(100% - 44px)' }}>
          <div className="text-xs text-gray-500 mb-2 font-mono">{data.url}</div>
          
          {data.description && (
            <div className="text-xs text-gray-600 mb-3 line-clamp-2">{data.description}</div>
          )}
          
          <div className="space-y-2">
            {sections.map((section) => (
              <div
                key={section.id}
                className="border rounded-lg overflow-hidden"
              >
                <button
                  className="flex items-center justify-between w-full text-left p-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center gap-2">
                    <GripVertical size={12} className="text-gray-400" />
                    <span className="text-sm font-medium">{section.label}</span>
                    <span className="text-xs text-gray-500">
                      ({section.components?.length || 0})
                    </span>
                  </div>
                  {expandedSections.has(section.id) ? (
                    <ChevronUp size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                </button>
                
                {expandedSections.has(section.id) && (
                  <div className="p-2 space-y-2 bg-white">
                    <div className="text-xs text-gray-600">{section.description}</div>
                    
                    {(section.components || []).map((componentId, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded p-2"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {componentIcons[componentId] || <Package size={12} />}
                          <span className="text-xs font-medium capitalize">
                            {componentId.replace(/-/g, ' ')}
                          </span>
                        </div>
                        <div className="overflow-hidden rounded border border-gray-200">
                          <ComponentPreview type={componentId} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <Button
              variant="secondary"
              size="sm"
              className="w-full text-xs"
              leftIcon={<Plus size={12} />}
            >
              Add Section
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(PageNode);