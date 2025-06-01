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
  MoreHorizontal, // Ensure this is imported for consistency if you use it directly
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

import WireframePageNode from './nodes/WireframePageNode';
import PageNode from './nodes/PageNode'; // Ensure this is imported correctly
import SectionNode from './nodes/SectionNode'; // Import the SectionNode
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
  const [nodeContextMenu, setNodeContextMenu] = useState<{ id: string; x: number; y: number } | null>(null); // New state for node context menu
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, getNodes, screenToFlowPosition, setNodes: setReactFlowNodes, setEdges: setReactFlowEdges, getIntersectingNodes, getNodesBounds } = useReactFlow(); // Add getIntersectingNodes, getNodesBounds
  const store = useStoreApi(); // Access React Flow's internal store

  // Helper to get node by ID from current nodes state
  const getNode = useCallback((nodeId: string) => nodes.find(n => n.id === nodeId), [nodes]);


  // Custom node types based on viewMode
  const nodeTypes = React.useMemo(() => ({
    page: (nodeProps: NodeProps) => ( // Pass additional props to PageNode
      <PageNode
        {...nodeProps}
        onShowNodeContextMenu={handleShowNodeContextMenu} // Passed down to PageNode
        onAddSection={handleAddSectionToPage} // Passed down to PageNode
        onGenerateContent={handleGenerateContentForPage} // Placeholder
        isHomePage={nodeProps.data.isHomePage} // Pass isHomePage status
      />
    ),
    section: SectionNode, // Register the SectionNode
    wireframePage: WireframePageNode, // Keep this from previous update
  }), [handleShowNodeContextMenu, handleAddSectionToPage, handleGenerateContentForPage]);


  // ───────────────────────────────────────────────────────────────
  // Node Context Menu Handlers (triggered from PageNode's "..." button)
  // ───────────────────────────────────────────────────────────────
  const handleShowNodeContextMenu = useCallback((nodeId: string, clickPos: { x: number; y: number }) => {
    const node = getNode(nodeId);
    if (!node) return;

    setNodeContextMenu({
      id: nodeId,
      x: clickPos.x,
      y: clickPos.y,
      items: [
        { label: 'Ask AI', action: () => toast.info('Ask AI feature coming soon!'), icon: <Sparkles size={16} /> },
        { label: 'Duplicate', action: () => handleDuplicateNode(nodeId), icon: <Copy size={16} /> },
        { label: 'Delete', action: () => handleDeleteNodes([nodeId]), icon: <Trash2 size={16} /> }, // Assuming Trash2 from lucide-react, import it if needed
        { label: 'Copy', action: () => handleCopyNodes([nodeId]), icon: <Clipboard size={16} /> },
        { label: 'Cut', action: () => handleCutNodes([nodeId]), icon: <Scissors size={16} /> }, // Assuming Scissors, import if needed
        { label: 'Paste', action: () => handlePasteNodes(), icon: <Clipboard size={16} /> },
        { label: 'Add page', action: () => handleAddChildPage(nodeId), icon: <Plus size={16} /> },
        { label: 'Add section', action: () => handleAddSectionToPage(nodeId), icon: <Plus size={16} /> },
        { label: 'Set as home page', action: () => handleSetAsHomePage(nodeId), icon: <Home size={16} /> },
        { label: 'Find page in wireframe', action: () => toast.info('Find in wireframe feature coming soon!'), icon: <Search size={16} /> }, // Placeholder
      ] as { label: string; action: () => void; icon?: React.ReactNode }[], // Type assertion to match ContextMenuProps
    });
  }, [getNode, handleDeleteNodes, handleDuplicateNode, handleCopyNodes, handleCutNodes, handlePasteNodes, handleAddChildPage, handleAddSectionToPage, handleSetAsHomePage]);

  const handleCloseNodeContextMenu = useCallback(() => {
    setNodeContextMenu(null);
  }, []);

  // ───────────────────────────────────────────────────────────────
  // Node Actions from Context Menu / Buttons
  // ───────────────────────────────────────────────────────────────

  const handleAddSectionToPage = useCallback((pageId: string) => {
    const pageNode = getNode(pageId);
    if (!pageNode) return;

    const newSectionId = nanoid();
    const newSection: Node = {
      id: newSectionId,
      type: 'section',
      position: { x: pageNode.position.x + 50, y: pageNode.position.y + pageNode.height + 100 }, // Position below the page node
      data: {
        label: 'New Section',
        description: `Section for ${pageNode.data.label}`,
        components: [],
      },
      parentNode: pageId, // Link to parent page node (optional, but good for structure)
      extent: 'parent', // Ensure section stays within parent bounds if parent node is resized
    };

    setNodes((nds) => {
      const updatedNodes = nds.concat(newSection);
      // Optional: Adjust position if sections overlap, or create a layout function
      return updatedNodes;
    });

    // Automatically connect the new section to the page node
    setEdges((eds) => addEdge({
      id: nanoid(),
      source: pageId,
      target: newSectionId,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 2 }, // Purple for section connections
      markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#8b5cf6' },
    }, eds));

    toast.success(`Section added to "${pageNode.data.label}"!`);
  }, [getNode, setNodes, setEdges]);

  const handleGenerateContentForPage = useCallback((pageId: string) => {
    const pageNode = getNode(pageId);
    if (pageNode) {
      toast.info(`Generating content for "${pageNode.data.label}" (feature coming soon!)`);
      // Implement AI content generation logic here later
    }
  }, [getNode]);

  const handleAddChildPage = useCallback((parentId: string) => {
    const parentNode = getNode(parentId);
    if (!parentNode) return;

    const newPageId = nanoid();
    const newPage: Node = {
      id: newPageId,
      type: 'page',
      position: { x: parentNode.position.x + 250, y: parentNode.position.y + 100 }, // Offset from parent
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
  }, [getNode, setNodes, setEdges, handleShowNodeContextMenu, handleAddSectionToPage, handleGenerateContentForPage]);


  const handleSetAsHomePage = useCallback((nodeId: string) => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          isHomePage: n.id === nodeId, // Set selected node as home, others as false
        },
      }))
    );
    toast.success('Home page set!');
  }, [setNodes]);

  const handleDeleteNodes = useCallback((nodeIds: string[]) => {
    setNodes((nds) => nds.filter((n) => !nodeIds.includes(n.id)));
    setEdges((eds) => eds.filter((ed) => !nodeIds.includes(ed.source) && !nodeIds.includes(ed.target)));
    setSelectedElements([]); // Clear selection after deletion
    toast.success('Nodes deleted.');
  }, [setNodes, setEdges]);

  const handleDuplicateNode = useCallback((nodeId: string) => {
    const nodeToDuplicate = getNode(nodeId);
    if (!nodeToDuplicate) return;

    const duplicatedNode: Node = {
      ...nodeToDuplicate,
      id: nanoid(),
      position: { x: nodeToDuplicate.position.x + 50, y: nodeToDuplicate.position.y + 50 }, // Offset
      data: {
        ...nodeToDuplicate.data,
        label: `${nodeToDuplicate.data.label} (Copy)`,
        // Ensure functions are rebound if they are not primitives
        onShowNodeContextMenu: handleShowNodeContextMenu,
        onAddSection: handleAddSectionToPage,
        onGenerateContent: handleGenerateContentForPage,
      },
      selected: false,
    };
    setNodes((nds) => nds.concat(duplicatedNode));
    toast.success('Node duplicated!');
  }, [getNode, setNodes, handleShowNodeContextMenu, handleAddSectionToPage, handleGenerateContentForPage]);

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
            // Re-bind functions for pasted nodes
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


  // ───────────────────────────────────────────────────────────────
  // onDrop / onDragOver: Add a new page-node by dragging a component
  // ───────────────────────────────────────────────────────────────
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const componentId = event.dataTransfer.getData('componentId');
      if (!componentId || !reactFlowWrapper.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = store.getState().project({ // Use store.getState().project for accuracy
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
          onShowNodeContextMenu: handleShowNodeContextMenu, // Important: pass down these functions
          onAddSection: handleAddSectionToPage,
          onGenerateContent: handleGenerateContentForPage,
          isHomePage: false,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, handleShowNodeContextMenu, handleAddSectionToPage, handleGenerateContentForPage, store]
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
  // handleAddPageNode: Adds a new default page node to the canvas (from canvas context menu)
  // ───────────────────────────────────────────────────────────────
  const addPageNode = useCallback((position?: { x: number; y: number }) => {
    const defaultPosition = position || { x: 50, y: 50 }; // Default if no position is provided
    const newNode = {
      id: nanoid(),
      type: 'page',
      position: defaultPosition,
      data: {
        label: 'New Page',
        url: '/new-page',
        description: 'A newly added page',
        components: [],
        onShowNodeContextMenu: handleShowNodeContextMenu, // Pass functions down
        onAddSection: handleAddSectionToPage,
        onGenerateContent: handleGenerateContentForPage,
        isHomePage: false,
      },
    };
    setNodes((nds) => nds.concat(newNode));
    toast.success('New page added!');
  }, [setNodes, handleShowNodeContextMenu, handleAddSectionToPage, handleGenerateContentForPage]);


  // ───────────────────────────────────────────────────────────────
  // Canvas Context Menu Handler (triggered from pane right-click)
  // ───────────────────────────────────────────────────────────────
  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault(); // Prevent default browser context menu
      handleCloseNodeContextMenu(); // Close node context menu if open

      // Calculate position relative to the React Flow instance
      const pane = reactFlowWrapper.current?.getBoundingClientRect();
      if (!pane) return;

      const x = event.clientX - pane.left;
      const y = event.clientY - pane.top;

      // Convert screen coordinates to flow coordinates
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
          // Add more canvas context menu items here
        ],
      });
    },
    [addPageNode, handleFitView, screenToFlowPosition, handleCloseNodeContextMenu]
  );

  const onContextMenuClose = useCallback(() => {
    setContextMenu(null);
    handleCloseNodeContextMenu(); // Also close node context menu if it was open
  }, [handleCloseNodeContextMenu]);


  // ───────────────────────────────────────────────────────────────
  // Fit view handler: Centers and zooms out to show all nodes
  // ───────────────────────────────────────────────────────────────
  const handleFitView = useCallback(() => {
    const allNodes = getNodes();
    if (allNodes.length === 0) return;
    const bounds = getRectOfNodes(allNodes);
    const { x, y, zoom } = getTransformForBounds(bounds, reactFlowWrapper.current!.offsetWidth, reactFlowWrapper.current!.offsetHeight, 0.5, 2);
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
  // Duplicate placeholder (now handles multiple nodes)
  // ───────────────────────────────────────────────────────────────
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
          data: {
            label: 'Home',
            url: '/',
            description: 'Welcome page',
            components: ['navbar', 'hero-centered', 'footer-simple'],
            onShowNodeContextMenu: handleShowNodeContextMenu, // Pass functions
            onAddSection: handleAddSectionToPage,
            onGenerateContent: handleGenerateContentForPage,
            isHomePage: true, // Mark home page
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
      const initialEdges = [
        { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true },
        { id: 'e1-3', source: '1', target: '3', type: 'smoothstep', animated: true },
      ];
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [nodes.length, setNodes, setEdges, handleShowNodeContextMenu, handleAddSectionToPage, handleGenerateContentForPage]); // Add dependencies

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
    // Check for 'Delete' key press
    if (e.key === 'Delete' && selectedElements.length > 0) {
      handleDeleteNodes(selectedElements.map(el => el.id));
    }
    // Handle Copy (Cmd/Ctrl + C)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedElements.length > 0) {
      handleCopyNodes(selectedElements.map(el => el.id));
    }
    // Handle Cut (Cmd/Ctrl + X)
    if ((e.ctrlKey || e.metaKey) && e.key === 'x' && selectedElements.length > 0) {
      handleCutNodes(selectedElements.map(el => el.id));
    }
    // Handle Paste (Cmd/Ctrl + V)
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
          onDuplicate={handleDuplicate} // Use the new handleDuplicate
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
                  if (n.type === 'section') return '#ec4899'; // Pink for sections
                  return '#999';
                }}
                nodeColor={(n) => {
                  if (n.type === 'page') return '#a5b4fc';
                  if (n.type === 'section') return '#fbcfe8'; // Lighter pink for sections
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
            {nodeContextMenu && ( // Render node specific context menu
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