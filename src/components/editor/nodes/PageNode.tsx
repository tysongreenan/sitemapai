import React, { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FileText, Eye, EyeOff, Package, ChevronDown, ChevronUp, Plus, Sparkles, GripVertical, Menu, PanelRight, Layout, Grid, MessageCircle, Mail, Users, Zap } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '../../ui/Button';

const componentIcons: Record<string, React.ReactNode> = {
  'navbar': <Menu size={12} />,
  'sidebar': <PanelRight size={12} />,
  'hero-centered': <Layout size={12} />,
  'hero-split': <Grid size={12} />,
  'feature-grid': <Grid size={12} />,
  'testimonials': <MessageCircle size={12} />,
  'footer-simple': <Layout size={12} />,
  'footer-columns': <Grid size={12} />,
  'contact-form': <Mail size={12} />,
  'team-section': <Users size={12} />,
  'cta-simple': <Zap size={12} />,
};

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
  sections: Section[];
  onAddNode?: (direction: 'bottom' | 'left' | 'right', nodeId: string) => void;
  onSectionsReorder?: (sections: Section[]) => void;
  onSectionDragStart?: () => void;
  onSectionDragEnd?: () => void;
}

export const ComponentPreview = ({ type }: { type: string }) => {
  const previews: Record<string, JSX.Element> = {
    'navbar': (
      <div className="w-full h-8 bg-gray-800 rounded-t flex items-center px-2 gap-2">
        <div className="w-6 h-4 bg-blue-500 rounded" />
        <div className="flex-1 flex gap-2">
          <div className="w-10 h-3 bg-gray-600 rounded" />
          <div className="w-10 h-3 bg-gray-600 rounded" />
          <div className="w-10 h-3 bg-gray-600 rounded" />
        </div>
        <div className="w-12 h-4 bg-blue-500 rounded text-xs" />
      </div>
    ),
    'hero-centered': (
      <div className="w-full h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded p-3 flex flex-col items-center justify-center gap-1">
        <div className="w-20 h-3 bg-white/20 rounded" />
        <div className="w-16 h-2 bg-white/20 rounded" />
        <div className="w-12 h-4 bg-white rounded mt-1" />
      </div>
    ),
    // ... other previews remain the same
    'default': (
      <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
        <Package size={20} className="text-gray-400" />
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
        return 'bottom-[35px] left-1/2 transform -translate-x-1/2';
      case 'left':
        return 'left-[35px] top-1/2 transform -translate-y-1/2';
      case 'right':
        return 'right-[35px] top-1/2 transform -translate-y-1/2';
    }
  };

  const getArrowClasses = () => {
    switch (direction) {
      case 'bottom':
        return 'rotate-90';
      case 'left':
        return 'rotate-180';
      case 'right':
        return '';
    }
  };

  return (
    <div
      className={`absolute ${getPositionClasses()} transition-all duration-200 z-10 ${
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'
      }`}
    >
      <button
        onClick={onAdd}
        className="add-node-button w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group border-2 border-white"
        title={`Add page ${direction}`}
      >
        <Plus size={16} className="transition-transform group-hover:scale-110" />
      </button>
    </div>
  );
};

