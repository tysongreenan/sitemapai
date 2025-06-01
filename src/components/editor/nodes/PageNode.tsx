import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FileText, Eye, EyeOff, Package, ChevronDown, ChevronUp, Plus, Sparkles, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '../../ui/Button';
import { Menu, PanelRight, Layout, Grid, MessageCircle, Mail, Users, Zap } from 'lucide-react';

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
    'hero-split': (
      <div className="w-full h-24 bg-gray-100 rounded p-2 flex gap-2">
        <div className="flex-1 flex flex-col justify-center gap-1">
          <div className="w-full h-2 bg-gray-300 rounded" />
          <div className="w-3/4 h-2 bg-gray-300 rounded" />
          <div className="w-10 h-3 bg-blue-500 rounded mt-1" />
        </div>
        <div className="flex-1 bg-gray-300 rounded" />
      </div>
    ),
    'feature-grid': (
      <div className="grid grid-cols-3 gap-1 p-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 rounded" />
        ))}
      </div>
    ),
    'testimonials': (
      <div className="p-2 space-y-1">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-2 bg-gray-100 rounded p-1">
            <div className="w-6 h-6 bg-gray-300 rounded-full" />
            <div className="flex-1 space-y-1">
              <div className="w-full h-1 bg-gray-300 rounded" />
              <div className="w-3/4 h-1 bg-gray-300 rounded" />
            </div>
          </div>
        ))}
      </div>
    ),
    'footer-simple': (
      <div className="w-full h-12 bg-gray-800 rounded-b p-2">
        <div className="flex justify-between items-center h-full">
          <div className="w-12 h-3 bg-gray-600 rounded" />
          <div className="flex gap-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-3 h-3 bg-gray-600 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    ),
    'footer-columns': (
      <div className="w-full h-16 bg-gray-800 rounded-b p-2 flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1 space-y-1">
            <div className="w-full h-2 bg-gray-700 rounded" />
            <div className="w-3/4 h-1 bg-gray-600 rounded" />
            <div className="w-1/2 h-1 bg-gray-600 rounded" />
          </div>
        ))}
      </div>
    ),
    'contact-form': (
      <div className="p-2 space-y-1">
        <div className="w-full h-4 bg-gray-200 rounded" />
        <div className="w-full h-4 bg-gray-200 rounded" />
        <div className="w-full h-8 bg-gray-200 rounded" />
        <div className="w-16 h-4 bg-blue-500 rounded" />
      </div>
    ),
    'team-section': (
      <div className="grid grid-cols-3 gap-1 p-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="aspect-square bg-gray-200 rounded-full" />
            <div className="w-full h-1 bg-gray-300 rounded" />
            <div className="w-3/4 h-1 bg-gray-300 rounded mx-auto" />
          </div>
        ))}
      </div>
    ),
    'cta-simple': (
      <div className="w-full h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded p-3 flex items-center justify-center gap-2">
        <div className="w-24 h-3 bg-white/20 rounded" />
        <div className="w-12 h-4 bg-white rounded" />
      </div>
    ),
    'text': (
      <div className="p-2 space-y-1">
        <div className="w-full h-2 bg-gray-300 rounded" />
        <div className="w-full h-2 bg-gray-300 rounded" />
        <div className="w-3/4 h-2 bg-gray-300 rounded" />
      </div>
    ),
    'default': (
      <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
        <Package size={20} className="text-gray-400" />
      </div>
    )
  };

  return previews[type] || previews.default;
};

const DragHandle = ({ isDragging }: { isDragging: boolean }) => (
  <div
    className={`p-1.5 rounded-md transition-colors ${
      isDragging ? 'bg-blue-100' : 'hover:bg-gray-100'
    } cursor-grab active:cursor-grabbing`}
  >
    <GripVertical
      size={14}
      className={`transition-colors ${isDragging ? 'text-blue-600' : 'text-gray-400'}`}
    />
  </div>
);

const PageNode = ({ data, selected }: NodeProps<PageData>) => {
  const [showPreview, setShowPreview] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleDragStart = () => {
    setIsDragging(true);
    data.onSectionDragStart?.();
  };

  const handleDragEnd = (result: any) => {
    setIsDragging(false);
    data.onSectionDragEnd?.();
    
    if (!result.destination || !data.sections) return;

    const items = Array.from(data.sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    if (data.onSectionsReorder) {
      data.onSectionsReorder(items);
    }
  };

  const sections = data.sections || [];

  return (
    <div
      className={`min-w-[280px] max-w-[320px] bg-white border-2 rounded-lg shadow-lg overflow-hidden transition-all duration-200 ${
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
        
        <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
                          >
                            <DragHandle isDragging={snapshot.isDragging} />
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
                                className={`bg-gray-50 rounded p-2 transition-transform ${
                                  snapshot.isDragging ? 'scale-[0.98]' : ''
                                }`}
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
      
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
        style={{ top: -6 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
        style={{ bottom: -6 }}
      />
    </div>
  );
};

export default memo(PageNode);