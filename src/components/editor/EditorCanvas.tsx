// Enhanced EditorCanvas.tsx with fixed node creation
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
  Node,
  Edge,
  NodeProps,
  ConnectionLineType,
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

// Structured layout configuration
const LAYOUT_CONFIG = {
  NODE_WIDTH: 320,
  NODE_HEIGHT: 400,
  HORIZONTAL_SPACING: 80,
  VERTICAL_SPACING: 120,
  GRID_SIZE: 20,
  START_X: 400, // Fixed starting X position
  START_Y: 150, // Fixed starting Y position
};

// Node types registration
const nodeTypes = {
  page: PageNode,
  section: SectionNode,
  wireframePage: WireframePageNode,
};

interface LayoutNode extends Node {
  level: number;
  column: number;
  parentId?: string;
}

class StructuredSitemapLayout {
  private config = LAYOUT_CONFIG;

  // Calculate structured layout positions for all nodes
  calculateStructuredLayout(nodes: Node[], edges: Edge[]): { nodes: Node[], edges: Edge[] } {
    if (nodes.length === 0) return { nodes, edges };

    // Build hierarchy map
    const hierarchy = this.buildHierarchy(nodes, edges);
    
    // Find root node (home page or first node)
    const rootNode = nodes.find(node => 
      node.data.isHomePage || 
      !edges.some(edge => edge.target === node.id)
    ) || nodes[0];

    // Calculate positions starting from root
    const positionedNodes = this.positionNodesInStructure(nodes, edges, rootNode.id);

    return {
      nodes: positionedNodes,
      edges: this.updateEdgePositions(edges)
    };
  }

  private buildHierarchy(nodes: Node[], edges: Edge[]): Map<string, string[]> {
    const hierarchy = new Map<string, string[]>();
    
    // Initialize all nodes in hierarchy
    nodes.forEach(node => {
      hierarchy.set(node.id, []);
    });

    // Build parent-child relationships
    edges.forEach(edge => {
      const children = hierarchy.get(edge.source) || [];
      children.push(edge.target);
      hierarchy.set(edge.source, children);
    });

    return hierarchy;
  }

  private positionNodesInStructure(nodes: Node[], edges: Edge[], rootId: string): Node[] {
    const positioned: Node[] = [];
    const hierarchy = this.buildHierarchy(nodes, edges);
    const levelMap = new Map<number, string[]>();
    const nodeMap = new Map<string, Node>();
    
    // Create node lookup map
    nodes.forEach(node => nodeMap.set(node.id, node));

    // Calculate levels for each node using BFS
    this.calculateLevelsStructured(rootId, hierarchy, levelMap, nodeMap);

    // Position nodes level by level
    levelMap.forEach((nodeIds, level) => {
      const y = this.config.START_Y + level * (this.config.NODE_HEIGHT + this.config.VERTICAL_SPACING);
      
      // Calculate total width needed for this level
      const totalWidth = nodeIds.length * this.config.NODE_WIDTH + (nodeIds.length - 1) * this.config.HORIZONTAL_SPACING;
      
      // Start X position to center the level
      let startX = this.config.START_X - totalWidth / 2 + this.config.NODE_WIDTH / 2;

      nodeIds.forEach((nodeId, index) => {
        const node = nodeMap.get(nodeId);
        if (node) {
          const x = startX + index * (this.config.NODE_WIDTH + this.config.HORIZONTAL_SPACING);
          
          positioned.push({
            ...node,
            position: { 
              x: Math.round(x / this.config.GRID_SIZE) * this.config.GRID_SIZE,
              y: Math.round(y / this.config.GRID_SIZE) * this.config.GRID_SIZE
            }
          });
        }
      });
    });

    return positioned;
  }

  private calculateLevelsStructured(
    rootId: string, 
    hierarchy: Map<string, string[]>, 
    levelMap: Map<number, string[]>,
    nodeMap: Map<string, Node>
  ) {
    const visited = new Set<string>();
    const queue: { nodeId: string, level: number }[] = [{ nodeId: rootId, level: 0 }];

    while (queue.length > 0) {
      const { nodeId, level } = queue.shift()!;
      
      if (visited.has(nodeId) || !nodeMap.has(nodeId)) continue;
      visited.add(nodeId);

      // Add to level map
      if (!levelMap.has(level)) {
        levelMap.set(level, []);
      }
      levelMap.get(level)!.push(nodeId);

      // Add children to queue
      const children = hierarchy.get(nodeId) || [];
      children.forEach(childId => {
        if (!visited.has(childId)) {
          queue.push({ nodeId: childId, level: level + 1 });
        }
      });
    }
  }

  private updateEdgePositions(edges: Edge[]): Edge[] {
    return edges.map(edge => ({
      ...edge,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }
    }));
  }

  // Add a new node in a specific direction with structured positioning
  addNodeInDirection(
    nodes: Node[], 
    edges: Edge[], 
    parentId: string, 
    direction: 'bottom' | 'left' | 'right',
    newNodeData: any
  ): { nodes: Node[], edges: Edge[], newNodeId: string } {
    const newNodeId = nanoid();
    const parentNode = nodes.find(n => n.id === parentId);
    
    if (!parentNode) {
      throw new Error('Parent node not found');
    }

    // Create the new node
    const newNode: Node = {
      id: newNodeId,
      type: 'page',
      position: { x: 0, y: 0 }, // Will be calculated by layout
      data: {
        label: 'New Page',
        url: '/new-page',
        description: 'A new page',
        sections: [
          {
            id: nanoid(),
            label: 'Hero Section',
            description: 'Main hero section for the page',
            components: ['hero-centered']
          }
        ],
        ...newNodeData
      }
    };

    let newEdge: Edge | null = null;
    let updatedNodes = [...nodes, newNode];
    let updatedEdges = [...edges];

    if (direction === 'bottom') {
      // Add as child (new row below)
      newEdge = {
        id: `${parentId}-${newNodeId}`,
        source: parentId,
        target: newNodeId,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }
      };
      updatedEdges.push(newEdge);
    } else {
      // Add as sibling (same row)
      const parentEdge = edges.find(edge => edge.target === parentId);
      if (parentEdge) {
        // Connect to same parent
        newEdge = {
          id: `${parentEdge.source}-${newNodeId}`,
          source: parentEdge.source,
          target: newNodeId,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }
        };
        updatedEdges.push(newEdge);
      }
      // If no parent edge, it becomes a root node (sibling to root)
    }

    // Recalculate structured layout
    const { nodes: layoutNodes, edges: layoutEdges } = this.calculateStructuredLayout(updatedNodes, updatedEdges);

    return {
      nodes: layoutNodes,
      edges: layoutEdges,
      newNodeId
    };
  }
}

