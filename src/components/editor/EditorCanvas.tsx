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
  useStoreApi, // Import useStoreApi for accessing React Flow's internal state directly
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
  MoreHorizontal,
  Trash2, // Ensure Trash2 is imported
  Scissors, // Ensure Scissors is imported
  Home, // Ensure Home is imported
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

import WireframePageNode from './nodes/WireframePageNode';
import PageNode from './nodes/PageNode';
import SectionNode from './nodes/SectionNode';
import ContextMenu from './ContextMenu';
import ComponentLibrary from './ComponentLibrary';

// ... (componentCategories, ComponentPreview, EnhancedToolbar remain the same) ...

export default function EditorCanvas({ projectId }: { projectId: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedElements, setSelectedElements] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'sitemap' | 'wireframe'>('sitemap');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; items: { label: string; action: () => void; icon?: React.ReactNode }[] } | null>(null);
  const [nodeContextMenu, setNodeContextMenu] = useState<{ id: string; x: number; y: number; items: { label: string; action: () => void; icon?: React.ReactNode }[] } | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, getNodes, screenToFlowPosition, setNodes: setReactFlowNodes, setEdges: setReactFlowEdges, getIntersectingNodes, getNodesBounds } = useReactFlow();
  const store = useStoreApi();


  // ───────────────────────────────────────────────────────────────
  // Helper functions (defined first as they are used by callbacks below)
  // ───────────────────────────────────────────────────────────────
  const getNode = useCallback((nodeId: string) => nodes.find(n => n.id === nodeId), [nodes]);


  // ───────────────────────────────────────────────────────────────
  // Callback functions (defined before nodeTypes where they are used)
  // ───────────────────────────────────────────────────────────────

  const handleDeleteNodes = useCallback((nodeIds: string[]) => {
    setNodes((nds) => nds.filter((n) => !nodeIds.includes(n.id)));
    setEdges((eds) => eds.filter((ed) => !nodeIds.includes(ed.source) && !nodeIds.includes(ed.target)));
    setSelectedElements([]); // Clear selection after deletion
    toast.success('Nodes deleted.');
  }, [setNodes, setEdges]);

  const handleCopyNodes = useCallback((nodeIds: string[]) => {
    const nodesToCopy = nodes.filter(n => nodeIds.includes(n.id));
    // Also copy relevant edges if any
    const edgesToCopy = edges.filter(e => nodeIds.includes(e.source) && nodeIds.includes(e.target));
    localStorage.setItem('clipboard', JSON.stringify({ nodes: nodesToCopy, edges: edgesToCopy }));
    toast.info('Copied selected nodes and edges!');
  }, [nodes, edges]);

  const handleCutNodes = useCallback((nodeIds: string[]) => {
    handleCopyNodes(nodeIds); // Copy to clipboard first
    handleDeleteNodes(nodeIds); // Then delete from canvas
    toast.info('Cut selected nodes and edges!');
  }, [handleCopyNodes, handleDeleteNodes]);

  // Declare handleShowNodeContextMenu, handleAddSectionToPage, handleGenerateContentForPage first
  // with placeholders if they have circular dependencies, then define them fully below.
  // This helps break potential circular initialization issues.
  const handleShowNodeContextMenu = useCallback((nodeId: string, clickPos: { x: number; y: number }) => {
    // This will be fully defined below, but we need its reference here
    // for other callbacks that are defined earlier.
  }, []); // Dependencies will be added in its full definition below

  const handleAddSectionToPage = useCallback((pageId: string) => {
    // This will be fully defined below
  }, []); // Dependencies will be added in its full definition below

  const handleGenerateContentForPage = useCallback((pageId: string) => {
    // This will be fully defined below
  }, []); // Dependencies will be added in its full definition below


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
      const idMap = new Map<string, string>(); // Map old IDs to new IDs

      copiedNodes.forEach((node: Node) => {
        const newId = nanoid();
        idMap.set(node.id, newId);
        newNodes.push({
          ...node,
          id: newId,
          position: { x: node.position.x + 30, y: node.position.y + 30 }, // Offset
          selected: false,
          data: {
            ...node.data,
            // Re-bind functions for pasted nodes by passing the direct references
            onShowNodeContextMenu: handleShowNodeContextMenu, // Pass direct reference
            onAddSection: handleAddSectionToPage, // Pass direct reference
            onGenerateContent: handleGenerateContentForPage, // Pass direct reference
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


  const handleFitView = useCallback(() => {
    const allNodes = getNodes();
    if (allNodes.length === 0) return;
    const bounds = getRectOfNodes(allNodes);
    const { x, y, zoom } = getTransformForBounds(bounds, reactFlowWrapper.current!.offsetWidth, reactFlowWrapper.current!.offsetHeight, 0.5, 2);
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

  const handleDuplicateNode = useCallback((nodeId: string) => {
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
        // Pass direct references
        onShowNodeContextMenu: handleShowNodeContextMenu,
        onAddSection: handleAddSectionToPage,
        onGenerateContent: handleGenerateContentForPage,
      },
    };
    setNodes((nds) => nds.concat(duplicatedNode));
    toast.success('Node duplicated!');
  }, [getNode, setNodes, handleShowNodeContextMenu, handleAddSectionToPage, handleGenerateContentForPage]);


  const handleDuplicate = useCallback(() => {
    const selected = store.getState().getSelectedElements();
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
          // Pass direct references
          onShowNodeContextMenu: handleShowNodeContextMenu,
          onAddSection: handleAddSectionToPage,
          onGenerateContent: handleGenerateContentForPage,
        },
      });
    });

    // Duplicate connected edges if both source and target are duplicated nodes
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
  }, [setNodes, setEdges, nodes, edges, store, handleShowNodeContextMenu, handleAddSectionToPage, handleGenerateContentForPage]);


  const handleCloseNodeContextMenu = useCallback(() => {
    setNodeContextMenu(null);
  }, []);

  const onContextMenuClose = useCallback(() => {
    setContextMenu(null);
    handleCloseNodeContextMenu(); // Also close node context menu if it was open
  }, [handleCloseNodeContextMenu]);


  // Full definitions for callbacks that were forward-declared or referenced early
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
    const pageNode = getNode(pageId);
    if (!pageNode) return;

    const newSectionId = nanoid();
    const newSection: Node = {
      id: newSectionId,
      type: 'section',
      position: { x: pageNode.position.x + 50, y: pageNode.position.y + (pageNode.height || 200) + 50 },
      data: {
        label: 'New Section',
        description: `Section for ${pageNode.data.label}`,
        components: [],
      },
      parentNode: pageId,
      extent: 'parent',
    };

    setNodes((nds) => {
      const updatedNodes = nds.concat(newSection);
      return updatedNodes;
    });

    setEdges((eds) => addEdge({
      id: nanoid(),
      source: pageId,
      target: newSectionId,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#8b5cf6' },
    }, eds));

    toast.success(`Section added to "${pageNode.data.label}"!`);
  }, [getNode, setNodes, setEdges]));

  Object.assign(handleGenerateContentForPage, useCallback((pageId: string) => {
    const pageNode = getNode(pageId);
    if (pageNode) {
      toast.info(`Generating content for "${pageNode.data.label}" (feature coming soon!)`);
    }
  }, [getNode]));

  const handleAddChildPage = useCallback((parentId: string) => {
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
        onShowNodeContextMenu: handleShowNodeContextMenu, // Pass direct reference
        onAddSection: handleAddSectionToPage, // Pass direct reference
        onGenerateContent: handleGenerateContentForPage, // Pass direct reference
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
  }, [getNode, setNodes, setEdges, handleShowNodeContextMenu, handleAddSectionToPage, handleGenerateContentForPage]);


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
        onShowNodeContextMenu: handleShowNodeContextMenu, // Pass direct reference
        onAddSection: handleAddSectionToPage, // Pass direct reference
        onGenerateContent: handleGenerateContentForPage, // Pass direct reference
        isHomePage: false,
      },
    };
    setNodes((nds) => nds.concat(newNode));
    toast.success('New page added!');
  }, [setNodes, handleShowNodeContextMenu, handleAddSectionToPage, handleGenerateContentForPage]);


  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      handleCloseNodeContextMenu();

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
    [addPageNode, handleFitView, screenToFlowPosition, handleCloseNodeContextMenu]
  );

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
  // onDrop / onDragOver: Add a new page-node by dragging a component
  // ───────────────────────────────────────────────────────────────
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const componentId = event.dataTransfer.getData('componentId');
      if (!componentId || !reactFlowWrapper.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = store.getState().project({
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
          onShowNodeContextMenu: handleShowNodeContextMenu, // Pass direct reference
          onAddSection: handleAddSectionToPage, // Pass direct reference
          onGenerateContent: handleGenerateContentForPage, // Pass direct reference
          isHomePage: false,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, store, handleShowNodeContextMenu, handleAddSectionToPage, handleGenerateContentForPage]
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
  // Selection handlers: track multi-select & node selection
  // ───────────────────────────────────────────────────────────────
  const onSelectionChange = useCallback(({ nodes, edges }: any) => {
    setSelectedElements([...nodes, ...edges]);
    // If only one node is selected, and it's a page or section, set it as selectedNode
    if (nodes.length === 1 && !edges.length && (nodes[0].type === 'page' || nodes[0].type === 'section')) {
      setSelectedNode(nodes[0]);
    } else {
      setSelectedNode(null);
    }
    onContextMenuClose(); // Close any context menu on selection change
  }, [onContextMenuClose]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    onContextMenuClose(); // Close canvas context menu if a node is clicked
    handleCloseNodeContextMenu(); // Close node context menu if a node is clicked directly
  }, [onContextMenuClose, handleCloseNodeContextMenu]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    onContextMenuClose(); // Close canvas context menu if pane is clicked
    handleCloseNodeContextMenu(); // Close node context menu if pane is clicked
  }, [onContextMenuClose, handleCloseNodeContextMenu]);

  // Keyboard shortcuts: Delete selected nodes/edges
  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Delete' && selectedElements.length > 0) {
      handleDeleteNodes(selectedElements.map(el => el.id));
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

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  // Save to localStorage on every change
  useEffect(() => {
    localStorage.setItem('sitemap-data', JSON.stringify({ nodes, edges }));
  }, [nodes, edges]);

  // ───────────────────────────────────────────────────────────────
  // Initialize with sample data (Ensure functions are passed here too)
  // ───────────────────────────────────────────────────────────────
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
            onShowNodeContextMenu: handleShowNodeContextMenu, // Pass direct reference
            onAddSection: handleAddSectionToPage, // Pass direct reference
            onGenerateContent: handleGenerateContentForPage, // Pass direct reference
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
  }, [nodes.length, setNodes, setEdges]); // Removed specific handlers as dependencies here; they are passed in node data

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
            onClose={() => setIsLibraryShow(false)}
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
              onPaneContextMenu={onPaneContextMenu}
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
                  if (n.type === 'section') return '#ec4899';
                  return '#999';
                }}
                nodeColor={(n) => {
                  if (n.type === 'page') return '#a5b4fc';
                  if (n.type === 'section') return '#fbcfe8';
                  return '#eee';
                }}
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
      </div>
    </ReactFlowProvider>
  );
}