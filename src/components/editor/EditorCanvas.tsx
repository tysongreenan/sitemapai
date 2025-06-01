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

  // Load initial data
  useEffect(() => {
    if (currentProject?.sitemap_data) {
      const { nodes: savedNodes, edges: savedEdges } = currentProject.sitemap_data;
      setNodes(savedNodes || []);
      setEdges(savedEdges || []);
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

  // Save changes
  useEffect(() => {
    if (currentProject) {
      const saveTimeout = setTimeout(() => {
        updateProject(currentProject.id, {
          sitemap_data: { nodes, edges },
        });
      }, 1000);

      return () => clearTimeout(saveTimeout);
    }
  }, [nodes, edges, currentProject]);

  return (
    <div className="h-full flex">
      <ComponentLibrary
        isOpen={isComponentLibraryOpen}
        onClose={() => setIsComponentLibraryOpen(false)}
        onAddComponent={(componentId) => {
          // Handle adding components
          console.log('Adding component:', componentId);
        }}
      />
      
      <div className="flex-1 h-full">
        <EnhancedToolbar
          projectTitle={currentProject?.title || ''}
          onSave={() => {
            // Handle manual save
          }}
          saveStatus={saveStatus}
          viewMode="sitemap"
          onViewModeChange={() => {}}
          onFitView={() => {}}
          onExport={() => {}}
          onDuplicate={() => {}}
        />
        
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
          defaultEdgeOptions={{
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed },
          }}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
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

// Export component categories for use in other parts of the application
export const componentCategories = {
  navigation: {
    name: 'Navigation',
    icon: 'Menu',
    components: [
      { id: 'navbar', name: 'Navigation Bar', icon: 'Menu', category: 'navigation', preview: 'navbar' },
      { id: 'sidebar', name: 'Sidebar Menu', icon: 'PanelRight', category: 'navigation', preview: 'sidebar' },
      { id: 'breadcrumb', name: 'Breadcrumb', icon: 'ChevronRight', category: 'navigation', preview: 'breadcrumb' },
      { id: 'tabs', name: 'Tab Navigation', icon: 'Layout', category: 'navigation', preview: 'tabs' },
    ],
  },
  // ... rest of the categories remain the same
};

export default EditorCanvas