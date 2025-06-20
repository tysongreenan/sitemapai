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
import { Plus, Download, Share, Maximize2, Grid, Layers, ZoomIn, ZoomOut, Link2, FileDown, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import ContentNode, { ContentNodeData } from './nodes/ContentNode';
import { ContentDisplayModal } from '../modals/ContentDisplayModal';
import { useProject } from '../../context/ProjectContext';
import { debounce } from '../../lib/utils';
import { nanoid } from 'nanoid';
import { toast } from 'react-toastify';
import { AppErrorHandler } from '../../lib/errorHandling';

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
  const [modalContent, setModalContent] = useState<{ title: string; content: string } | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  // Add initialization flag to prevent continuous re-loading
  const initializedRef = useRef(false);
  const currentProjectIdRef = useRef<string | null>(null);
  
  const { currentProject, updateProject, connectionStatus, retryConnection } = useProject();

  // Load canvas data from project when component mounts or project changes
  useEffect(() => {
    // Only initialize if:
    // 1. We haven't initialized yet, OR
    // 2. The project ID has changed (user navigated to different project)
    const shouldInitialize = !initializedRef.current || currentProjectIdRef.current !== projectId;
    
    if (shouldInitialize && currentProject?.sitemap_data) {
      console.log('Initializing canvas with project data:', projectId);
      
      const { nodes: savedNodes = [], edges: savedEdges = [] } = currentProject.sitemap_data;
      
      // Convert saved nodes to React Flow format
      const flowNodes = savedNodes.map((node: any) => ({
        id: node.id,
        type: 'contentNode',
        position: { x: node.position?.x || 0, y: node.position?.y || 0 },
        data: {
          title: node.data?.title || 'Untitled',
          content: node.data?.content || '',
          type: node.data?.type || 'text',
          createdAt: node.data?.createdAt ? new Date(node.data.createdAt) : new Date(),
        },
      }));
      
      setNodes(flowNodes);
      setEdges(savedEdges);
      
      // Mark as initialized and store current project ID
      initializedRef.current = true;
      currentProjectIdRef.current = projectId;
    }
  }, [currentProject, projectId, setNodes, setEdges]);

  // Enhanced debounced save function with connection checking
  const debouncedSave = useCallback(
    debounce(
      async (nodes: Node[], edges: Edge[]) => {
        if (!currentProject) return;
        
        // Skip saving if disconnected
        if (connectionStatus === 'disconnected') {
          console.warn('Skipping save - no connection');
          return;
        }
        
        try {
          const sitemapData = {
            nodes: nodes.map(node => ({
              id: node.id,
              type: node.type,
              position: node.position,
              data: node.data,
            })),
            edges: edges.map(edge => ({
              id: edge.id,
              source: edge.source,
              target: edge.target,
              type: edge.type,
            })),
          };

          console.log('Saving canvas data:', { nodeCount: nodes.length, edgeCount: edges.length });
          const success = await updateProject(currentProject.id, { sitemap_data: sitemapData });
          
          if (!success && connectionStatus === 'disconnected') {
            console.warn('Save failed due to connection issues');
          }
        } catch (error) {
          // Check if this is a network error using the public method
          if (AppErrorHandler.isNetworkError(error)) {
            console.warn('Network error during canvas save, connection status will handle UI feedback:', error.message);
          } else {
            console.error('Error saving canvas:', error);
            toast.error('Failed to save canvas changes');
          }
        }
      },
      1000,
      {
        maxWait: 5000,
        onError: (error) => console.error('Save error:', error),
        context: 'ProjectCanvas.save'
      }
    ),
    [currentProject, updateProject, connectionStatus]
  );

  // Save canvas changes when nodes or edges change (but only after initialization)
  useEffect(() => {
    if (initializedRef.current && (nodes.length > 0 || edges.length > 0)) {
      console.log('Canvas state changed, triggering save:', { nodeCount: nodes.length, edgeCount: edges.length });
      debouncedSave(nodes, edges);
    }
  }, [nodes, edges, debouncedSave]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onInit = (instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
  };

  // Handle node content update
  const handleNodeContentUpdate = useCallback((nodeId: string, newContent: string) => {
    setNodes((nds) => 
      nds.map((node) => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, content: newContent } }
          : node
      )
    );
    toast.success('Content updated successfully!');
  }, [setNodes]);

  // Add new item to canvas
  const addItem = useCallback((type: CanvasItem['type'], content: string, title: string) => {
    console.log('Adding new item to canvas:', { type, title });
    
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
        onViewFull: (title: string, content: string) => {
          setModalContent({ title, content });
        },
        onDelete: (nodeId: string) => {
          setNodes((nds) => nds.filter(n => n.id !== nodeId));
        },
        onContentUpdate: handleNodeContentUpdate,
      },
    };
    
    setNodes((nds) => {
      const newNodes = [...nds, newNode];
      console.log('Canvas nodes updated:', { oldCount: nds.length, newCount: newNodes.length });
      return newNodes;
    });
    
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
    toast.success('Content added to canvas');
  }, [setNodes, onItemSelect, handleNodeContentUpdate]);

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

  // Share functionality
  const handleShare = useCallback(() => {
    const shareUrl = `${window.location.origin}/editor/${projectId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Project link copied to clipboard!');
  }, [projectId]);

  // Export functionality
  const handleExport = useCallback(() => {
    if (!reactFlowInstance) return;

    // Export as JSON
    const exportData = {
      project: {
        id: projectId,
        title: currentProject?.title,
        description: currentProject?.description,
        created_at: currentProject?.created_at,
      },
      canvas: {
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: node.data,
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
        })),
      },
      content: nodes.map(node => ({
        title: node.data.title,
        type: node.data.type,
        content: node.data.content,
        createdAt: node.data.createdAt,
      })),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentProject?.title || 'project'}-export.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Project exported successfully!');
  }, [reactFlowInstance, projectId, currentProject, nodes, edges]);

  // Expose addItem function globally
  useEffect(() => {
    (window as any).addCanvasItem = addItem;
    return () => {
      delete (window as any).addCanvasItem;
    };
  }, [addItem]);

  // Update node selection state and pass callbacks
  const updatedNodes = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      selected: selectedItem?.id === node.id,
      onViewFull: (title: string, content: string) => {
        setModalContent({ title, content });
      },
      onDelete: (nodeId: string) => {
        setNodes((nds) => nds.filter(n => n.id !== nodeId));
        if (selectedItem?.id === nodeId) {
          onItemSelect?.(null);
        }
        toast.success('Content removed from canvas');
      },
      onContentUpdate: handleNodeContentUpdate,
    }
  }));

  // Connection status indicator
  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi size={16} className="text-green-600" />;
      case 'disconnected':
        return <WifiOff size={16} className="text-red-600" />;
      case 'checking':
        return <RefreshCw size={16} className="text-yellow-600 animate-spin" />;
      default:
        return <WifiOff size={16} className="text-gray-400" />;
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      case 'checking':
        return 'Connecting...';
      default:
        return 'Unknown';
    }
  };

  return (
    <>
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

          {/* Connection Status and Action Buttons */}
          <Panel position="top-right" className="flex items-center gap-2">
            {/* Connection Status */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-2 flex items-center gap-2">
              <div className="flex items-center gap-2 px-2">
                {getConnectionIcon()}
                <span className="text-sm font-medium">{getConnectionText()}</span>
                {connectionStatus === 'disconnected' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={retryConnection}
                    className="p-1"
                    title="Retry connection"
                  >
                    <RefreshCw size={14} />
                  </Button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-2 flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                leftIcon={<Link2 size={16} />}
                onClick={handleShare}
                title="Copy shareable link"
                disabled={connectionStatus === 'disconnected'}
              >
                Share
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                leftIcon={<FileDown size={16} />}
                onClick={handleExport}
                title="Export project data"
              >
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
                    onClick={() => addItem('text', 'This is a sample blog post about AI marketing trends and how they are shaping the future of digital marketing. It includes insights on personalization, automation, and data-driven strategies that modern marketers are using to engage their audiences more effectively.', 'Sample Blog Post')}
                  >
                    Add Sample Text
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addItem('image', 'AI-generated marketing image concept featuring modern design elements, vibrant colors, and compelling visual storytelling that captures audience attention.', 'Marketing Visual')}
                  >
                    Add Sample Image
                  </Button>
                </div>
              </div>
            </Panel>
          )}

          {/* Connection Warning Overlay */}
          {connectionStatus === 'disconnected' && (
            <Panel position="bottom-center" className="pointer-events-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-md">
                <div className="flex items-center gap-3">
                  <WifiOff size={20} className="text-red-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">Connection Lost</p>
                    <p className="text-xs text-red-600">Changes may not be saved automatically</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={retryConnection}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>

      {/* Content Display Modal */}
      <ContentDisplayModal
        isOpen={!!modalContent}
        onClose={() => setModalContent(null)}
        title={modalContent?.title || ''}
        content={modalContent?.content || ''}
      />
    </>
  );
};

export function ProjectCanvas(props: ProjectCanvasProps) {
  return (
    <ReactFlowProvider>
      <ProjectCanvasInner {...props} />
    </ReactFlowProvider>
  );
}