const PageNode = ({ data, selected, id }: NodeProps<PageData>) => {
  const [showPreview, setShowPreview] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [hoveredDirection, setHoveredDirection] = useState<'bottom' | 'left' | 'right' | null>(null);
  const [isHovering, setIsHovering] = useState(false);

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

  const handleDragStart = () => {
    data.onSectionDragStart?.();
  };

  const handleDragEnd = (result: any) => {
    data.onSectionDragEnd?.();
    
    if (!result.destination || !data.sections) return;

    const items = Array.from(data.sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Call the reorder function if provided
    if (data.onSectionsReorder) {
      data.onSectionsReorder(items);
    }
  };

  const sections = data.sections || [];

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setHoveredDirection(null);
      }}
    >
      {/* Hover zones for add buttons - positioned further outside the main node */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Bottom hover zone - moved further down */}
        <div
          className="absolute bottom-[-40px] left-1/4 right-1/4 h-20 pointer-events-auto z-10"
          onMouseEnter={() => setHoveredDirection('bottom')}
          onMouseLeave={() => setHoveredDirection(null)}
          style={{ cursor: 'pointer' }}
        />
        
        {/* Left hover zone - moved further left */}
        <div
          className="absolute left-[-40px] top-1/4 bottom-1/4 w-20 pointer-events-auto z-10"
          onMouseEnter={() => setHoveredDirection('left')}
          onMouseLeave={() => setHoveredDirection(null)}
          style={{ cursor: 'pointer' }}
        />
        
        {/* Right hover zone - moved further right */}
        <div
          className="absolute right-[-40px] top-1/4 bottom-1/4 w-20 pointer-events-auto z-10"
          onMouseEnter={() => setHoveredDirection('right')}
          onMouseLeave={() => setHoveredDirection(null)}
          style={{ cursor: 'pointer' }}
        />
      </div>

      {/* Add node buttons */}
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
        className={`node-content min-w-[280px] max-w-[320px] bg-white border-2 rounded-lg shadow-lg overflow-hidden transition-all duration-200 ${
          selected ? 'border-blue-500 ring-2 ring-blue-200 scale-105' : 'border-gray-200 hover:border-gray-300 hover:shadow-xl'
        }`}
      >
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText size={16} className="text-white flex-shrink-0" />
            <div className="font-medium text-white truncate">{data.label}</div>
          </div>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="text-white/80 hover:text-white transition-colors p-1"
          >
            {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        
        <div className="p-3">
          <div className="text-xs text-gray-500 mb-2 font-mono">{data.url}</div>
          
          {data.description && (
            <div className="text-xs text-gray-600 mb-3 line-clamp-2">{data.description}</div>
          )}
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sections">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2"
                >
                  {sections.map((section, index) => (
                    <Draggable
                      key={section.id}
                      draggableId={section.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`border rounded-lg overflow-hidden transition-all ${
                            snapshot.isDragging 
                              ? 'shadow-lg ring-2 ring-blue-200 bg-white' 
                              : 'hover:shadow'
                          }`}
                        >
                          <div className={`flex items-center bg-gray-50 ${
                            snapshot.isDragging ? 'bg-blue-50' : ''
                          }`}>
                            <div
                              {...provided.dragHandleProps}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-md hover:bg-gray-100 cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical size={14} className="text-gray-400" />
                            </div>
                            
                            <button
                              className="flex-1 flex items-center justify-between p-2 hover:bg-gray-100 transition-colors"
                              onClick={() => toggleSection(section.id)}
                            >
                              <div className="flex items-center gap-2">
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
                          </div>
                          
                          {expandedSections.has(section.id) && (
                            <div className="p-2 space-y-2 bg-white">
                              <div className="text-xs text-gray-600">{section.description}</div>
                              
                              {showPreview && (section.components || []).map((componentId, index) => (
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
                                  <div className="h-12 overflow-hidden rounded border border-gray-200">
                                    <ComponentPreview type={componentId} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <div className="mt-4 space-y-2">
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              leftIcon={<Plus size={14} />}
              onClick={() => {
                // Handle adding new section
              }}
            >
              Add Section
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              leftIcon={<Sparkles size={14} />}
              onClick={() => {
                // Handle generating content
              }}
            >
              Generate Content
            </Button>
          </div>
        </div>
        
        {/* Connection handles - completely hidden */}
        <Handle
          type="target"
          position={Position.Top}
          className="!opacity-0 !pointer-events-none !w-0 !h-0"
          style={{ visibility: 'hidden' }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="!opacity-0 !pointer-events-none !w-0 !h-0"
          style={{ visibility: 'hidden' }}
        />
        <Handle
          type="target"
          position={Position.Left}
          className="!opacity-0 !pointer-events-none !w-0 !h-0"
          style={{ visibility: 'hidden' }}
        />
        <Handle
          type="source"
          position={Position.Right}
          className="!opacity-0 !pointer-events-none !w-0 !h-0"
          style={{ visibility: 'hidden' }}
        />
      </div>
    </div>
  );
};

export default memo(PageNode);