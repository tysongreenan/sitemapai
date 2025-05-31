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

// -----------------------------------------------------------------------------
// 1) Component Categories Definition (Expanded for Professional Use)
// -----------------------------------------------------------------------------
const componentCategories = {
  navigation: {
    name: 'Navigation',
    icon: <Menu size={16} />, // Category icon
    components: [
      { id: 'navbar', name: 'Navigation Bar', icon: <Menu size={14} />, category: 'navigation', preview: 'navbar' },
      { id: 'sidebar', name: 'Sidebar Menu', icon: <PanelRight size={14} />, category: 'navigation', preview: 'sidebar' },
      { id: 'breadcrumb', name: 'Breadcrumb', icon: <ChevronRight size={14} />, category: 'navigation', preview: 'breadcrumb' },
      { id: 'tabs', name: 'Tab Navigation', icon: <Layout size={14} />, category: 'navigation', preview: 'tabs' },
    ],
  },
  hero: {
    name: 'Hero Sections',
    icon: <Sparkles size={16} />,
    components: [
      { id: 'hero-centered', name: 'Hero Centered', icon: <Layout size={14} />, category: 'hero', preview: 'hero-centered' },
      { id: 'hero-split', name: 'Hero Split', icon: <Grid size={14} />, category: 'hero', preview: 'hero-split' },
      { id: 'hero-video', name: 'Hero with Video', icon: <FileText size={14} />, category: 'hero', preview: 'hero-video' },
      { id: 'hero-form', name: 'Hero with Form', icon: <Mail size={14} />, category: 'hero', preview: 'hero-form' },
    ],
  },
  content: {
    name: 'Content Blocks',
    icon: <FileText size={16} />,
    components: [
      { id: 'text-block', name: 'Text Block', icon: <FileText size={14} />, category: 'content', preview: 'text' },
      { id: 'feature-grid', name: 'Feature Grid', icon: <Grid size={14} />, category: 'content', preview: 'features' },
      { id: 'testimonials', name: 'Testimonials', icon: <MessageCircle size={14} />, category: 'content', preview: 'testimonials' },
      { id: 'team-section', name: 'Team Section', icon: <User size={14} />, category: 'content', preview: 'team' },
      { id: 'stats', name: 'Stats Section', icon: <BarChart size={14} />, category: 'content', preview: 'stats' },
      { id: 'timeline', name: 'Timeline', icon: <ArrowRight size={14} />, category: 'content', preview: 'timeline' },
    ],
  },
  cta: {
    name: 'Calls to Action',
    icon: <Zap size={16} />,
    components: [
      { id: 'cta-simple', name: 'Simple CTA', icon: <Zap size={14} />, category: 'cta', preview: 'cta-simple' },
      { id: 'cta-split', name: 'Split CTA', icon: <Grid size={14} />, category: 'cta', preview: 'cta-split' },
      { id: 'cta-newsletter', name: 'Newsletter CTA', icon: <Mail size={14} />, category: 'cta', preview: 'newsletter' },
    ],
  },
  forms: {
    name: 'Form Elements',
    icon: <FileText size={16} />,
    components: [
      { id: 'contact-form', name: 'Contact Form', icon: <Mail size={14} />, category: 'forms', preview: 'contact' },
      { id: 'login-form', name: 'Login Form', icon: <LogIn size={14} />, category: 'forms', preview: 'login' },
      { id: 'signup-form', name: 'Signup Form', icon: <UserPlus size={14} />, category: 'forms', preview: 'signup' },
      { id: 'checkout-form', name: 'Checkout Form', icon: <CreditCard size={14} />, category: 'forms', preview: 'checkout' },
    ],
  },
  footer: {
    name: 'Footers',
    icon: <Layout size={16} />,
    components: [
      { id: 'footer-simple', name: 'Simple Footer', icon: <Layout size={14} />, category: 'footer', preview: 'footer-simple' },
      { id: 'footer-columns', name: 'Multi-Column Footer', icon: <Grid size={14} />, category: 'footer', preview: 'footer-columns' },
      { id: 'footer-newsletter', name: 'Footer with Newsletter', icon: <Mail size={14} />, category: 'footer', preview: 'footer-newsletter' },
    ],
  },
};

// -----------------------------------------------------------------------------
// 2) ComponentPreview
// -----------------------------------------------------------------------------
const ComponentPreview = ({ type }: { type: string }) => {
  const previews: Record<string, JSX.Element> = {
    navbar: (
      <div className="w-full h-8 bg-gray-800 rounded-t flex items-center px-2 gap-2">
        <div className="w-6 h-6 bg-blue-500 rounded" />
        <div className="flex-1 flex gap-2">
          <div className="w-12 h-4 bg-gray-600 rounded" />
          <div className="w-12 h-4 bg-gray-600 rounded" />
          <div className="w-12 h-4 bg-gray-600 rounded" />
        </div>
        <div className="w-16 h-5 bg-blue-500 rounded text-xs" />
      </div>
    ),
    'hero-centered': (
      <div className="w-full h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded p-4 flex flex-col items-center justify-center gap-2">
        <div className="w-32 h-4 bg-white/20 rounded" />
        <div className="w-24 h-3 bg-white/20 rounded" />
        <div className="w-16 h-6 bg-white rounded mt-2" />
      </div>
    ),
    features: (
      <div className="grid grid-cols-3 gap-1 p-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 rounded" />
        ))}
      </div>
    ),
    'footer-simple': (
      <div className="w-full h-16 bg-gray-800 rounded-b p-2">
        <div className="flex justify-between items-center h-full">
          <div className="w-16 h-4 bg-gray-600 rounded" />
          <div className="flex gap-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-600 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    ),
    text: (
      <div className="p-2 space-y-1">
        <div className="w-full h-2 bg-gray-300 rounded" />
        <div className="w-full h-2 bg-gray-300 rounded" />
        <div className="w-3/4 h-2 bg-gray-300 rounded" />
      </div>
    ),
    default: (
      <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
        <Package size={24} className="text-gray-400" />
      </div>
    ),
  };

  return previews[type] || previews.default;
};

// -----------------------------------------------------------------------------
// 3) EnhancedPageNode (Professional Styling)
// -----------------------------------------------------------------------------
const EnhancedPageNode = memo(({ data, selected }: NodeProps) => {
  const [showPreview, setShowPreview] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`min-w-[260px] bg-white border-2 rounded-lg shadow-xl overflow-hidden transition-transform ring-offset-2
        ${selected ? 'ring-2 ring-blue-500 scale-105' : 'hover:ring-2 hover:ring-blue-200'}
      `}
    >
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-3 py-2 flex items-center justify-between cursor-pointer"
           onClick={() => setCollapsed((c) => !c)}>
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-white" />
          <div className="font-medium text-white truncate">{data.label}</div>
        </div>
        <div className="flex items-center gap-1">
          {data.url && (
            <span className="text-xs bg-indigo-700/30 px-2 py-0.5 rounded text-white font-mono">
              {data.url}
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPreview((prev) => !prev);
            }}
            className="text-white/80 hover:text-white transition-colors"
          >
            {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="p-3 space-y-3">
          {data.description && (
            <div className="text-sm text-gray-700 line-clamp-3">{data.description}</div>
          )}

          {showPreview && data.components && data.components.length > 0 && (
            <div className="border-t pt-3 space-y-2">
              {data.components.map((componentId: string, index: number) => {
                const component = Object.values(componentCategories)
                  .flatMap((cat) => cat.components)
                  .find((c) => c.id === componentId);

                return (
                  <div key={index} className="bg-gray-50 rounded p-2 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      {component?.icon || <Package size={12} className="text-gray-400" />}
                      <span className="text-sm font-medium text-gray-800">
                        {component?.name || componentId}
                      </span>
                    </div>
                    <div className="h-14 overflow-hidden rounded-lg border border-gray-200">
                      <ComponentPreview type={component?.preview || 'default'} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <Handle
        type="target"
        position={Position.Top}
        className="w-4 h-4 bg-indigo-500 border-2 border-white shadow-lg"
        style={{ top: -8 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-4 h-4 bg-indigo-500 border-2 border-white shadow-lg"
        style={{ bottom: -8 }}
      />
    </div>
  );
});

// -----------------------------------------------------------------------------
// 4) ComponentLibrary (Enhanced Sidebar with Categories & Snapping Info)
// -----------------------------------------------------------------------------
const ComponentLibrary = ({
  onAddComponent,
  isOpen,
  onClose,
}: {
  onAddComponent: (componentId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(Object.keys(componentCategories)));
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) newExpanded.delete(category);
    else newExpanded.add(category);
    setExpandedCategories(newExpanded);
  };

  // Filter categories by search term
  const filteredComponents = Object.entries(componentCategories).reduce((acc, [catKey, category]) => {
    const filtered = category.components.filter((comp) => comp.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filtered.length > 0) acc[catKey] = { ...category, components: filtered };
    return acc;
  }, {} as typeof componentCategories);

  return (
    <div
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 bg-white border-r border-gray-200 shadow-2xl transform transition-transform z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package size={20} className="text-indigo-600" />
            <h3 className="font-semibold text-lg text-gray-800">Components</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
            <X size={18} />
          </Button>
        </div>

        {/* Search Input */}
        <div className="p-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Category List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {Object.entries(filteredComponents).map(([catKey, category]) => (
            <div key={catKey} className="rounded-lg border border-gray-200">
              <button
                onClick={() => toggleCategory(catKey)}
                className="w-full px-3 py-2 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {category.icon}
                  <span className="font-medium text-sm text-gray-700">{category.name}</span>
                </div>
                <span className="text-xs text-gray-500">({category.components.length})</span>
                {expandedCategories.has(catKey) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {expandedCategories.has(catKey) && (
                <div className="p-2 space-y-2">
                  {category.components.map((component) => (
                    <div
                      key={component.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('componentId', component.id);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      onClick={() => onAddComponent(component.id)}
                      onMouseEnter={() => setHoveredComponent(component.id)}
                      onMouseLeave={() => setHoveredComponent(null)}
                      className="bg-white border border-gray-200 rounded-lg p-3 cursor-move hover:border-indigo-400 hover:shadow-lg transition-all relative group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {component.icon}
                          <span className="text-sm font-medium text-gray-800">{component.name}</span>
                        </div>
                        <Plus size={14} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
                      </div>
                      {hoveredComponent === component.id && (
                        <div className="absolute bottom-2 right-2 w-20 h-12 rounded-lg overflow-hidden border border-gray-100 shadow-inner bg-white">
                          <ComponentPreview type={component.preview} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Snapping & Settings Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600">Snap to Grid: <span className="text-indigo-600 font-medium">On</span></div>
          <div className="mt-2 flex items-center gap-2">
            <Layers size={16} className="text-gray-500" />
            <span className="text-sm text-gray-700">Manage Layers</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// 5) EnhancedToolbar (Professional Actions & Keyboard Shortcuts)
// ----------------------------------------------------------------------------
const EnhancedToolbar = ({
  projectTitle,
  onSave,
  saveStatus,
  viewMode,
  onViewModeChange,
  onFitView,
  onExport,
  onDuplicate,
}: {
  projectTitle: string;
  onSave: () => void;
  saveStatus: 'idle' | 'saving' | 'saved';
  viewMode: 'sitemap' | 'wireframe';
  onViewModeChange: (mode: 'sitemap' | 'wireframe') => void;
  onFitView: () => void;
  onExport: () => void;
  onDuplicate: () => void;
}) => {
  const navigate = useNavigate();
  const { zoomIn, zoomOut, zoomTo } = useReactFlow();

  return (
    <div className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} leftIcon={<ChevronLeft size={18} />}>
          Dashboard
        </Button>
        <div className="h-8 w-px bg-gray-300" />
        <h1 className="font-semibold text-gray-900 whitespace-nowrap">{projectTitle}</h1>
        <div className="h-8 w-px bg-gray-300" />
        {/* VIEW MODE TOGGLE */}
        <div className="flex items-center bg-gray-100 rounded-md p-1">
          <button
            onClick={() => onViewModeChange('sitemap')}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors $
              viewMode === 'sitemap'? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'
            `}
          >
            Sitemap
          </button>
          <button
            onClick={() => onViewModeChange('wireframe')}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors $
              viewMode === 'wireframe'? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'
            `}
          >
            Wireframe
          </button>
          <button className="px-3 py-1 text-sm font-medium text-gray-400 cursor-not-allowed relative" title="Coming soon">
            Style Guide
            <span className="absolute -top-1 -right-1 text-xs text-red-500">Beta</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* ZOOM CONTROLS */}
        <div className="flex items-center gap-1 mr-2">
          <Button variant="ghost" size="sm" onClick={() => zoomOut()} className="p-1">
            <ZoomOut size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => zoomTo(1)} className="px-2 text-xs">
            100%
          </Button>
          <Button variant="ghost" size="sm" onClick={() => zoomIn()} className="p-1">
            <ZoomIn size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={onFitView} className="p-1">
            <Maximize2 size={16} />
          </Button>
        </div>

        <Button variant="ghost" size="sm" onClick={onDuplicate} leftIcon={<Copy size={16} />}>
          Duplicate
        </Button>
        <Button variant="secondary" size="sm" onClick={onExport} leftIcon={<Download size={16} />}>
          Export
        </Button>
        <Button variant="secondary" size="sm" leftIcon={<Share2 size={16} />}>
          Share
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onSave}
          disabled={saveStatus === 'saving'}
          leftIcon={
            saveStatus === 'saving' ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />
          }
        >
          {saveStatus === 'saving' ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// 6) ProfessionalEditorCanvas (MAIN COMPONENT) with Snap-to-Grid, Multi-Select, & Layers
// -----------------------------------------------------------------------------
export default function ProfessionalEditorCanvas({ projectId }: { projectId: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedElements, setSelectedElements] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'sitemap' | 'wireframe'>('sitemap');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, getNodes } = useReactFlow();

  // Custom node types
  const nodeTypes = { page: EnhancedPageNode };

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
  }, []);
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

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
              // It's an edge
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
