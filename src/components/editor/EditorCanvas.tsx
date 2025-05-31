import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  memo,
} from 'react';
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
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Clipboard,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import EnhancedToolbar from './EditorToolbar';

import WireframePageNode from './nodes/WireframePageNode';
import EnhancedPageNode from './nodes/PageNode';

export default function EditorCanvas({ projectId }: { projectId: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedElements, setSelectedElements] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'sitemap' | 'wireframe'>('sitemap');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, getNodes } = useReactFlow();

  const nodeTypes = React.useMemo(() => ({
    page: viewMode === 'sitemap' ? EnhancedPageNode : WireframePageNode,
  }), [viewMode]);

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

      const component = Object.values(componentCategories)
        .flatMap((cat) => cat.components)
        .find((c) => c.id === componentId);
      if (!component) return;

      const newNode = {
        id: nanoid(),
        type: 'page',
        position,
        data: {
          label: component.name,
          url: `/${component.id}`,
          description: `${component.name} section`,
          components: [componentId],
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Add the missing handleFitView function
  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2, includeHiddenNodes: false });
  }, [fitView]);

  const handleExport = useCallback(() => {
    // Export functionality implementation
  }, []);

  const handleDuplicate = useCallback(() => {
    // Duplicate functionality implementation
  }, []);

  const onSelectionChange = useCallback(({ nodes, edges }: any) => {
    setSelectedElements([...nodes, ...edges]);
    if (nodes.length === 1 && !edges.length && nodes[0].type === 'page') {
      setSelectedNode(nodes[0]);
    } else {
      setSelectedNode(null);
    }
  }, []);

  const onNodeClick = useCallback((_: any, node: any) => {
    if (node.type === 'page') {
      setSelectedNode(node);
    } else {
      setSelectedNode(null);
    }
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return (
    <ReactFlowProvider>
      <div className="h-screen flex flex-col bg-gray-100">
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
          onViewModeChange={setViewMode}
          onFitView={handleFitView}
          onExport={handleExport}
          onDuplicate={handleDuplicate}
        />

        <div className="flex flex-1">
          <ComponentLibrary
            onAddComponent={handleAddComponent}
            isOpen={isLibraryOpen}
            onClose={() => setIsLibraryOpen(false)}
          />

          <div
            className="relative flex-1"
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
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              onSelectionChange={onSelectionChange}
              nodeTypes={nodeTypes}
              connectionLineType={ConnectionLineType.SmoothStep}
              fitView
              snapToGrid
              snapGrid={[20, 20]}
              zoomOnScroll
              panOnScroll
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
              attributionPosition="bottom-left"
            >
              <Background
                gap={20}
                size={1}
                color="#d1d5db"
              />
              <Controls showInteractive={false} />
              <MiniMap
                nodeStrokeColor={(n) => {
                  if (n.type === 'page') return '#4f46e5';
                  return '#999';
                }}
                nodeColor={(n) => (n.type === 'page' ? '#a5b4fc' : '#eee')}
              />
            </ReactFlow>
          </div>
        </div>
      </div>
    </ReactFlowProvider>
  );
}