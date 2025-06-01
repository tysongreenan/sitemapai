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
  Node, // Import Node type for clarity
  NodeProps,
  ConnectionLineType,
  getRectOfNodes,
  getTransformForBounds,
  useReactFlow,
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
  Trash2, // Ensure Trash2 is imported
  Scissors, // Ensure Scissors is imported
  Clipboard,
  Home, // Ensure Home is imported
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

import WireframePageNode from './nodes/WireframePageNode';
import PageNode from './nodes/PageNode';
import SectionNode from './nodes/SectionNode';
import ContextMenu from './ContextMenu';
import ComponentLibrary from './ComponentLibrary';

// Assuming componentCategories and EnhancedToolbar are defined elsewhere or correctly imported
// const componentCategories = { ... };
// import { EnhancedToolbar } from './EditorToolbar'; // Example if not already in scope

export default function EditorCanvas({ projectId }: { projectId: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedElements, setSelectedElements] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null); // Use Node type
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'sitemap' | 'wireframe'>('sitemap');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; items: { label: string; action: () => void; icon?: React.ReactNode }[] } | null>(null);
  const [nodeContextMenu, setNodeContextMenu] = useState<{ id: string; x: number; y: number; items: { label: string; action: () => void; icon?: React.ReactNode }[] } | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, getNodes, screenToFlowPosition, store: reactFlowStore } = useReactFlow(); // Use store from useReactFlow
  const storeApi = useStoreApi(); // Also keep storeApi for getSelectedElements

  // ───────────────────────────────────────────────────────────────
  // 1. Core Helper Functions (minimal dependencies)
  // ───────────────────────────────────────────────────────────────
  const getNode = useCallback((nodeId: string) => nodes.find(n => n.id === nodeId), [nodes]);

  // ───────────────────────────────────────────────────────────────
  // 2. Basic Node/Edge Manipulation Functions (depend on state setters or getNode)
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

  const onContextMenuClose = useCallback(() => {
    setContextMenu(null);
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
    event.dataTransfer.dropEffect = 'copy';
  }, []);


  // ───────────────────────────────────────────────────────────────
  // 3. Functions that Generate/Modify Nodes and Pass Callbacks
  //    (These need references to functions that will be defined later,
  //     so we'll structure them carefully or define them after their dependencies)
  // ───────────────────────────────────────────────────────────────

  // These functions need to be declared here as they are referenced by
  // handleDuplicateNode, handleAddChildPage, addPageNode, onDrop, handlePasteNodes,
  // and handleShowNodeContextMenu which are defined later.

  // Forward declarations for functions that have circular dependencies or are used early
  // These will be fully defined below, but we need their references here.
  const handleShowNodeContextMenu = useCallback((nodeId: string, clickPos: { x: number; y: number }) => {}, []);
  const handleAddSectionToPage = useCallback((pageId: string) => {}, []);
  const handleGenerateContentForPage = useCallback((pageId: string) => {}, []);
  const handleAddChildPage = useCallback((parentId: string) => {}, []);
  const handleDuplicateNode = useCallback((nodeId: string) => {}, []);


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
            onShowNodeContextMenu: handleShowNodeContextMenu, // Direct reference
            onAddSection: handleAddSectionToPage, // Direct reference
            onGenerateContent: handleGenerateContentForPage, // Direct reference
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


  // Full definitions for the forward-declared functions
  // Ensure their dependencies are already defined by this point.

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

    setNodes((nds) => nds.concat(newSection));

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
  }, [getNode, setNodes, setEdges]));

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
        onShowNodeContextMenu: handleShowNodeContextMenu, // Direct reference
        onAddSection: handleAddSectionToPage, // Direct reference
        onGenerateContent: handleGenerateContentForPage, // Direct reference
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
        onShowNodeContextMenu: handleShowNodeContextMenu, // Direct reference
        onAddSection: handleAddSectionToPage, // Direct reference
        onGenerateContent: handleGenerateContentForPage, // Direct reference
      },
    };
    setNodes((nds) => nds.concat(duplicatedNode));
    toast.success('Node duplicated!');
  }, [getNode, setNodes, handleShowNodeContextMenu, handleAddSectionToPage, handleGenerateContentForPage]));


  const handleDuplicate = useCallback(() => {
    const selected = storeApi.getState().getSelectedElements(); // Use storeApi for current selected elements
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
        onShowNodeContextMenu: handleShowNodeContextMenu,
        onAddSection: handleAddSectionToPage,
        onGenerateContent: handleGenerateContentForPage,
        isHomePage: false,
      },
    };
    setNodes((nds) => nds.concat(newNode));
    toast.success('New page added!');
  }, [setNodes, handleShowNodeContextMenu, handleAddSectionToPage, handleGenerateContentForPage]);


  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const componentId = event.dataTransfer.getData('componentId');
      if (!componentId || !reactFlowWrapper.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowStore.getState().project({ // Use reactFlowStore here
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const component = Object.values(componentCategories) // Assuming componentCategories is defined
        .flatMap((cat: any) => cat.components)
        .find((c: any) => c.id === componentId);
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
          onShowNodeContextMenu: handleShowNodeContextMenu,
          onAddSection: handleAddSectionToPage,
          onGenerateContent: handleGenerateContentForPage,
          isHomePage: false,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, reactFlowStore, handleShowNodeContextMenu, handleAddSectionToPage, handleGenerateContentForPage]
  );


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


  // ───────────────────────────────────────────────────────────────
  // 4. Node Types & React Flow Callbacks
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
    section: SectionNode,
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
  // 5. Effects
  // ───────────────────────────────────────────────────────────────
  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  useEffect(() => {
    localStorage.setItem('sitemap-data', JSON.stringify({ nodes, edges }));
  }, [nodes, edges]);

  // Initialize with sample data (Ensure functions are passed here too)
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
  }, [nodes.length, setNodes, setEdges]); // Removed specific handlers as dependencies here; they are passed in node data

  // ───────────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────────
  return (
    <ReactFlowProvider>
      <div className="h-screen flex flex-col bg-gray-100">
        {/* Toolbar */}
        <EnhancedToolbar // Assuming EnhancedToolbar is correctly imported and available
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
            onClose={() => setIsLibraryOpen(false)} // Corrected from setIsLibraryShow
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