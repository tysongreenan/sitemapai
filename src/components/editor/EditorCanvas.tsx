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
import EditorToolbar from './EditorToolbar';
import ComponentLibrary from './ComponentLibrary';
import WireframePageNode from './nodes/WireframePageNode';
import EnhancedPageNode from './nodes/PageNode';
import ContextMenu from './ContextMenu';

export default function EditorCanvas({ projectId }: { projectId: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedElements, setSelectedElements] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'sitemap' | 'wireframe'>('sitemap');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; items: { label: string; action: () => void; icon?: React.ReactNode }[] } | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, getNodes, screenToFlowPosition } = useReactFlow();

  const nodeTypes = React.useMemo(() => ({
    page: viewMode === 'sitemap' ? EnhancedPageNode : WireframePageNode,
  }), [viewMode]);

  // ───────────────────────────────────────────────────────────────
  // Fit view handler: Centers and zooms out to show all nodes
  // ───────────────────────────────────────────────────────────────
  const handleFitView = useCallback(() => {
    const allNodes = getNodes();
    if (allNodes.length === 0) return;
    const bounds = getRectOfNodes(allNodes);
    getTransformForBounds(bounds, reactFlowWrapper.current!.offsetWidth, reactFlowWrapper.current!.offsetHeight, 0.5, 2);
    fitView({ duration: 800 });
  }, [fitView, getNodes]);

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

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  // ───────────────────────────────────────────────────────────────
  // onConnect: Link nodes
  // ───────────────────────────────────────────────────────────────
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

  // ───────────────────────────────────────────────────────────────
  // handleAddComponent: Adds a component to the selected node's data
  // ───────────────────────────────────────────────────────────────
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
            return { ...node, data: { ...node.data, components: [...existing, componentId] } };
          }
          return node;
        })
      );
      toast.success('Component added');
    },
    [selectedNode, setNodes]
  );

  // ───────────────────────────────────────────────────────────────
  // handleAddPageNode: Adds a new default page node to the canvas
  // ───────────────────────────────────────────────────────────────
  const addPageNode = useCallback((position?: { x: number; y: number }) => {
    const defaultPosition = position || { x: 50, y: 50 };
    const newNode = {
      id: nanoid(),
      type: 'page',
      position: defaultPosition,
      data: {
        label: 'New Page',
        url: '/new-page',
        description: 'A newly added page',
        components: [],
      },
    };
    setNodes((nds) => nds.concat(newNode));
    toast.success('New page added!');
  }, [setNodes]);

  // ───────────────────────────────────────────────────────────────
  // Context Menu Handler
  // ───────────────────────────────────────────────────────────────
  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();

      const pane = reactFlowWrapper.current?.getBoundingClientRect();
      if (!pane) return;

      const x = event.clientX - pane.left;
      const y = event.clientY - pane.top;

      const flowPosition = screenToFlowPosition({ x, y });

      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        items: [
          {
            label: 'Add New Page',
            action: () => addPageNode(flowPosition),
            icon: <Plus size={16} />,
          },
          {
            label: 'Fit View',
            action: handleFitView,
            icon: <Maximize2 size={16} />,
          },
        ],
      });
    },
    [addPageNode, handleFitView, screenToFlowPosition]
  );

  const onContextMenuClose = useCallback(() => {
    setContextMenu(null);
  }, []);

  // ───────────────────────────────────────────────────────────────
  // Export: Download nodes & edges as JSON
  // ───────────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
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
  }, [nodes, edges]);

  // ───────────────────────────────────────────────────────────────
  // Duplicate placeholder
  // ───────────────────────────────────────────────────────────────
  const handleDuplicate = useCallback(() => {
    toast.info('Duplicate feature coming soon');
  }, []);

  // ───────────────────────────────────────────────────────────────
  // Initialize with sample data
  // ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (nodes.length === 0) {
      const initialNodes = [
        {
          id: '1',
          type: 'page',
          position: { x: 300, y: 100 },
          data: { label: 'Home', url: '/', description: 'Welcome page', components: ['navbar', 'hero-centered', 'footer-simple'] },
        },
        {
          id: '2',
          type: 'page',
          position: { x: 100, y: 300 },
          data: { label: 'About', url: '/about', description: 'About us', components: ['navbar', 'text-block', 'footer-simple'] },
        },
        {
          id: '3',
          type: 'page',
          position: { x: 500, y: 300 },
          data: { label: 'Services', url: '/services', description: 'Our services', components: ['navbar', 'feature-grid', 'footer-simple'] },
        },
      ];
      const initialEdges = [
        { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true },
        { id: 'e1-3', source: '1', target: '3', type: 'smoothstep', animated: true },
      ];
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [nodes.length, setNodes, setEdges]);

  // ───────────────────────────────────────────────────────────────
  // Selection handlers: track multi-select & node selection
  // ───────────────────────────────────────────────────────────────
  const onSelectionChange = useCallback(({ nodes, edges }: any) => {
    setSelectedElements([...nodes, ...edges]);
    if (nodes.length === 1 && !edges.length) setSelectedNode(nodes[0]);
    else setSelectedNode(null);
  }, []);

  const onNodeClick = useCallback((_: any, node: any) => {
    setSelectedNode(node);
    onContextMenuClose();
  }, [onContextMenuClose]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    onContextMenuClose();
  }, [onContextMenuClose]);

  // Keyboard shortcuts: Delete selected nodes/edges
  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Delete' && selectedElements.length > 0) {
      const selectedIds = selectedElements.map((el) => el.id);
      setNodes((nds) => nds.filter((n) => !selectedIds.includes(n.id)));
      setEdges((eds) => eds.filter((ed) => !selectedIds.includes(ed.id)));
      setSelectedElements([]);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedElements.length > 0) {
      navigator.clipboard.writeText(JSON.stringify(selectedElements));
      toast.info('Copied to clipboard');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      const text = localStorage.getItem('clipboard');
      if (text) {
        try {
          const pasted = JSON.parse(text);
          pasted.forEach((item: any) => {
            const newId = nanoid();
            const cloned = { ...item, id: newId, position: { x: item.position.x + 20, y: item.position.y + 20 } };
            if (cloned.source) {
              const newSource = pasted.find((n: any) => n.id === cloned.source);
              const newTarget = pasted.find((n: any) => n.id === cloned.target);
              if (newSource && newTarget) cloned.source = newSource.id;
              cloned.target = newTarget.id;
              setEdges((eds) => eds.concat(cloned));
            } else {
              setNodes((nds) => nds.concat(cloned));
            }
          });
          toast.success('Pasted elements');
        } catch {
          toast.error('Nothing to paste');
        }
      }
    }
  }, [selectedElements, setNodes, setEdges]);

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  // Save to localStorage on every change
  useEffect(() => {
    localStorage.setItem('sitemap-data', JSON.stringify({ nodes, edges }));
  }, [nodes, edges]);

  // ───────────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────────
  return (
    <ReactFlowProvider>
      <div className="h-screen flex flex-col bg-gray-100">
        <EditorToolbar
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
              onPaneContextMenu={onPaneContextMenu}
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
            {contextMenu && (
              <ContextMenu
                x={contextMenu.x}
                y={contextMenu.y}
                items={contextMenu.items}
                onClose={onContextMenuClose}
              />
            )}
          </div>
        </div>
      </div>
    </ReactFlowProvider>
  );
}