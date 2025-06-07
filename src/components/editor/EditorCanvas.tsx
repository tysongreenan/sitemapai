import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  NodeProps,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toast } from 'react-toastify';
import { nanoid } from 'nanoid';
import { useProject } from '../../context/ProjectContext';
import ComponentLibrary from './ComponentLibrary';
import PageNode from './nodes/PageNode';
import SectionNode from './nodes/SectionNode';
import WireframePageNode from './nodes/WireframePageNode';
import ContextMenu from './ContextMenu';

const LAYOUT_CONFIG = {
  NODE_WIDTH: 320,
  NODE_HEIGHT: 400,
  HORIZONTAL_SPACING: 80,
  VERTICAL_SPACING: 120,
  START_X: 400,
  START_Y: 150,
};

const nodeTypes = {
  page: PageNode,
  section: SectionNode,
  wireframePage: WireframePageNode,
};

// Simplified layout system
class SimpleLayoutSystem {
  calculateLayout(nodes: Node[]): Node[] {
    if (nodes.length === 0) return nodes;

    const rootNodes = nodes.filter(node => 
      node.data.isHomePage || !nodes.some(n => n.data.children?.includes(node.id))
    );

    let currentX = LAYOUT_CONFIG.START_X;
    const positionedNodes: Node[] = [];

    rootNodes.forEach(rootNode => {
      const positioned = this.positionNodeTree(rootNode, nodes, currentX, LAYOUT_CONFIG.START_Y);
      positionedNodes.push(...positioned);
      
      const maxX = Math.max(...positioned.map(n => n.position.x));
      currentX = maxX + LAYOUT_CONFIG.NODE_WIDTH + LAYOUT_CONFIG.HORIZONTAL_SPACING * 2;
    });

    return positionedNodes;
  }

  private positionNodeTree(rootNode: Node, allNodes: Node[], startX: number, startY: number): Node[] {
    const positioned: Node[] = [];
    const queue: { node: Node; x: number; y: number; level: number }[] = [
      { node: rootNode, x: startX, y: startY, level: 0 }
    ];

    while (queue.length > 0) {
      const { node, x, y, level } = queue.shift()!;
      
      positioned.push({
        ...node,
        position: { x, y }
      });

      const children = allNodes.filter(n => node.data.children?.includes(n.id));
      children.forEach((child, index) => {
        const childX = x + (index - (children.length - 1) / 2) * (LAYOUT_CONFIG.NODE_WIDTH + LAYOUT_CONFIG.HORIZONTAL_SPACING);
        const childY = y + LAYOUT_CONFIG.NODE_HEIGHT + LAYOUT_CONFIG.VERTICAL_SPACING;
        
        queue.push({ node: child, x: childX, y: childY, level: level + 1 });
      });
    }

    return positioned;
  }
}

// Node actions context
interface NodeActions {
  addNode: (direction: 'bottom' | 'left' | 'right', parentId: string) => void;
  deleteNode: (nodeId: string) => void;
  updateNode: (nodeId: string, data: Partial<any>) => void;
}

const EditorCanvas = ({ projectId }: { projectId: string }) => {
  const navigate = useNavigate();
  const { currentProject, updateProject } = useProject();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isComponentLibraryOpen, setIsComponentLibraryOpen] = useState(true);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const [hoveredNode, setHoveredNode] = useState<{ id: string; direction: 'bottom' | 'left' | 'right' } | null>(null);
  
  const reactFlowInstance = useReactFlow();
  const layoutSystem = useRef(new SimpleLayoutSystem());
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Simplified node actions
  const nodeActions: NodeActions = {
    addNode: useCallback((direction: 'bottom' | 'left' | 'right', parentId: string) => {
      console.log('Adding node:', { direction, parentId });
      
      const newNodeId = nanoid();
      const parentNode = nodes.find(n => n.id === parentId);
      
      if (!parentNode) {
        console.error('Parent node not found:', parentId);
        return;
      }

      const newNode: Node = {
        id: newNodeId,
        type: 'page',
        position: { x: 0, y: 0 }, // Will be calculated by layout
        data: {
          label: 'New Page',
          url: '/new-page',
          description: 'A new page',
          isEditing: true,
          sections: [
            {
              id: nanoid(),
              label: 'Hero Section',
              description: 'Main hero section for the page',
              components: ['hero-centered']
            }
          ],
          children: []
        }
      };

      // Update parent's children
      const updatedNodes = nodes.map(node => {
        if (node.id === parentId) {
          return {
            ...node,
            data: {
              ...node.data,
              children: [...(node.data.children || []), newNodeId]
            }
          };
        }
        return node;
      });

      // Add new node and recalculate layout
      const allNodes = [...updatedNodes, newNode];
      const layoutedNodes = layoutSystem.current.calculateLayout(allNodes);
      
      setNodes(layoutedNodes);
      
      // Auto-fit view
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
      }, 100);

      toast.success(`Added new ${direction === 'bottom' ? 'child' : 'sibling'} page`);
    }, [nodes, setNodes, reactFlowInstance]),

    deleteNode: useCallback((nodeId: string) => {
      const nodeToDelete = nodes.find(n => n.id === nodeId);
      if (nodeToDelete?.data.isHomePage) {
        toast.error('Cannot delete the home page');
        return;
      }

      // Remove node and update parent references
      const updatedNodes = nodes
        .filter(n => n.id !== nodeId)
        .map(node => ({
          ...node,
          data: {
            ...node.data,
            children: (node.data.children || []).filter((childId: string) => childId !== nodeId)
          }
        }));

      const layoutedNodes = layoutSystem.current.calculateLayout(updatedNodes);
      setNodes(layoutedNodes);
      
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null);
      }
      
      setContextMenu(null);
      toast.success('Page deleted');
    }, [nodes, selectedNode, setNodes]),

    updateNode: useCallback((nodeId: string, data: Partial<any>) => {
      setNodes(nds =>
        nds.map(node => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...data
              }
            };
          }
          return node;
        })
      );
    }, [setNodes])
  };

  // Initialize with home page
  useEffect(() => {
    if (currentProject?.sitemap_data) {
      const { nodes: savedNodes, edges: savedEdges } = currentProject.sitemap_data;
      if (savedNodes?.length > 0) {
        const layoutedNodes = layoutSystem.current.calculateLayout(savedNodes);
        setNodes(layoutedNodes);
        setEdges(savedEdges || []);
      } else {
        // Create initial home page
        const homeNode: Node = {
          id: nanoid(),
          type: 'page',
          position: { x: LAYOUT_CONFIG.START_X, y: LAYOUT_CONFIG.START_Y },
          data: {
            label: 'Home',
            url: '/',
            description: 'Main landing page',
            isHomePage: true,
            sections: [
              {
                id: nanoid(),
                label: 'Hero Section',
                description: 'Main hero section introducing the product',
                components: ['hero-centered']
              }
            ],
            children: []
          }
        };
        
        setNodes([homeNode]);
        setEdges([]);
      }
    }
  }, [currentProject?.sitemap_data, setNodes, setEdges]);

  // Auto-save with debouncing
  useEffect(() => {
    if (currentProject && nodes.length > 0) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        console.log('Auto-saving project...');
        updateProject(currentProject.id, {
          sitemap_data: { nodes, edges }
        });
      }, 1000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [nodes, edges, currentProject, updateProject]);

  // Event handlers
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      nodeId: node.id
    });
  }, []);

  const onAddComponent = useCallback((componentId: string) => {
    if (!selectedNode) {
      toast.info('Please select a page first');
      return;
    }

    const newSection = {
      id: nanoid(),
      label: componentId.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      description: `${componentId.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')} section`,
      components: [componentId]
    };

    nodeActions.updateNode(selectedNode.id, {
      sections: [...(selectedNode.data.sections || []), newSection]
    });

    toast.success(`Added ${componentId.replace(/-/g, ' ')} section`);
  }, [selectedNode, nodeActions]);

  const handleFitView = useCallback(() => {
    reactFlowInstance.fitView({ padding: 0.1, duration: 800 });
  }, [reactFlowInstance]);

  // Enhanced nodes with actions
  const enhancedNodes = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      actions: nodeActions,
      hoveredNode,
      setHoveredNode
    }
  }));

  return (
    <div className="h-full flex">
      <ComponentLibrary
        isOpen={isComponentLibraryOpen}
        onClose={() => setIsComponentLibraryOpen(!isComponentLibraryOpen)}
        onAddComponent={onAddComponent}
      />
      
      <div className="flex-1 h-full">
        <div className="h-12 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-gray-900">
              {currentProject?.title || 'Sitemap Editor'}
            </h2>
            <span className="text-sm text-gray-500">
              {nodes.length} page{nodes.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsComponentLibraryOpen(!isComponentLibraryOpen)}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              {isComponentLibraryOpen ? 'Hide' : 'Show'} Components
            </button>
            <button
              onClick={handleFitView}
              className="px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
            >
              Fit View
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>

        <div className="flex-1" style={{ height: 'calc(100% - 48px)' }}>
          <ReactFlow
            nodes={enhancedNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onNodeContextMenu={onNodeContextMenu}
            nodeTypes={nodeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={true}
            selectNodesOnDrag={false}
            nodesFocusable={true}
            connectOnClick={false}
            nodeOrigin={[0.5, 0.5]}
            fitView
            fitViewOptions={{ padding: 0.1 }}
            minZoom={0.1}
            maxZoom={1.5}
            snapToGrid={true}
            snapGrid={[20, 20]}
            panOnDrag={true}
            zoomOnScroll={true}
            zoomOnPinch={true}
            preventScrolling={false}
          >
            <Background 
              color="#e5e7eb" 
              gap={20} 
              size={1}
              variant="dots"
            />
            <Controls 
              showZoom={true}
              showFitView={true}
              showInteractive={false}
            />
            <MiniMap 
              nodeColor="#3b82f6"
              maskColor="rgba(255, 255, 255, 0.8)"
              position="bottom-right"
            />
          </ReactFlow>
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={[
            {
              label: 'Delete Page',
              action: () => nodeActions.deleteNode(contextMenu.nodeId),
              icon: <span className="text-red-500">×</span>
            },
          ]}
          onClose={() => setContextMenu(null)}
        />
      )}

      {nodes.length === 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg max-w-md">
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">🏗️ Simple Sitemap</p>
            <p>Hover over your Home page to add connected pages</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorCanvas;