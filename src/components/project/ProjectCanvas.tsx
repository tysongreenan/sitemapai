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
  ReactFlowInstance,
  NodeChange,
  EdgeChange
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus, Download, Share, Maximize2, Grid, Layers, ZoomIn, ZoomOut, Link2, FileDown, Wifi, WifiOff, RefreshCw, Settings, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import ContentNode, { ContentNodeData } from './nodes/ContentNode';
import { AddContentMenu } from './AddContentMenu';
import { AIContextSettingsDropdown, AIContextSettings } from './AIContextSettings';
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
  onSendTextToChat?: (text: string) => void;
  aiSettings: AIContextSettings;
  onAISettingsChange: (settings: AIContextSettings) => void;
}

const ProjectCanvasInner = ({ 
  projectId, 
  onItemSelect, 
  selectedItem, 
  onSendTextToChat,
  aiSettings,
  onAISettingsChange
}: ProjectCanvasProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [aiContextOpen, setAiContextOpen] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  // Add initialization flag to prevent continuous re-loading
  const initializedRef = useRef(false);
  const currentProjectIdRef = useRef<string | null>(null);
  
  const { currentProject, updateProject, connectionStatus, retryConnection } = useProject();

  // Get React Flow instance for focus functionality
  const reactFlow = useReactFlow();

  // Handle double-click to focus on node - FIXED: Zoom to top of content node
  const handleNodeDoubleClick = useCallback((nodeId: string) => {
    if (!reactFlow) return;

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Calculate the center position for the TOP of the node
    const x = node.position.x + (node.width || 400) / 2;
    const y = node.position.y; // Use just the y position (top of node) instead of adding half height

    // Zoom to 1.5x and center on the top of the node
    reactFlow.setCenter(x, y, { zoom: 1.5, duration: 800 });
    
    toast.success('Focused on content node');
  }, [reactFlow, nodes]);

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
          subType: node.data?.subType,
          metadata: node.data?.metadata || {},
          createdAt: node.data?.createdAt ? new Date(node.data.createdAt) : new Date(),
          onSendTextToChat,
          onNodeDoubleClick: handleNodeDoubleClick,
        },
      }));
      
      setNodes(flowNodes);
      setEdges(savedEdges);
      
      // Mark as initialized and store current project ID
      initializedRef.current = true;
      currentProjectIdRef.current = projectId;
    }
  }, [currentProject, projectId, setNodes, setEdges, onSendTextToChat, handleNodeDoubleClick]);

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

  // Handle nodes change with selective saving
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);
    
    // Only save after meaningful changes (position changes when dragging is complete)
    const shouldSave = changes.some(change => {
      if (change.type === 'position' && change.dragging === false) {
        console.log('Node position change completed, triggering save');
        return true;
      }
      if (change.type === 'dimensions' && change.resizing === false) {
        console.log('Node resize completed, triggering save');
        return true;
      }
      return false;
    });

    if (shouldSave && initializedRef.current) {
      // Use current state after the change
      setTimeout(() => {
        debouncedSave(nodes, edges);
      }, 0);
    }
  }, [onNodesChange, debouncedSave, nodes, edges]);

  // Handle edges change with selective saving
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    onEdgesChange(changes);
    
    // Only save when edges are removed
    const shouldSave = changes.some(change => {
      if (change.type === 'remove') {
        console.log('Edge removed, triggering save');
        return true;
      }
      return false;
    });

    if (shouldSave && initializedRef.current) {
      // Use current state after the change
      setTimeout(() => {
        debouncedSave(nodes, edges);
      }, 0);
    }
  }, [onEdgesChange, debouncedSave, nodes, edges]);

  // Handle new connections with immediate save
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
      
      if (initializedRef.current) {
        console.log('New edge connection created, triggering save');
        debouncedSave(nodes, newEdges);
      }
    },
    [setEdges, edges, debouncedSave, nodes]
  );

  const onInit = (instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
  };

  // Handle node content update with immediate save and detailed logging
  const handleNodeContentUpdate = useCallback((nodeId: string, newContent: string) => {
    console.log('🟢 handleNodeContentUpdate called');
    console.log('🟢 nodeId:', nodeId);
    console.log('🟢 newContent received:', newContent);
    console.log('🟢 Current nodes array before update:', nodes.map(n => ({ id: n.id, content: n.data.content })));
    
    const updatedNodes = nodes.map((node) => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, content: newContent } }
        : node
    );
    
    console.log('🟢 Updated nodes array after local update:', updatedNodes.map(n => ({ id: n.id, content: n.data.content })));
    
    setNodes(updatedNodes);
    
    if (initializedRef.current) {
      console.log('🟢 Triggering debounced save with updated nodes');
      debouncedSave(updatedNodes, edges);
    }
    
    toast.success('Content updated successfully!');
  }, [setNodes, nodes, edges, debouncedSave]);

  // Handle node metadata update with immediate save
  const handleNodeMetadataUpdate = useCallback((nodeId: string, metadata: any) => {
    const updatedNodes = nodes.map((node) => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, metadata } }
        : node
    );
    
    setNodes(updatedNodes);
    
    if (initializedRef.current) {
      console.log('Node metadata updated, triggering save');
      debouncedSave(updatedNodes, edges);
    }
    
    toast.success('Settings updated successfully!');
  }, [setNodes, nodes, edges, debouncedSave]);

  // Handle node deletion with immediate save
  const handleDeleteNode = useCallback((nodeId: string) => {
    const updatedNodes = nodes.filter(n => n.id !== nodeId);
    setNodes(updatedNodes);
    
    if (selectedItem?.id === nodeId) {
      onItemSelect?.(null);
    }
    
    if (initializedRef.current) {
      console.log('Node deleted, triggering save');
      debouncedSave(updatedNodes, edges);
    }
    
    toast.success('Content removed from canvas');
  }, [nodes, setNodes, selectedItem, onItemSelect, edges, debouncedSave]);

  // Add new item to canvas with immediate save
  const addItem = useCallback((type: string, subType?: string, metadata?: any) => {
    console.log('Adding new item to canvas:', { type, subType, metadata });
    
    const title = metadata?.title || `New ${type}`;
    
    const newNode: Node<ContentNodeData> = {
      id: nanoid(),
      type: 'contentNode',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      data: {
        title,
        content: type === 'text' ? '' : '',
        type: type as any,
        subType: subType as any,
        metadata: metadata || {},
        createdAt: new Date(),
        onDelete: handleDeleteNode,
        onContentUpdate: handleNodeContentUpdate,
        onMetadataUpdate: handleNodeMetadataUpdate,
        onSendTextToChat,
        onNodeDoubleClick: handleNodeDoubleClick,
      },
    };
    
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    
    if (initializedRef.current) {
      console.log('New item added to canvas, triggering save');
      debouncedSave(updatedNodes, edges);
    }
    
    // Convert to CanvasItem for callback
    const canvasItem: CanvasItem = {
      id: newNode.id,
      type: type as any,
      title,
      content: '',
      x: newNode.position.x,
      y: newNode.position.y,
      width: 320,
      height: 200,
      createdAt: new Date(),
    };
    
    onItemSelect?.(canvasItem);
    toast.success(`${title} added to canvas`);
  }, [setNodes, nodes, edges, onItemSelect, handleNodeContentUpdate, handleNodeMetadataUpdate, handleDeleteNode, onSendTextToChat, handleNodeDoubleClick, debouncedSave]);

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
      onDelete: handleDeleteNode,
      onContentUpdate: handleNodeContentUpdate,
      onMetadataUpdate: handleNodeMetadataUpdate,
      onSendTextToChat,
      onNodeDoubleClick: handleNodeDoubleClick,
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
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
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
          // FIXED: Enable vertical panning with mouse wheel
          zoomOnScroll={false}
          zoomOnPinch={true}
          panOnScroll={true}
          panOnScrollMode="vertical"
          panOnScrollSpeed={0.5}
          preventScrolling={true}
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
                  case 'video': return '#8b5cf6';
                  case 'website': return '#6366f1';
                  case 'youtube': return '#ef4444';
                  case 'social_ad': return '#f59e0b';
                  case 'analytics': return '#f97316';
                  case 'action': return '#059669';
                  default: return '#6b7280';
                }
              }}
            />
          )}

          {/* Custom Toolbar */}
          <Panel position="top-left" className="flex items-center gap-2">
            <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-2 flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddMenu(true)}
                leftIcon={<Plus size={16} />}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Add Content
              </Button>
              
              <div className="w-px h-6 bg-gray-300" />
              
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

            {/* AI Context Settings */}
            <AIContextSettingsDropdown
              projectId={projectId}
              currentSettings={aiSettings}
              onSettingsChange={onAISettingsChange}
              isOpen={aiContextOpen}
              onToggle={() => setAiContextOpen(!aiContextOpen)}
            />

            {/* Visual Indicator of Active Context */}
            {(aiSettings.brandVoiceId || aiSettings.audienceId || aiSettings.knowledgeIds.length > 0) && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm">
                <Sparkles size={14} className="text-indigo-500" />
                <span className="text-xs text-gray-600">AI Context Active</span>
              </div>
            )}
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
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus size={24} className="text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Build Your Customer Journey</h3>
                <p className="text-gray-600 mb-4">
                  Add touchpoints, content, and analytics to visualize your marketing funnel
                </p>
                <div className="flex flex-wrap gap-2 justify-center pointer-events-auto">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setShowAddMenu(true)}
                    leftIcon={<Plus size={16} />}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    Add Content
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

      {/* Add Content Menu Modal */}
      <AddContentMenu
        isOpen={showAddMenu}
        onClose={() => setShowAddMenu(false)}
        onAddContent={addItem}
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