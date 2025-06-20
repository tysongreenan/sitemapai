import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  Connection,
  ReactFlowProvider,
  Panel,
  MiniMap,
  useReactFlow,
  ReactFlowInstance
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus, Download, Share, Maximize2, Grid, Layers, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '../ui/Button';
import ContentNode, { ContentNodeData } from './nodes/ContentNode';
import { nanoid } from 'nanoid';

// Define node types
const nodeTypes = {
  contentNode: ContentNode,
};

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

const ProjectCanvasInner = ({ projectId, onItemSelect, selectedItem }: ProjectCanvasProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onInit = (instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
  };

  // Add new item to canvas
  const addItem = useCallback((type: CanvasItem['type'], content: string, title: string) => {
    const newNode: Node<ContentNodeData> = {
      id: nanoid(),
      type: 'contentNode',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      data: {
        title,
        content,
        type,
        createdAt: new Date(),
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
    
    // Convert to CanvasItem for callback
    const canvasItem: CanvasItem = {
      id: newNode.id,
      type,
      title,
      content,
      x: newNode.position.x,
      y: newNode.position.y,
      width: 320,
      height: 200,
      createdAt: new Date(),
    };
    
    onItemSelect?.(canvasItem);
  }, [setNodes, onItemSelect]);

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node<ContentNodeData>) => {
    const canvasItem: CanvasItem = {
      id: node.id,
      type: node.data.type,
      title: node.data.title,
      content: node.data.content,
      x: node.position.x,
      y: node.position.y,
      width: 320,
      height: 200,
      createdAt: node.data.createdAt,
    };
    onItemSelect?.(canvasItem);
  }, [onItemSelect]);

  // Handle canvas click (deselect)
  const onPaneClick = useCallback(() => {
    onItemSelect?.(null);
  }, [onItemSelect]);

  // Fit view to content
  const fitView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2 });
    }
  }, [reactFlowInstance]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomIn();
    }
  }, [reactFlowInstance]);

  const zoomOut = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomOut();
    }
  }, [reactFlowInstance]);

  // Expose addItem function globally
  useEffect(() => {
    (window as any).addCanvasItem = addItem;
    return () => {
      delete (window as any).addCanvasItem;
    };
  }, [addItem]);

  // Update node selection state
  const updatedNodes = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      selected: selectedItem?.id === node.id
    }
  }));

  return (
    <div className="flex-1 flex flex-col bg-gray-50 relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={updatedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-gray-50"
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.1}
        maxZoom={2}
        snapToGrid={true}
        snapGrid={[20, 20]}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1} 
          color="#e5e7eb"
        />
        
        <Controls 
          position="bottom-right"
          className="!bg-white !border !border-gray-200 !rounded-lg !shadow-lg"
        />
        
        {showMiniMap && (
          <MiniMap 
            position="bottom-left"
            className="!bg-white !border !border-gray-200 !rounded-lg !shadow-lg"
            nodeColor={(node) => {
              switch (node.data?.type) {
                case 'text': return '#3b82f6';
                case 'image': return '#10b981';
                case 'chart': return '#8b5cf6';
                case 'video': return '#f59e0b';
                default: return '#6b7280';
              }
            }}
          />
        )}

        {/* Custom Toolbar */}
        <Panel position="top-left" className="flex items-center gap-2">
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-2 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomOut}
              className="p-2"
              title="Zoom out"
            >
              <ZoomOut size={16} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomIn}
              className="p-2"
              title="Zoom in"
            >
              <ZoomIn size={16} />
            </Button>
            
            <div className="w-px h-6 bg-gray-300" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={fitView}
              className="p-2"
              title="Fit to view"
            >
              <Maximize2 size={16} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMiniMap(!showMiniMap)}
              className={`p-2 ${showMiniMap ? 'bg-indigo-100 text-indigo-600' : ''}`}
              title="Toggle minimap"
            >
              <Layers size={16} />
            </Button>
          </div>
        </Panel>

        {/* Action Buttons */}
        <Panel position="top-right" className="flex items-center gap-2">
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-2 flex items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={<Share size={16} />}>
              Share
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Download size={16} />}>
              Export
            </Button>
          </div>
        </Panel>

        {/* Empty State */}
        {nodes.length === 0 && (
          <Panel position="top-center" className="pointer-events-none">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center max-w-md">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your canvas is empty</h3>
              <p className="text-gray-600 mb-4">
                Start chatting with AI to generate content that will appear here
              </p>
              <div className="flex flex-wrap gap-2 justify-center pointer-events-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addItem('text', 'This is a sample blog post about AI marketing trends and how they are shaping the future of digital marketing...', 'Sample Blog Post')}
                >
                  Add Sample Text
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addItem('image', 'AI-generated marketing image concept', 'Marketing Visual')}
                >
                  Add Sample Image
                </Button>
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};

export function ProjectCanvas(props: ProjectCanvasProps) {
  return (
    <ReactFlowProvider>
      <ProjectCanvasInner {...props} />
    </ReactFlowProvider>
  );
}