const EditorCanvas = ({ projectId }: { projectId: string }) => {
  const navigate = useNavigate();
  const { currentProject, updateProject } = useProject();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isComponentLibraryOpen, setIsComponentLibraryOpen] = useState(true);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const [isSectionDragging, setIsSectionDragging] = useState(false);
  const reactFlowInstance = useReactFlow();
  const layoutSystem = useRef(new StructuredSitemapLayout());

  // Handle section reordering
  const handleSectionsReorder = useCallback((nodeId: string, newSections: any[]) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              sections: newSections
            }
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Handle adding nodes in specific directions - FIXED VERSION
  const handleAddNode = useCallback((direction: 'bottom' | 'left' | 'right', parentNodeId: string) => {
    console.log('handleAddNode called:', { direction, parentNodeId });
    
    try {
      const { nodes: newNodes, edges: newEdges, newNodeId } = layoutSystem.current.addNodeInDirection(
        nodes,
        edges,
        parentNodeId,
        direction,
        {
          onAddNode: handleAddNode,
          onSectionsReorder: (sections: any[]) => handleSectionsReorder(newNodeId, sections),
          onSectionDragStart: () => setIsSectionDragging(true),
          onSectionDragEnd: () => setIsSectionDragging(false),
        }
      );

      console.log('New nodes and edges calculated:', { newNodes: newNodes.length, newEdges: newEdges.length });

      // Update the nodes and edges with the callback functions properly attached
      const nodesWithCallbacks = newNodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          onAddNode: handleAddNode,
          onSectionsReorder: (sections: any[]) => handleSectionsReorder(node.id, sections),
          onSectionDragStart: () => setIsSectionDragging(true),
          onSectionDragEnd: () => setIsSectionDragging(false),
        }
      }));

      setNodes(nodesWithCallbacks);
      setEdges(newEdges);
      
      const directionText = direction === 'bottom' ? 'child page' : 'sibling page';
      toast.success(`Added new ${directionText}`);
      
    } catch (error) {
      console.error('Error adding node:', error);
      toast.error('Failed to add new page');
    }
  }, [nodes, edges, handleSectionsReorder, setNodes, setEdges]);

  // Load initial data and set up structured layout
  useEffect(() => {
    if (currentProject?.sitemap_data) {
      const { nodes: savedNodes, edges: savedEdges } = currentProject.sitemap_data;
      if (savedNodes?.length > 0) {
        // Apply structured layout to saved nodes
        const { nodes: layoutNodes, edges: layoutEdges } = layoutSystem.current.calculateStructuredLayout(
          savedNodes.map(node => ({
            ...node,
            data: {
              ...node.data,
              onAddNode: handleAddNode,
              onSectionsReorder: (sections: any[]) => handleSectionsReorder(node.id, sections),
              onSectionDragStart: () => setIsSectionDragging(true),
              onSectionDragEnd: () => setIsSectionDragging(false),
            }
          })),
          savedEdges || []
        );
        
        setNodes(layoutNodes);
        setEdges(layoutEdges);
      } else {
        // Create initial home page at fixed position
        const homeNodeId = nanoid();
        const homeNode = {
          id: homeNodeId,
          type: 'page',
          position: { 
            x: LAYOUT_CONFIG.START_X - LAYOUT_CONFIG.NODE_WIDTH / 2, 
            y: LAYOUT_CONFIG.START_Y 
          },
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
            onAddNode: handleAddNode,
            onSectionsReorder: (sections: any[]) => handleSectionsReorder(homeNodeId, sections),
            onSectionDragStart: () => setIsSectionDragging(true),
            onSectionDragEnd: () => setIsSectionDragging(false),
          }
        };
        
        setNodes([homeNode]);
        setEdges([]);
      }
    }
  }, [currentProject?.sitemap_data, handleAddNode, handleSectionsReorder, setNodes, setEdges]);

  // Handle node selection
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Handle connections (disabled for structured layout)
  const onConnect = useCallback((connection: Connection) => {
    console.log('Manual connections disabled in structured layout mode');
  }, []);

  // Auto-save changes
  useEffect(() => {
    if (currentProject && nodes.length > 0) {
      const saveTimeout = setTimeout(() => {
        // Remove handlers before saving
        const nodesToSave = nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            onAddNode: undefined,
            onSectionsReorder: undefined,
            onSectionDragStart: undefined,
            onSectionDragEnd: undefined,
          }
        }));
        
        updateProject(currentProject.id, {
          sitemap_data: { nodes: nodesToSave, edges }
        });
      }, 1000);

      return () => clearTimeout(saveTimeout);
    }
  }, [nodes, edges, currentProject, updateProject]);

  // Handle adding components to sections
  const onAddComponent = useCallback((componentId: string) => {
    if (!selectedNode) {
      toast.info('Please select a page first');
      return;
    }

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
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

          return {
            ...node,
            data: {
              ...node.data,
              sections: [...(node.data.sections || []), newSection]
            }
          };
        }
        return node;
      })
    );

    toast.success(`Added ${componentId.replace(/-/g, ' ')} section`);
  }, [selectedNode, setNodes]);

  // Handle node deletion
  const handleDeleteNode = useCallback((nodeId: string) => {
    // Don't allow deleting the home page
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    if (nodeToDelete?.data.isHomePage) {
      toast.error('Cannot delete the home page');
      return;
    }

    const updatedNodes = nodes.filter(n => n.id !== nodeId);
    const updatedEdges = edges.filter(e => e.source !== nodeId && e.target !== nodeId);
    
    // Recalculate structured layout after deletion
    const { nodes: layoutNodes, edges: layoutEdges } = layoutSystem.current.calculateStructuredLayout(
      updatedNodes,
      updatedEdges
    );
    
    // Re-attach callbacks to the remaining nodes
    const nodesWithCallbacks = layoutNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        onAddNode: handleAddNode,
        onSectionsReorder: (sections: any[]) => handleSectionsReorder(node.id, sections),
        onSectionDragStart: () => setIsSectionDragging(true),
        onSectionDragEnd: () => setIsSectionDragging(false),
      }
    }));
    
    setNodes(nodesWithCallbacks);
    setEdges(layoutEdges);
    setContextMenu(null);
    
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
    
    toast.success('Page deleted');
  }, [nodes, edges, selectedNode, handleAddNode, handleSectionsReorder, setNodes, setEdges]);

  // Handle context menu
  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      nodeId: node.id
    });
  }, []);

  // Fit view to show all nodes with padding
  const handleFitView = useCallback(() => {
    reactFlowInstance.fitView({ padding: 0.1, duration: 800 });
  }, [reactFlowInstance]);

  return (
    <div className="h-full flex">
      <ComponentLibrary
        isOpen={isComponentLibraryOpen}
        onClose={() => setIsComponentLibraryOpen(!isComponentLibraryOpen)}
        onAddComponent={onAddComponent}
      />
      
      <div className="flex-1 h-full">
        {/* Toolbar */}
        <div className="h-12 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-gray-900">
              {currentProject?.title || 'Sitemap Editor'}
            </h2>
            <span className="text-sm text-gray-500">
              {nodes.length} page{nodes.length !== 1 ? 's' : ''} • Structured Layout
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

        {/* ReactFlow Canvas */}
        <div className="flex-1" style={{ height: 'calc(100% - 48px)' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onNodeContextMenu={onNodeContextMenu}
            nodeTypes={nodeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={true}
            selectNodesOnDrag={false}
            nodesFocusable={true}
            connectionLineType={ConnectionLineType.SmoothStep}
            connectionMode="loose"
            connectOnClick={false}
            nodeOrigin={[0.5, 0.5]}
            defaultEdgeOptions={{
              type: 'smoothstep',
              markerEnd: { type: MarkerType.ArrowClosed },
              animated: true,
              style: { stroke: '#3b82f6', strokeWidth: 2 }
            }}
            fitView
            fitViewOptions={{ padding: 0.1 }}
            minZoom={0.1}
            maxZoom={1.5}
            snapToGrid={true}
            snapGrid={[20, 20]}
            panOnDrag={true}
            zoomOnScroll={true}
            zoomOnPinch={true}
            onConnectStart={() => false}
            onConnectEnd={() => false}
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

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={[
            {
              label: 'Delete Page',
              action: () => handleDeleteNode(contextMenu.nodeId),
              icon: <span className="text-red-500">×</span>
            },
          ]}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Instructions Overlay */}
      {nodes.length === 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg max-w-md">
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">🏗️ Structured Sitemap</p>
            <p>Hover around your Home page to add connected pages:</p>
            <div className="mt-2 text-xs text-blue-600">
              • <strong>Bottom (+):</strong> Add child page (new row)<br/>
              • <strong>Left/Right (+):</strong> Add sibling page (same row)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorCanvas;