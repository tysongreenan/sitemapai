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
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import EnhancedToolbar from './EditorToolbar';

import WireframePageNode from './nodes/WireframePageNode';
import PageNode from './nodes/PageNode';
import SectionNode from './nodes/SectionNode';
import ContextMenu from './ContextMenu';
import ComponentLibrary from './ComponentLibrary';

interface EditorCanvasProps {
  projectId: string;
}

const EditorCanvas = ({ projectId }: EditorCanvasProps) => {
  const { getNode } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isComponentLibraryOpen, setIsComponentLibraryOpen] = useState(true);
  const [nodeContextMenu, setNodeContextMenu] = useState<{
    id: string;
    x: number;
    y: number;
    items: Array<{ label: string; action: () => void; icon: React.ReactNode }>;
  } | null>(null);
  
  const handleShowNodeContextMenu = useCallback((nodeId: string, clickPos: { x: number; y: number }) => {
    const node = getNode(nodeId);
    if (!node) return;

    setNodeContextMenu({
      id: nodeId,
      x: clickPos.x,
      y: clickPos.y,
      items: [
        {
          label: 'Add Child Page',
          action: () => handleAddChildPage(nodeId),
          icon: <Plus size={16} />,
        },
        {
          label: 'Duplicate',
          action: () => handleDuplicateNode(nodeId),
          icon: <Copy size={16} />,
        },
        {
          label: 'Delete',
          action: () => handleDeleteNodes([nodeId]),
          icon: <Trash2 size={16} />,
        },
        {
          label: 'Cut',
          action: () => handleCutNodes([nodeId]),
          icon: <Scissors size={16} />,
        },
        {
          label: 'Copy',
          action: () => handleCopyNodes([nodeId]),
          icon: <Clipboard size={16} />,
        },
        {
          label: 'Set as Home Page',
          action: () => handleSetAsHomePage(nodeId),
          icon: <Home size={16} />,
        },
      ],
    });
  }, [getNode]);

  const handleAddComponent = useCallback((componentId: string) => {
    const newNode = {
      id: nanoid(),
      type: 'section',
      position: { x: 100, y: 100 },
      data: { label: componentId },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const handleAddChildPage = useCallback((parentId: string) => {
    // Implementation for adding child page
    console.log('Adding child page to', parentId);
  }, []);

  const handleDuplicateNode = useCallback((nodeId: string) => {
    // Implementation for duplicating node
    console.log('Duplicating node', nodeId);
  }, []);

  const handleDeleteNodes = useCallback((nodeIds: string[]) => {
    // Implementation for deleting nodes
    console.log('Deleting nodes', nodeIds);
  }, []);

  const handleCutNodes = useCallback((nodeIds: string[]) => {
    // Implementation for cutting nodes
    console.log('Cutting nodes', nodeIds);
  }, []);

  const handleCopyNodes = useCallback((nodeIds: string[]) => {
    // Implementation for copying nodes
    console.log('Copying nodes', nodeIds);
  }, []);

  const handleSetAsHomePage = useCallback((nodeId: string) => {
    // Implementation for setting home page
    console.log('Setting as home page', nodeId);
  }, []);

  return (
    <div className="h-full relative flex">
      <ComponentLibrary
        isOpen={isComponentLibraryOpen}
        onClose={() => setIsComponentLibraryOpen(false)}
        onAddComponent={handleAddComponent}
      />
      
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={{
            wireframePage: WireframePageNode,
            page: PageNode,
            section: SectionNode,
          }}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      {nodeContextMenu && (
        <ContextMenu
          x={nodeContextMenu.x}
          y={nodeContextMenu.y}
          items={nodeContextMenu.items}
          onClose={() => setNodeContextMenu(null)}
        />
      )}
    </div>
  );
};

export default EditorCanvas;