import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  Panel,
  useNodesState,
  useEdgesState,
  Edge,
  Node,
  ConnectionLineType,
  Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toast } from 'react-toastify';
import { nanoid } from 'nanoid';
import { Save, ZoomIn, ZoomOut, PanelRight, LayoutGrid, Plus, Trash } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { Button } from '../ui/Button';
import PageNode from './nodes/PageNode';
import SectionNode from './nodes/SectionNode';
import PropertiesPanel from './PropertiesPanel';
import EditorToolbar from './EditorToolbar';
import { debounce } from '../../lib/utils';

// Register custom node types
const nodeTypes = {
  page: PageNode,
  section: SectionNode,
};

interface EditorCanvasProps {
  projectId: string;
}

export function EditorCanvas({ projectId }: EditorCanvasProps) {
  const { currentProject, saveProjectChanges, saveStatus } = useProject();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  
  // Track if this is the initial load to prevent auto-save on load
  const isInitialLoad = useRef(true);

  // Load sitemap data when currentProject changes
  useEffect(() => {
    if (currentProject?.sitemap_data) {
      const { nodes: projectNodes = [], edges: projectEdges = [] } = currentProject.sitemap_data;
      
      if (projectNodes.length > 0) {
        setNodes(projectNodes);
      } else {
        // Add a default home page if no nodes exist
        const defaultNode = {
          id: 'home',
          type: 'page',
          position: { x: 250, y: 100 },
          data: { 
            label: 'Home Page', 
            url: '/',
            description: 'Main landing page',
            components: ['header', 'hero', 'footer']
          }
        };
        setNodes([defaultNode]);
      }
      
      setEdges(projectEdges);
      
      // Mark initial load as complete after a short delay
      setTimeout(() => {
        isInitialLoad.current = false;
      }, 1000);
    }
  }, [currentProject, setNodes, setEdges]);

  // Create a debounced save function
  const debouncedSave = useCallback(
    debounce((nodesToSave: Node[], edgesToSave: Edge[]) => {
      if (currentProject && !isInitialLoad.current) {
        saveProjectChanges({
          sitemap_data: { nodes: nodesToSave, edges: edgesToSave },
        });
      }
    }, 1500), // 1.5 second debounce
    [currentProject, saveProjectChanges]
  );

  // Auto-save when nodes or edges change (but not on initial load)
  useEffect(() => {
    if (!isInitialLoad.current && (nodes.length > 0 || edges.length > 0)) {
      debouncedSave(nodes, edges);
    }
  }, [nodes, edges, debouncedSave]);

  // Manual save function for the save button
  const handleManualSave = () => {
    if (currentProject) {
      saveProjectChanges({
        sitemap_data: { nodes, edges },
      });
      toast.success('Sitemap saved manually');
    }
  };

  // Handle connecting nodes
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ 
        ...params, 
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 }
      }, eds));
    },
    [setEdges]
  );

  // Handle node selection
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    if (!isPanelOpen) {
      setIsPanelOpen(true);
    }
  }, [isPanelOpen]);

  // Handle node deselection
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Add new node
  const addNode = useCallback(
    (type: 'page' | 'section') => {
      if (!reactFlowInstance) return;

      const position = reactFlowInstance.project({
        x: window.innerWidth / 2,
        y: window.innerHeight / 3,
      });

      const newNode: Node = {
        id: nanoid(),
        type,
        position,
        data: {
          label: type === 'page' ? 'New Page' : 'New Section',
          url: type === 'page' ? '/new-page' : undefined,
          description: '',
          components: [],
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setSelectedNode(newNode);
    },
    [reactFlowInstance, setNodes]
  );

  // Update node data
  const updateNodeData = useCallback(
    (nodeId: string, data: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data: { ...node.data, ...data } };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  // Delete selected node
  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) => 
        eds.filter(
          (edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id
        )
      );
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes, setEdges]);

  return (
    <div className="h-full flex flex-col">
      <EditorToolbar 
        projectTitle={currentProject?.title || 'Untitled Sitemap'} 
        isSaving={saveStatus === 'saving'}
        onSave={handleManualSave}
        saveStatus={saveStatus}
      />
      
      <div className="flex-grow flex" style={{ height: 'calc(100vh - 64px)' }}>
        <div ref={reactFlowWrapper} className="flex-grow h-full">
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              connectionLineType={ConnectionLineType.SmoothStep}
              snapToGrid={true}
              snapGrid={[15, 15]}
              defaultZoom={1}
              minZoom={0.2}
              maxZoom={4}
              fitView
              attributionPosition="bottom-right"
              onInit={setReactFlowInstance}
            >
              <Controls />
              <MiniMap
                nodeStrokeColor={(n) => {
                  if (n.type === 'page') return '#6366f1';
                  return '#ff0072';
                }}
                nodeColor={(n) => {
                  if (n.type === 'page') return '#c7d2fe';
                  return '#fecaca';
                }}
              />
              <Background color="#aaa" gap={16} />
              
              <Panel position="top-left" className="flex space-x-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => addNode('page')}
                  leftIcon={<Plus size={16} />}
                >
                  Add Page
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => addNode('section')}
                  leftIcon={<Plus size={16} />}
                >
                  Add Section
                </Button>
                {selectedNode && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={deleteSelectedNode}
                    leftIcon={<Trash size={16} />}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </Button>
                )}
              </Panel>
              
              <Panel position="top-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPanelOpen(!isPanelOpen)}
                  leftIcon={<PanelRight size={16} />}
                >
                  {isPanelOpen ? 'Hide Panel' : 'Show Panel'}
                </Button>
              </Panel>
            </ReactFlow>
          </ReactFlowProvider>
        </div>
        
        {isPanelOpen && (
          <PropertiesPanel
            selectedNode={selectedNode}
            updateNodeData={updateNodeData}
            onClose={() => setIsPanelOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

export default EditorCanvas;