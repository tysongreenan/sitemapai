import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { nanoid } from 'nanoid';
import { useProject } from '../../context/ProjectContext';
import ComponentLibrary from './ComponentLibrary';
import PageNode from './nodes/PageNode';
import ContextMenu from './ContextMenu';

interface Node {
  id: string;
  type: 'page';
  position: { x: number; y: number };
  data: {
    label: string;
    url: string;
    description?: string;
    isHomePage?: boolean;
    isEditing?: boolean;
    sections: Section[];
  };
}

interface Section {
  id: string;
  label: string;
  description: string;
  components: string[];
}

interface Edge {
  id: string;
  source: string;
  target: string;
}

const LAYOUT_CONFIG = {
  NODE_WIDTH: 320,
  NODE_HEIGHT: 400,
  HORIZONTAL_SPACING: 80,
  VERTICAL_SPACING: 120,
  START_X: 400,
  START_Y: 150,
};

class SimpleLayoutSystem {
  calculateLayout(nodes: Node[], edges: Edge[]): Node[] {
    if (nodes.length === 0) return nodes;

    // Find root nodes (nodes with no incoming edges)
    const rootNodes = nodes.filter(node => 
      !edges.some(edge => edge.target === node.id)
    );

    if (rootNodes.length === 0 && nodes.length > 0) {
      rootNodes.push(nodes[0]);
    }

    const positioned = new Set<string>();
    const result: Node[] = [];

    rootNodes.forEach((rootNode, rootIndex) => {
      if (positioned.has(rootNode.id)) return;

      const hierarchy = this.buildHierarchy(rootNode.id, edges, nodes);
      const layoutNodes = this.positionHierarchy(hierarchy, LAYOUT_CONFIG.START_X + rootIndex * 600);
      
      layoutNodes.forEach(node => {
        positioned.add(node.id);
        result.push(node);
      });
    });

    return result;
  }

  private buildHierarchy(rootId: string, edges: Edge[], nodes: Node[]): Map<number, string[]> {
    const levels = new Map<number, string[]>();
    const visited = new Set<string>();
    const queue: { nodeId: string; level: number }[] = [{ nodeId: rootId, level: 0 }];

    while (queue.length > 0) {
      const { nodeId, level } = queue.shift()!;
      if (visited.has(nodeId)) continue;

      visited.add(nodeId);
      
      if (!levels.has(level)) {
        levels.set(level, []);
      }
      levels.get(level)!.push(nodeId);

      // Find children
      const children = edges
        .filter(edge => edge.source === nodeId)
        .map(edge => edge.target);

      children.forEach(childId => {
        if (!visited.has(childId)) {
          queue.push({ nodeId: childId, level: level + 1 });
        }
      });
    }

    return levels;
  }

  private positionHierarchy(levels: Map<number, string[]>, startX: number): Node[] {
    const result: Node[] = [];
    const nodeMap = new Map<string, Node>();

    levels.forEach((nodeIds, level) => {
      const y = LAYOUT_CONFIG.START_Y + level * (LAYOUT_CONFIG.NODE_HEIGHT + LAYOUT_CONFIG.VERTICAL_SPACING);
      const totalWidth = nodeIds.length * LAYOUT_CONFIG.NODE_WIDTH + 
                        (nodeIds.length - 1) * LAYOUT_CONFIG.HORIZONTAL_SPACING;
      let x = startX - totalWidth / 2 + LAYOUT_CONFIG.NODE_WIDTH / 2;

      nodeIds.forEach(nodeId => {
        const node = nodeMap.get(nodeId);
        if (node) {
          result.push({
            ...node,
            position: { x, y }
          });
          x += LAYOUT_CONFIG.NODE_WIDTH + LAYOUT_CONFIG.HORIZONTAL_SPACING;
        }
      });
    });

    return result;
  }
}

const EditorCanvas = ({ projectId }: { projectId: string }) => {
  const navigate = useNavigate();
  const { currentProject, updateProject } = useProject();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isComponentLibraryOpen, setIsComponentLibraryOpen] = useState(true);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const layoutSystem = useRef(new SimpleLayoutSystem());

  // Initialize nodes from project data
  useEffect(() => {
    if (currentProject?.sitemap_data) {
      const { nodes: savedNodes, edges: savedEdges } = currentProject.sitemap_data;
      if (savedNodes?.length > 0) {
        setNodes(savedNodes);
        setEdges(savedEdges || []);
      } else {
        // Create initial home node
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
          }
        };
        setNodes([homeNode]);
        setEdges([]);
      }
    }
  }, [currentProject?.sitemap_data]);

  // Auto-save changes
  useEffect(() => {
    if (currentProject && nodes.length > 0) {
      const saveTimeout = setTimeout(() => {
        updateProject(currentProject.id, {
          sitemap_data: { nodes, edges }
        });
      }, 1000);

      return () => clearTimeout(saveTimeout);
    }
  }, [nodes, edges, currentProject, updateProject]);

  const handleAddNode = useCallback((direction: 'bottom' | 'left' | 'right', parentNodeId: string) => {
    console.log('🚀 Adding node:', { direction, parentNodeId });
    
    const parentNode = nodes.find(n => n.id === parentNodeId);
    if (!parentNode) {
      console.error('❌ Parent node not found:', parentNodeId);
      return;
    }

    const newNodeId = nanoid();
    const newNode: Node = {
      id: newNodeId,
      type: 'page',
      position: { x: 0, y: 0 }, // Will be positioned by layout system
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
      }
    };

    const updatedNodes = [...nodes, newNode];
    let updatedEdges = [...edges];

    // Add edge for child nodes
    if (direction === 'bottom') {
      updatedEdges.push({
        id: `${parentNodeId}-${newNodeId}`,
        source: parentNodeId,
        target: newNodeId,
      });
    }

    // Apply layout
    const layoutNodes = layoutSystem.current.calculateLayout(updatedNodes, updatedEdges);
    
    setNodes(layoutNodes);
    setEdges(updatedEdges);

    const directionText = direction === 'bottom' ? 'child page' : 'sibling page';
    toast.success(`Added new ${directionText}`);
  }, [nodes, edges]);

  const handleNodeTitleChange = useCallback((nodeId: string, newTitle: string) => {
    setNodes(prev =>
      prev.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              label: newTitle,
              isEditing: false,
              url: '/' + newTitle.toLowerCase().replace(/\s+/g, '-')
            }
          };
        }
        return node;
      })
    );
  }, []);

  const handleDeleteNode = useCallback((nodeId: string) => {
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    if (nodeToDelete?.data.isHomePage) {
      toast.error('Cannot delete the home page');
      return;
    }

    const updatedNodes = nodes.filter(n => n.id !== nodeId);
    const updatedEdges = edges.filter(e => e.source !== nodeId && e.target !== nodeId);
    
    const layoutNodes = layoutSystem.current.calculateLayout(updatedNodes, updatedEdges);
    
    setNodes(layoutNodes);
    setEdges(updatedEdges);
    setContextMenu(null);
    
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
    
    toast.success('Page deleted');
  }, [nodes, edges, selectedNode]);

  const handleAddComponent = useCallback((componentId: string) => {
    if (!selectedNode) {
      toast.info('Please select a page first');
      return;
    }

    setNodes(prev =>
      prev.map(node => {
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
  }, [selectedNode]);

  const handleFitView = useCallback(() => {
    if (nodes.length === 0) return;

    const padding = 100;
    const minX = Math.min(...nodes.map(n => n.position.x)) - padding;
    const maxX = Math.max(...nodes.map(n => n.position.x + LAYOUT_CONFIG.NODE_WIDTH)) + padding;
    const minY = Math.min(...nodes.map(n => n.position.y)) - padding;
    const maxY = Math.max(...nodes.map(n => n.position.y + LAYOUT_CONFIG.NODE_HEIGHT)) + padding;

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    
    if (canvasRef.current) {
      const containerWidth = canvasRef.current.clientWidth;
      const containerHeight = canvasRef.current.clientHeight;
      
      const scaleX = containerWidth / contentWidth;
      const scaleY = containerHeight / contentHeight;
      const scale = Math.min(scaleX, scaleY, 1);
      
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      
      setViewBox({
        x: centerX - (containerWidth / scale) / 2,
        y: centerY - (containerHeight / scale) / 2,
        scale
      });
    }
  }, [nodes]);

  // Canvas pan and zoom handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = (e.clientX - dragStart.x) / viewBox.scale;
      const deltaY = (e.clientY - dragStart.y) / viewBox.scale;
      
      setViewBox(prev => ({
        ...prev,
        x: prev.x - deltaX,
        y: prev.y - deltaY
      }));
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, dragStart, viewBox.scale]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(2, viewBox.scale * delta));
    
    setViewBox(prev => ({
      ...prev,
      scale: newScale
    }));
  }, [viewBox.scale]);

  return (
    <div className="h-full flex">
      <ComponentLibrary
        isOpen={isComponentLibraryOpen}
        onClose={() => setIsComponentLibraryOpen(!isComponentLibraryOpen)}
        onAddComponent={handleAddComponent}
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

        <div 
          ref={canvasRef}
          className="flex-1 overflow-hidden bg-gray-50 relative cursor-grab active:cursor-grabbing"
          style={{ height: 'calc(100% - 48px)' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Canvas content */}
          <div
            className="absolute inset-0"
            style={{
              transform: `translate(${-viewBox.x * viewBox.scale}px, ${-viewBox.y * viewBox.scale}px) scale(${viewBox.scale})`,
              transformOrigin: '0 0',
            }}
          >
            {/* Grid background */}
            <div 
              className="absolute"
              style={{
                left: Math.floor(viewBox.x / 20) * 20,
                top: Math.floor(viewBox.y / 20) * 20,
                width: '200%',
                height: '200%',
                backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                opacity: 0.5,
              }}
            />

            {/* Edges */}
            <svg 
              className="absolute inset-0 pointer-events-none"
              style={{ 
                width: '100%', 
                height: '100%',
                overflow: 'visible'
              }}
            >
              {edges.map(edge => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);
                
                if (!sourceNode || !targetNode) return null;

                const x1 = sourceNode.position.x + LAYOUT_CONFIG.NODE_WIDTH / 2;
                const y1 = sourceNode.position.y + LAYOUT_CONFIG.NODE_HEIGHT;
                const x2 = targetNode.position.x + LAYOUT_CONFIG.NODE_WIDTH / 2;
                const y2 = targetNode.position.y;

                return (
                  <line
                    key={edge.id}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#3b82f6"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}
              
              {/* Arrow marker definition */}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#3b82f6"
                  />
                </marker>
              </defs>
            </svg>

            {/* Nodes */}
            {nodes.map(node => (
              <div
                key={node.id}
                className="absolute"
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  width: LAYOUT_CONFIG.NODE_WIDTH,
                  height: LAYOUT_CONFIG.NODE_HEIGHT,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode(node);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setContextMenu({
                    x: e.clientX,
                    y: e.clientY,
                    nodeId: node.id
                  });
                }}
              >
                <PageNode
                  data={{
                    ...node.data,
                    onAddNode: handleAddNode,
                    onTitleChange: (title: string) => handleNodeTitleChange(node.id, title),
                  }}
                  selected={selectedNode?.id === node.id}
                  id={node.id}
                />
              </div>
            ))}
          </div>

          {/* Zoom controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewBox(prev => ({ ...prev, scale: Math.min(2, prev.scale * 1.2) }))}
              className="px-3 py-2 hover:bg-gray-50 border-b border-gray-200"
            >
              +
            </button>
            <button
              onClick={() => setViewBox(prev => ({ ...prev, scale: Math.max(0.1, prev.scale / 1.2) }))}
              className="px-3 py-2 hover:bg-gray-50 border-b border-gray-200"
            >
              −
            </button>
            <button
              onClick={handleFitView}
              className="px-3 py-2 hover:bg-gray-50 text-xs"
            >
              Fit
            </button>
          </div>
        </div>
      </div>

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

      {nodes.length === 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg max-w-md">
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">🏗️ Custom Sitemap Editor</p>
            <p>Click the + buttons around your Home page to add connected pages:</p>
            <div className="mt-2 text-xs text-blue-600">
              • <strong>Bottom (+):</strong> Add child page<br/>
              • <strong>Left/Right (+):</strong> Add sibling pages
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorCanvas;