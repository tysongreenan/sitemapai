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
import { EnhancedToolbar } from './EditorToolbar'; // Added import for EnhancedToolbar

// Import your new wireframe node
import WireframePageNode from './nodes/WireframePageNode';
import EnhancedPageNode from './nodes/PageNode';

// ... (componentCategories, ComponentPreview remain the same) ...

// -----------------------------------------------------------------------------
// 3) EnhancedPageNode (Professional Styling)
// -----------------------------------------------------------------------------
// This section should remain as is in your existing file.
// We are now importing it and will use it conditionally.

// -----------------------------------------------------------------------------
// 4) ComponentLibrary (Enhanced Sidebar with Categories & Snapping Info)
// -----------------------------------------------------------------------------
// This section remains unchanged.

// -----------------------------------------------------------------------------
// 5) EnhancedToolbar (Professional Actions & Keyboard Shortcuts)
// ----------------------------------------------------------------------------
// This section remains unchanged.

// -----------------------------------------------------------------------------
// 6) EditorCanvas (MAIN COMPONENT) with Snap-to-Grid, Multi-Select, & Layers
// -----------------------------------------------------------------------------
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

  // Custom node types based on viewMode
  const nodeTypes = React.useMemo(() => ({
    page: viewMode === 'sitemap' ? EnhancedPageNode : WireframePageNode,
  }), [viewMode]);

  // ───────────────────────────────────────────────────────────────
  // onDrop / onDragOver: Add a new page-node by dragging a component
  // ───────────────────────────────────────────────────────────────
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

  // ... (onDragOver, onConnect, handleAddComponent, handleFitView, handleExport, handleDuplicate remain the same) ...

  // ───────────────────────────────────────────────────────────────
  // Selection handlers: track multi-select & node selection
  // ───────────────────────────────────────────────────────────────
  const onSelectionChange = useCallback(({ nodes, edges }: any) => {
    setSelectedElements([...nodes, ...edges]);
    // Only select a node if it's a 'page' type, to ensure PropertiesPanel works as expected
    // This assumes that only 'page' nodes will have properties editable via the panel
    if (nodes.length === 1 && !edges.length && nodes[0].type === 'page') {
      setSelectedNode(nodes[0]);
    } else {
      setSelectedNode(null);
    }
  }, []);

  const onNodeClick = useCallback((_: any, node: any) => {
    // Similar check for node type before setting selectedNode
    if (node.type === 'page') {
      setSelectedNode(node);
    } else {
      setSelectedNode(null);
    }
  }, []);
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // ... (onKeyDown, useEffect for localStorage remain the same) ...

  // ───────────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────────
  return (
    <ReactFlowProvider>
      <div className="h-screen flex flex-col bg-gray-100">
        {/* Toolbar */}
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
          {/* Component Library Sidebar */}
          <ComponentLibrary
            onAddComponent={handleAddComponent}
            isOpen={isLibraryOpen}
            onClose={() => setIsLibraryOpen(false)}
          />

          {/* Canvas Area */}
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
              {/* Background grid for alignment */}
              <Background
                gap={20}
                size={1}
                color="#d1d5db"
              />
              {/* Zoom + Pan Controls */}
              <Controls showInteractive={false} />
              {/* MiniMap for navigation */}
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