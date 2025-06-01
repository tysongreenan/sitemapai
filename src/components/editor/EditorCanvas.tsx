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
  Menu,
  PanelRight,
  Layout,
  Grid,
  MessageCircle,
  Mail,
  Users,
  Zap,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import EnhancedToolbar from './EditorToolbar';
import ComponentLibrary from './ComponentLibrary';
import PageNode from './nodes/PageNode';
import SectionNode from './nodes/SectionNode';
import WireframePageNode from './nodes/WireframePageNode';
import ContextMenu from './ContextMenu';

// Node types registration
const nodeTypes = {
  page: PageNode,
  section: SectionNode,
  wireframePage: WireframePageNode,
};

const EditorCanvas = ({ projectId }: { projectId: string }) => {
  const navigate = useNavigate();
  const { currentProject, updateProject, saveStatus, setSaveStatus } = useProject();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isComponentLibraryOpen, setIsComponentLibraryOpen] = useState(true);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Load initial data
  useEffect(() => {
    if (currentProject?.sitemap_data) {
      const { nodes: savedNodes, edges: savedEdges } = currentProject.sitemap_data;
      if (savedNodes?.length > 0) {
        setNodes(savedNodes);
        setEdges(savedEdges || []);
      } else {
        // Initialize with a default home page if no nodes exist
        const defaultNode = {
          id: nanoid(),
          type: 'page',
          position: { x: 400, y: 200 },
          data: {
            label: 'Home',
            url: '/',
            description: 'Main landing page',
            components: []
          }
        };
        setNodes([defaultNode]);
      }
    }
  }, [currentProject?.sitemap_data]);

  // Handle connections
  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) =>
      addEdge(
        {
          ...connection,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed },
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 2 }
        },
        eds
      )
    );
  }, []);

  // Handle node selection
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Update node data
  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    );
  }, []);

  // Handle adding components
  const onAddComponent = useCallback((componentId: string) => {
    if (!reactFlowWrapper.current) return;

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = reactFlowInstance.project({
      x: (reactFlowBounds.width / 2) - 150,
      y: (reactFlowBounds.height / 2) - 100
    });

    const newNode: Node = {
      id: nanoid(),
      type: 'page',
      position,
      data: {
        label: componentId.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        url: `/${componentId}`,
        description: `${componentId.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')} section`,
        components: [componentId]
      }
    };

    setNodes((nds) => [...nds, newNode]);
    toast.success(`Added ${componentId.replace(/-/g, ' ')} component`);
  }, [reactFlowInstance]);

  // Handle drag over
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop
  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const componentId = event.dataTransfer.getData('componentId');
    if (!componentId || !reactFlowWrapper.current) return;

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top
    });

    const newNode: Node = {
      id: nanoid(),
      type: 'page',
      position,
      data: {
        label: componentId.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        url: `/${componentId}`,
        description: `${componentId.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')} section`,
        components: [componentId]
      }
    };

    setNodes((nds) => [...nds, newNode]);
    toast.success(`Added ${componentId.replace(/-/g, ' ')} component`);
  }, [reactFlowInstance]);

  // Save changes
  useEffect(() => {
    if (currentProject && nodes.length > 0) {
      const saveTimeout = setTimeout(() => {
        updateProject(currentProject.id, {
          sitemap_data: { nodes, edges }
        });
      }, 1000);

      return () => clearTimeout(saveTimeout);
    }
  }, [nodes, edges, currentProject]);

  return (
    <div className="h-full flex" ref={reactFlowWrapper}>
      <ComponentLibrary
        isOpen={isComponentLibraryOpen}
        onClose={() => setIsComponentLibraryOpen(false)}
        onAddComponent={onAddComponent}
      />
      
      <div className="flex-1 h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          onDragOver={onDragOver}
          onDrop={onDrop}
          connectionLineType={ConnectionLineType.SmoothStep}
          defaultEdgeOptions={{
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed },
            animated: true,
            style: { stroke: '#3b82f6', strokeWidth: 2 }
          }}
          fitView
          minZoom={0.1}
          maxZoom={1.5}
          snapToGrid={true}
          snapGrid={[20, 20]}
        >
          <Background color="#e5e7eb" gap={20} size={1} />
          <Controls />
          <MiniMap 
            nodeColor="#3b82f6"
            maskColor="rgba(255, 255, 255, 0.8)"
          />
        </ReactFlow>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={[
            {
              label: 'Delete',
              action: () => {
                setNodes((nds) => nds.filter((n) => n.id !== contextMenu.nodeId));
                setContextMenu(null);
              },
            },
          ]}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

export default EditorCanvas;