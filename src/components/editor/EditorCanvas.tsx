// src/components/editor/EditorCanvas.tsx
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  memo,
} from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  MarkerType,
  useNodesState,
  useEdgesState,
  Node, // Import Node type for clarity
  NodeProps,
  ConnectionLineType,
  getRectOfNodes,
  getTransformForBounds,
  useReactFlow, // This hook is used correctly because EditorCanvas is a child of ReactFlowProvider in EditorPage.tsx
  useStoreApi,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toast } from 'react-toastify';
import { nanoid } from 'nanoid';
import {
  Plus,
  Search,
  Copy,
  Download,
  Sparkles,
  Maximize2,
  Trash2,
  Scissors,
  Clipboard,
  Home,
  Menu, // Added Menu import for componentCategories
  PanelRight, // Added PanelRight import for componentCategories
  FileText, // Added FileText import for componentCategories
  Grid, // Added Grid import for componentCategories
  MessageCircle, // Added MessageCircle import for componentCategories
  BarChart, // Added BarChart import for componentCategories
  Zap, // Added Zap import for componentCategories
  Mail, // Added Mail import for componentCategories
  User, // Added User import for componentCategories
  CreditCard, // Added CreditCard import for componentCategories
  LogIn, // Added LogIn import for componentCategories
  UserPlus, // Added UserPlus import for componentCategories
  RefreshCw, // Added RefreshCw import for EnhancedToolbar
  Share2, // Added Share2 import for EnhancedToolbar
  Save, // Added Save import for EnhancedToolbar
  Layers, // Added Layers import for ComponentLibrary (if used in future)
  ChevronRight, // Added ChevronRight for ComponentLibrary
  ChevronDown, // Added ChevronDown for ComponentLibrary
  Package, // Added Package for ComponentLibrary
  X // Added X for closing buttons
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import EnhancedToolbar from './EditorToolbar'; // Ensure this path is correct
import AddElementsPanel from './AddElementsPanel'; // Changed from ComponentLibrary
import PageNode from './nodes/PageNode';
import SectionNode from './nodes/SectionNode';
import WireframePageNode from './nodes/WireframePageNode';
import ContextMenu from './ContextMenu';

// -----------------------------------------------------------------------------
// Component Categories Definition (Moved here for easy access by EditorCanvas)
// -----------------------------------------------------------------------------
const componentCategories = {
  navigation: {
    name: 'Navigation',
    icon: <Menu size={16} />,
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
// ComponentPreview (Needed for AddElementsPanel, so moved here)
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
// EditorCanvas Component
// -----------------------------------------------------------------------------
export default function EditorCanvas({ projectId }: EditorCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedElements, setSelectedElements] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(true); // Renamed from isComponentLibraryOpen
  const [viewMode, setViewMode] = useState<'sitemap' | 'wireframe'>('sitemap');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [canvasContextMenu, setCanvasContextMenu] = useState<{ x: number; y: number; items: { label: string; action: () => void; icon?: React.ReactNode }[] } | null>(null); // Renamed from contextMenu
  const [nodeContextMenu, setNodeContextMenu] = useState<{ id: string; x: number; y: number; items: { label: string; action: () => void; icon?: React.ReactNode }[] } | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false); // State to control AI generation modal
  const [targetPageNodeIdForSectionAdd, setTargetPageNodeIdForSectionAdd] = useState<string | null>(null); // To track which page to add section to

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  // useReactFlow is now used directly because EditorCanvas is a child of ReactFlowProvider
  const { fitView, getNodes, screenToFlowPosition } = useReactFlow();
  const storeApi = useStoreApi(); // Access React Flow's internal store API

  // ───────────────────────────────────────────────────────────────
  // 1. Core Helper Functions (minimal dependencies)
  // ───────────────────────────────────────────────────────────────
  const getNode = useCallback((nodeId: string) => nodes.find(n => n.id === nodeId), [nodes]);

  // ───────────────────────────────────────────────────────────────
  // 2. Basic Node/Edge Manipulation Functions
  // ───────────────────────────────────────────────────────────────
  const handleDeleteNodes = useCallback((nodeIds: string[]) => {
    setNodes((nds) => nds.filter((n) => !nodeIds.includes(n.id)));
    setEdges((eds) => eds.filter((ed) => !nodeIds.includes(ed.source) && !nodeIds.includes(ed.target)));
    setSelectedElements([]);
    toast.success('Nodes deleted.');
  }, [setNodes, setEdges]);

  const handleCopyNodes = useCallback((nodeIds: string[]) => {
    const nodesToCopy = nodes.filter(n => nodeIds.includes(n.id));
    const edgesToCopy = edges.filter(e => nodeIds.includes(e.source) && nodeIds.includes(e.target));
    localStorage.setItem('clipboard', JSON.stringify({ nodes: nodesToCopy, edges: edgesToCopy }));
    toast.info('Copied selected nodes and edges!');
  }, [nodes, edges]);

  const handleCutNodes = useCallback((nodeIds: string[]) => {
    handleCopyNodes(nodeIds);
    handleDeleteNodes(nodeIds);
    toast.info('Cut selected nodes and edges!');
  }, [handleCopyNodes, handleDeleteNodes]);

  const handleSetAsHomePage = useCallback((nodeId: string) => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          isHomePage: n.id === nodeId,
        },
      }))
    );
    toast.success('Home page set!');
  }, [setNodes]);

  const handleCloseNodeContextMenu = useCallback(() => {
    setNodeContextMenu(null);
  }, []);

  const onContextMenuClose = useCallback(() => { // For canvas context menu
    setCanvasContextMenu(null);
    handleCloseNodeContextMenu();
  }, [handleCloseNodeContextMenu]);

  const handleFitView = useCallback(() => {
    const allNodes = getNodes();
    if (allNodes.length === 0) return;
    const bounds = getRectOfNodes(allNodes);
    getTransformForBounds(bounds, reactFlowWrapper.current!.offsetWidth, reactFlowWrapper.current!.offsetHeight, 0.5, 2);
    fitView({ duration: 800 });
  }, [fitView, getNodes]);

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

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy'; // Changed to 'copy' for adding new elements
  }, []);


  // ───────────────────────────────────────────────────────────────
  // 3. Functions that Generate/Modify Nodes and Pass Callbacks
  //    (These need references to functions that will be defined later,
  //     so we'll structure them carefully or define them after their dependencies)
  // ───────────────────────────────────────────────────────────────

  // Forward declarations for functions that have circular dependencies or are used early
  const handleShowNodeContextMenu = useCallback((nodeId: string, clickPos: { x: number; y: number }) => {}, []);
  const handleAddSectionToPage = useCallback((pageId: string) => {}, []);
  const handleGenerateContentForPage = useCallback((pageId: string) => {}, []);
  const handleAddChildPage = useCallback((parentId: string) => {}, []);
  const handleDuplicateNode = useCallback((nodeId: string) => {}, []);
  const addPageNode = useCallback((position?: { x: number; y: number }) => {}, []); // Define here as it's used in onPaneContextMenu and addChildPage
  const handleTriggerAiSitemap = useCallback(() => { setIsAiModalOpen(true); }, []); // Function to open the AI modal


  const handlePasteNodes = useCallback(() => {
    const clipboardData = localStorage.getItem('clipboard');
    if (!clipboardData) {
      toast.error('Clipboard is empty.');
      return;
    }

    try {
      const { nodes: copiedNodes, edges: copiedEdges } = JSON.parse(clipboardData);
      if (!Array.isArray(copiedNodes)) throw new Error('Invalid clipboard data');

      const newNodes: Node[] = [];
      const newEdges: Connection[] = [];
      const idMap = new Map<string, string>();

      copiedNodes.forEach((node: Node) => {
        const newId = nanoid();
        idMap.set(node.id, newId);
        newNodes.push({
          ...node,
          id: newId,
          position: { x: node.position.x + 30, y: node.position.y + 30 },
          selected: false,
          data: {
            ...node.data,
            onShowNodeContextMenu: handleShowNodeContextMenu,
            onAddSection: handleAddSectionToPage,
            onGenerateContent: handleGenerateContentForPage,
          },
        });
      });

      copiedEdges.forEach((edge: Connection) => {
        const newSource = idMap.get(edge.source);
        const newTarget = idMap.get(edge.target);
        if (newSource && newTarget) {
          newEdges.push({
            ...edge,
            id: nanoid(),
            source: newSource,
            target: newTarget,
          });
        }
      });

      setNodes((nds) => nds.concat(newNodes));
      setEdges((eds) => eds.concat(newEdges));
      toast.success('Pasted elements!');
    } catch (e) {
      console.error('Failed to parse clipboard data:', e);
      toast.error('Failed to paste: Invalid clipboard data.');
    }
  }, [setNodes, setEdges, handleShowNodeContextMenu, handleAddSectionToPage, handleGenerateContentForPage]);


  // Full definitions for the forward-declared functions (ensure their dependencies are defined by now)
  Object.assign(handleShowNodeContextMenu, useCallback((nodeId: string, clickPos: { x: number; y: number }) => {
    const node = getNode(nodeId);
    if (!node) return;

    setNodeContextMenu({
      id: nodeId,
      x: clickPos.x,
      y: clickPos.y,
      items: [
        { label: 'Ask AI', action: () => toast.info('Ask AI feature coming soon!'), icon: <Sparkles size={16} /> },
        { label: 'Duplicate', action: () => handleDuplicateNode(nodeId), icon: <Copy size={16} /> },
        { label: 'Delete', action: () => handleDeleteNodes([nodeId]), icon: <Trash2 size={16} /> },
        { label: 'Copy', action: () => handleCopyNodes([nodeId]), icon: <Clipboard size={16} /> },
        { label: 'Cut', action: () => handleCutNodes([nodeId]), icon: <Scissors size={16} /> },
        { label: 'Paste', action: () => handlePasteNodes(), icon: <Clipboard size={16} /> },
        { label: 'Add page', action: () => handleAddChildPage(nodeId), icon: <Plus size={16} /> },
        { label: 'Add section', action: () => handleAddSectionToPage(nodeId), icon: <Plus size={16} /> },
        { label: 'Set as home page', action: () => handleSetAsHomePage(nodeId), icon: <Home size={16} /> },
        { label: 'Find page in wireframe', action: () => toast.info('Find in wireframe feature coming soon!'), icon: <Search size={16} /> },
      ],
    });
  }, [getNode, handleDeleteNodes, handleDuplicateNode, handleCopyNodes, handleCutNodes, handlePasteNodes, handleAddChildPage, handleAddSectionToPage, handleSetAsHomePage, setNodeContextMenu]));


  Object.assign(handleAddSectionToPage, useCallback((pageId: string) => {
    // If we're adding from a specific page node, record its ID
    setTargetPageNodeIdForSectionAdd(pageId);
    setIsAddPanelOpen(true); // Open the Add Elements Panel
    toast.info('Select a section from the left panel to add to this page.');
  }, [setIsAddPanelOpen, setTargetPageNodeIdForSectionAdd]));

  Object.assign(handleGenerateContentForPage, useCallback((pageId: string) => {
    const pageNode = getNode(pageId);
    if (pageNode) {
      toast.info(`Generating content for "${pageNode.data.label}" (feature coming soon!)`);
    }
  }, [getNode]));

  Object.assign(handleAddChildPage, useCallback((parentId: string) => {
    const parentNode = getNode(parentId);
    if (!parentNode) return;

    const newPageId = nanoid();
    const newPage: Node = {
      id: newPageId,
      type: 'page',
      position: { x: parentNode.position.x + 250, y: parentNode.position.y + 100 },
      data: {
        label: 'Child Page',
        url: `/${parentNode.data.label.toLowerCase().replace(/\s/g, '-')}-child`,
        description: `Child page of ${parentNode.data.label}`,
        components: [],
        onShowNodeContextMenu: handleShowNodeContextMenu,
        onAddSection: handleAddSectionToPage,
        onGenerateContent: handleGenerateContentForPage,
        isHomePage: false,
      },
    };

    setNodes((nds) => nds.concat(newPage));
    setEdges((eds) => addEdge({
      id: nanoid(),
      source: parentId,
      target: newPageId,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#4f46e5', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#4f46e5' },
    }, eds));
    toast.success(`New page added as child of "${parentNode.data.label}"!`);
  }, [getNode, setNodes, setEdges, handleShowNodeContextMenu, handleAddSectionToPage, handleGenerateContentForPage]));


  Object.assign(handleDuplicateNode, useCallback((nodeId: string) => {
    const nodeToDuplicate = getNode(nodeId);
    if (!nodeToDuplicate) return;

    const duplicatedNode: Node = {
      ...nodeToDuplicate,
      id: nanoid(),
      position: { x: nodeToDuplicate.position.x + 50, y: nodeToDuplicate.position.y + 50 },
      selected: false,
      data: {
        ...nodeToDuplicate.data,
        label: `${nodeToDuplicate.data.label} (Copy)`,
        onShowNodeContextMenu: handleShowNodeContextMenu,
        onAddSection: handleAddSectionToPage,
        onGenerateContent: handleGenerateContentForPage,
      },
    };
    setNodes((nds) => nds.concat(duplicatedNode));
    toast.success('Node duplicated!');
  }, [getNode, setNodes, handleShowNodeContextMenu, handleAddSectionToPage, handleGenerateContentForPage]));


  Object.assign(addPageNode, useCallback((position?: { x: number; y: number }) => {
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
        onShowNodeContextMenu: handleShowNodeContextMenu,
        onAddSection: handleAddSectionToPage,
        onGenerateContent: handleGenerateContentForPage,
        isHomePage: false,
      },
    };
    setNodes((nds) => nds.concat(newNode));
    toast.success('New page added!');
  }, [setNodes, handleShowNodeContextMenu, handleAddSectionToPage, handleGenerateContentForPage]));

  const handleDuplicateFromToolbar = useCallback(() => { // Renamed to avoid confusion with handleDuplicateNode
    const selected = storeApi.getState().getSelectedElements();
    if (!selected || selected.length === 0) {
      toast.info('Select nodes to duplicate.');
      return;
    }
    const nodesToDuplicate = selected.filter(el => el.type === 'page' || el.type === 'section');
    if (nodesToDuplicate.length === 0) {
      toast.info('No nodes selected for duplication.');
      return;
    }

    const newNodes: Node[] = [];
    const newEdges: Connection[] = [];
    const idMap = new Map<string, string>();

    nodesToDuplicate.forEach((node: Node) => {
      const newId = nanoid();
      idMap.set(node.id, newId);
      newNodes.push({
        ...node,
        id: newId,
        position: { x: node.position.x + 50, y: node.position.y + 50 },
        selected: false,
        data: {
          ...node.data,
          label: `${node.data.label} (Copy)`,
          onShowNodeContextMenu: handleShowNodeContextMenu,
          onAddSection: handleAddSectionToPage,
          onGenerateContent: handleGenerateContentForPage,
        },
      });
    });

    edges.forEach(edge => {
        if (idMap.has(edge.source) && idMap.has(edge.target)) {
            newEdges.push({
                ...edge,
                id: nanoid(),
                source: idMap.get(edge.source)!,
                target: idMap.get(edge.target)!,
            });
        }
    });

    setNodes((nds) => nds.concat(newNodes));
    setEdges((eds) => eds.concat(newEdges));
    toast.success('Selected elements duplicated!');
  }, [setNodes, setEdges, nodes, edges, storeApi, handleShowNodeContextMenu, handleAddSectionToPage, handleGenerateContentForPage]);


  // Handle adding a section to the canvas (from AddElementsPanel)
  const handleAddSectionFromPanel = useCallback((sectionType: string) => {
    let position;
    if (targetPageNodeIdForSectionAdd) {
      // If triggered from a page node, add below that page
      const pageNode = getNode(targetPageNodeIdForSectionAdd);
      if (pageNode) {
        position = { x: pageNode.position.x, y: pageNode.position.y + (pageNode.height || 200) + 50 };
      }
    } else {
      // Otherwise, add to a default position on canvas
      position = { x: 50, y: 50 };
    }

    const newSectionId = nanoid();
    const newSection: Node = {
      id: newSectionId,
      type: 'section',
      position,
      data: {
        label: sectionType === 'blank-section' ? 'Blank Section' : sectionType.replace(/-/g, ' ').replace(/\b\w/g, s => s.toUpperCase()), // Convert ID to readable label
        description: `Describe the ${sectionType.replace(/-/g, ' ')}`, // Editable description prompt
        components: [sectionType], // Store the component type
      },
      parentNode: targetPageNodeIdForSectionAdd || undefined, // Set parent if applicable
      extent: targetPageNodeIdForSectionAdd ? 'parent' : undefined,
    };

    setNodes((nds) => nds.concat(newSection));

    // Connect to parent page if it came from a page node context
    if (targetPageNodeIdForSectionAdd) {
      setEdges((eds) => addEdge({
        id: nanoid(),
        source: targetPageNodeIdForSectionAdd,
        target: newSectionId,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#8b5cf6', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#8b5cf6' },
      }, eds));
      toast.success(`"${newSection.data.label}" added to page!`);
    } else {
      toast.success(`"${newSection.data.label}" added to canvas!`);
    }

    setTargetPageNodeIdForSectionAdd(null); // Clear the target page ID
    setIsAddPanelOpen(false); // Close the panel after adding
  }, [setNodes, setEdges, targetPageNodeIdForSectionAdd, getNode, setIsAddPanelOpen]);


  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      setNodeContextMenu(null); // Close node context menu if open

      const pane = reactFlowWrapper.current?.getBoundingClientRect();
      if (!pane) return;

      const x = event.clientX - pane.left;
      const y = event.clientY - pane.top;

      const flowPosition = screenToFlowPosition({ x, y });

      setCanvasContextMenu({
        x: event.clientX,
        y: event.clientY,
        items: [
          {
            label: 'Add New Page',
            action: () => {
              addPageNode(flowPosition);
              setCanvasContextMenu(null); // Close menu
            },
            icon: <Plus size={16} />,
          },
          {
            label: 'Fit View',
            action: () => {
              handleFitView();
              setCanvasContextMenu(null); // Close menu
            },
            icon: <Maximize2 size={16} />,
          },
        ],
      });
    },
    [addPageNode, handleFitView, screenToFlowPosition, setCanvasContextMenu, setNodeContextMenu]
  );


  // ───────────────────────────────────────────────────────────────
  // 4. React Flow Callbacks & Node Types
  // ───────────────────────────────────────────────────────────────
  const nodeTypes = React.useMemo(() => ({
    page: (nodeProps: NodeProps) => (
      <PageNode
        {...nodeProps}
        onShowNodeContextMenu={handleShowNodeContextMenu}
        onAddSection={handleAddSectionToPage}
        onGenerateContent={handleGenerateContentForPage}
        isHomePage={nodeProps.data.isHomePage}
      />
    ),
    section: SectionNode, // SectionNode now includes editable description if handled there
    wireframePage: WireframePageNode,
  }), [handleShowNodeContextMenu, handleAddSectionToPage, handleGenerateContentForPage]);


  const onSelectionChange = useCallback(({ nodes, edges }: { nodes: Node[], edges: Connection[] }) => {
    setSelectedElements([...nodes, ...edges]);
    if (nodes.length === 1 && !edges.length && (nodes[0].type === 'page' || nodes[0].type === 'section')) {
      setSelectedNode(nodes[0]);
    } else {
      setSelectedNode(null);
    }
    onContextMenuClose();
  }, [onContextMenuClose]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    onContextMenuClose();
    handleCloseNodeContextMenu();
  }, [onContextMenuClose, handleCloseNodeContextMenu]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    onContextMenuClose();
    handleCloseNodeContextMenu();
  }, [onContextMenuClose, handleCloseNodeContextMenu]);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Delete' && selectedElements.length > 0) {
      handleDeleteNodes(selectedElements.map(el => el.id));
      e.preventDefault(); // Prevent browser back navigation
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedElements.length > 0) {
      handleCopyNodes(selectedElements.map(el => el.id));
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'x' && selectedElements.length > 0) {
      handleCutNodes(selectedElements.map(el => el.id));
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      handlePasteNodes();
    }
  }, [selectedElements, handleDeleteNodes, handleCopyNodes, handleCutNodes, handlePasteNodes]);


  // ───────────────────────────────────────────────────────────────
  // 5. Effects & Initial Data
  // ───────────────────────────────────────────────────────────────
  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  useEffect(() => {
    localStorage.setItem('sitemap-data', JSON.stringify({ nodes, edges }));
  }, [nodes, edges]);

  // Initialize with sample data
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
            onAddSection: handleAddSectionToPage,
            onGenerateContent: handleGenerateContentForPage,
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
            onAddSection: handleAddSectionToPage,
            onGenerateContent: handleGenerateContentForPage,
            isHomePage: false,
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
            onAddSection: handleAddSectionToPage,
            onGenerateContent: handleGenerateContentForPage,
            isHomePage: false,
          },
        },
      ];
      setNodes(initialNodes);
      setEdges([
        { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true },
        { id: 'e1-3', source: '1', target: '3', type: 'smoothstep', animated: true },
      ]);
    }
  }, [nodes.length, setNodes, setEdges, handleShowNodeContextMenu, handleAddSectionToPage, handleGenerateContentForPage]);

  // ───────────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-gray-50">
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
        onDuplicate={handleDuplicateFromToolbar}
      />

      <div className="flex flex-1">
        {/* Add Elements Panel */}
        <AddElementsPanel
          isOpen={isAddPanelOpen}
          onClose={() => setIsAddPanelOpen(false)}
          onAddPage={addPageNode} // Pass the addPageNode function
          onAddSectionToCanvas={handleAddSectionFromPanel} // Pass the new handler
          onTriggerAiSitemap={handleTriggerAiSitemap} // Pass the AI modal trigger
        />

        <div
          className="flex-1 h-full"
          ref={reactFlowWrapper}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onContextMenu={onPaneContextMenu} // Use onContextMenu for the pane
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
            snapToGrid
            snapGrid={[20, 20]}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            fitView // Ensure fitView is here too
          >
            <Background gap={20} size={1} color="#d1d5db" /> {/* Corrected color */}
            <Controls />
            <MiniMap
              nodeColor={(node) => { // Corrected from nodeStrokeColor to nodeColor
                switch (node.type) {
                  case 'page':
                    return '#4f46e5';
                  case 'section':
                    return '#ec4899';
                  default:
                    return '#9ca3af';
                }
              }}
              nodeStrokeColor={(node) => { // Corrected from nodeColor to nodeStrokeColor
                switch (node.type) {
                  case 'page':
                    return '#a5b4fc';
                  case 'section':
                    return '#fbcfe8';
                  default:
                    return '#eee';
                }
              }}
            />
          </ReactFlow>
        </div>

        {/* AI Generation Modal */}
        {isAiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-4">Generate Sitemap with AI</h3>
              <p className="mb-4">This is a placeholder for the AI generation modal.</p>
              <Button onClick={() => setIsAiModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}

        {canvasContextMenu && (
          <ContextMenu
            x={canvasContextMenu.x}
            y={canvasContextMenu.y}
            items={canvasContextMenu.items}
            onClose={() => setCanvasContextMenu(null)}
          />
        )}
        {nodeContextMenu && (
          <ContextMenu
            x={nodeContextMenu.x}
            y={nodeContextMenu.y}
            items={nodeContextMenu.items}
            onClose={handleCloseNodeContextMenu}
          />
        )}
      </div>
    </div>
  );
}