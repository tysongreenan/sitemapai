import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  MarkerType,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  NodeProps,
  ConnectionLineType,
  getRectOfNodes,
  getTransformForBounds,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toast } from 'react-toastify';
import { nanoid } from 'nanoid';
import {
  Plus,
  PanelRight,
  Search,
  Layout,
  FileText,
  Copy,
  Download,
  Grid,
  Package,
  Sparkles,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  ArrowRight,
  MessageCircle,
  BarChart,
  Zap,
  Mail,
  User,
  CreditCard,
  LogIn,
  UserPlus,
  RefreshCw,
  Share2,
  Save,
  Layers,
  Clipboard,
  Trash2,
  Home,
} from 'lucide-react';

import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import EnhancedToolbar from './EditorToolbar';
import ComponentLibrary from './ComponentLibrary';
import PageNode from './nodes/PageNode';
import SectionNode from './nodes/SectionNode';
import WireframePageNode from './nodes/WireframePageNode';
import ContextMenu from './ContextMenu';

interface EditorCanvasProps {
  projectId: string;
}

export default function EditorCanvas({ projectId }: EditorCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedElements, setSelectedElements] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [isComponentLibraryOpen, setIsComponentLibraryOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'sitemap' | 'wireframe'>('sitemap');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string;
  } | null>(null);
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, getNodes, getNode } = useReactFlow();

  // Handle adding a section to a page
  const handleAddSection = useCallback((pageId: string) => {
    setIsComponentLibraryOpen(true);
    setSelectedNode(getNode(pageId));
    toast.info('Select a component from the library');
  }, [getNode]);

  // Handle generating content for a page
  const handleGenerateContent = useCallback((pageId: string) => {
    toast.info('AI content generation coming soon!');
  }, []);

  // Node types configuration
  const nodeTypes = {
    page: PageNode,
    section: SectionNode,
    wireframePage: WireframePageNode,
  };

  // Handle node context menu
  const handleShowNodeContextMenu = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setContextMenu({ nodeId, ...position });
  }, []);

  // Handle adding components via drag & drop
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const componentId = event.dataTransfer.getData('componentId');
      if (!componentId || !reactFlowWrapper.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = (window as any).reactFlowInstance.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const newNode = {
        id: nanoid(),
        type: 'section',
        position,
        data: {
          label: componentId,
          onShowNodeContextMenu: handleShowNodeContextMenu,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, handleShowNodeContextMenu]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle node connections
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#4f46e5', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#4f46e5' },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  // Handle component addition
  const handleAddComponent = useCallback(
    (componentId: string) => {
      if (!selectedNode) {
        toast.info('Select a page node first');
        return;
      }

      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === selectedNode.id) {
            const existing = node.data.components || [];
            return {
              ...node,
              data: { ...node.data, components: [...existing, componentId] },
            };
          }
          return node;
        })
      );
      toast.success('Component added');
    },
    [selectedNode, setNodes]
  );

  // Handle view mode change
  const handleViewModeChange = useCallback((mode: 'sitemap' | 'wireframe') => {
    setViewMode(mode);
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        type: mode === 'wireframe' && node.type === 'page' ? 'wireframePage' : node.type,
      }))
    );
  }, [setNodes]);

  // Initialize with sample nodes
  useEffect(() => {
    if (nodes.length === 0) {
      const initialNodes = [
        {
          id: '1',
          type: 'page',
          position: { x: 300, y: 100 },
          data: {
            label: 'Home',
            url: '/',
            description: 'Welcome page',
            components: ['navbar', 'hero-centered', 'footer-simple'],
            onShowNodeContextMenu: handleShowNodeContextMenu,
            onAddSection: handleAddSection,
            onGenerateContent: handleGenerateContent,
            isHomePage: true,
          },
        },
        {
          id: '2',
          type: 'page',
          position: { x: 100, y: 300 },
          data: {
            label: 'About',
            url: '/about',
            description: 'About us',
            components: ['navbar', 'text-block', 'footer-simple'],
            onShowNodeContextMenu: handleShowNodeContextMenu,
            onAddSection: handleAddSection,
            onGenerateContent: handleGenerateContent,
          },
        },
        {
          id: '3',
          type: 'page',
          position: { x: 500, y: 300 },
          data: {
            label: 'Services',
            url: '/services',
            description: 'Our services',
            components: ['navbar', 'feature-grid', 'footer-simple'],
            onShowNodeContextMenu: handleShowNodeContextMenu,
            onAddSection: handleAddSection,
            onGenerateContent: handleGenerateContent,
          },
        },
      ];

      const initialEdges = [
        {
          id: 'e1-2',
          source: '1',
          target: '2',
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#4f46e5', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#4f46e5' },
        },
        {
          id: 'e1-3',
          source: '1',
          target: '3',
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#4f46e5', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#4f46e5' },
        },
      ];

      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [setNodes, setEdges, handleShowNodeContextMenu, handleAddSection, handleGenerateContent]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <EnhancedToolbar
        projectTitle="Professional Sitemap Editor"
        onSave={() => {
          setSaveStatus('saving');
          setTimeout(() => {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
          }, 1000);
        }}
        saveStatus={saveStatus}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onFitView={() => fitView()}
        onExport={() => {
          const data = { nodes, edges };
          const json = JSON.stringify(data, null, 2);
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `sitemap-${Date.now()}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }}
        onDuplicate={() => toast.info('Duplicate feature coming soon')}
      />

      <div className="flex flex-1">
        <ComponentLibrary
          isOpen={isComponentLibraryOpen}
          onClose={() => setIsComponentLibraryOpen(false)}
          onAddComponent={handleAddComponent}
        />

        <div
          className="flex-1 h-full"
          ref={reactFlowWrapper}
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            connectionLineType={ConnectionLineType.SmoothStep}
            snapToGrid
            snapGrid={[20, 20]}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          >
            <Background gap={20} size={1} color="#e5e7eb" />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                switch (node.type) {
                  case 'page':
                    return '#4f46e5';
                  case 'section':
                    return '#ec4899';
                  default:
                    return '#9ca3af';
                }
              }}
            />
          </ReactFlow>
        </div>

        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            items={[
              {
                label: 'Add Child Page',
                action: () => {
                  // Implementation
                  setContextMenu(null);
                },
                icon: <Plus size={16} />,
              },
              {
                label: 'Delete',
                action: () => {
                  // Implementation
                  setContextMenu(null);
                },
                icon: <Trash2 size={16} />,
              },
              {
                label: 'Set as Home',
                action: () => {
                  // Implementation
                  setContextMenu(null);
                },
                icon: <Home size={16} />,
              },
            ]}
            onClose={() => setContextMenu(null)}
          />
        )}
      </div>
    </div>
  );
}